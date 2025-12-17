<?php

namespace App\Http\Controllers;

use App\Enums\ExtraChargers;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PlatformType;
use App\Models\OrderItem;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use App\Helper\Response;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Prefecture;
use App\Models\Stock;
use App\Services\AddressService;
use Illuminate\Support\Facades\Log;
use App\Services\TaxCalcService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use App\Enums\Tax;
use UnitEnum;
use Barryvdh\DomPDF\Facade\Pdf as PDF;


class PosOrderController extends Controller
{
    public $shippingCost = 0;
    public $taxAmount = 0;
    public $subTotal = 0;
    public $totalDiscount = 0;
    public $totalAmount = 0;
    /**
     * Place an order
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function placeOrder(Request $request)
    {
        try {



            $cartItems = $request->input('cart_items', []);
            $userData = $request->input('userData', []);
            $paymentData = $request->input('paymentData', []);

            //getthe type
            if ($request->has('type')) {

                $orderType = $request->input('type');
                $discount = $request->input('discount', 0);
                $shippingCost = $request->input('shipping_cost', 0);
                $taxAmount = $request->input('tax_amount', 0);
            } else {
                $orderType = 'web';
                $discount = 0;
                $shippingCost = 0;
                $taxAmount = null;
            }

            // Validate and process user address
            $addressService = new AddressService();
            $addressResult = $addressService->storeOrUpdate($userData);

            if (isset($addressResult['errors'])) {
                return Response::error($addressResult['errors'], null, 422);
            }

            // Check if address is created successfully
            $userId = $addressResult['user']['id'];
            // dd($userId);
            if (empty($userId)) {
                return Response::error('Failed to create address', null, 422);
            }

            $existingCarts = DB::table('carts')->where('user_id', $userId)->get();

            if ($existingCarts->isNotEmpty()) {
                DB::table('carts')->where('user_id', $userId)->delete();
                Log::info('Deleted all carts associated with user ID: ' . $userId);
            }




            // Retrieve cart items if empty (for logged-in users)
            if (empty($cartItems)) {
                $cartItems = (new CartController())->getCartItems($userId, 'all');
                // Reserve stock quantity

                foreach ($cartItems as $cartItem) {

                    $stocks = Stock::find($cartItem['stock_id']);
                    $stocks->addReservedQuantity($cartItem['quantity']);
                }

                if (empty($cartItems)) {
                    return Response::error('Cart is empty', null, 422);
                }
            } else {
                // Handle guest cart items
                $cartService = new CartController();

                // Store custom discounts before translation
                $customDiscounts = [];
                foreach ($cartItems as $cartItem) {
                    if (isset($cartItem['custom_discount'])) {
                        $customDiscounts[$cartItem['stock_id']] = $cartItem['custom_discount'];
                    }
                }

                $guestCart = $cartService->translationGuestCartItems($cartItems, $userId);
                //Reserve stock quantity

                if (!$guestCart['status']) {
                    return Response::error($guestCart['message'], null, 422);
                }
                foreach ($cartItems as $cartItem) {
                    //return Response::error($cartItem['stock_id']);

                    $stocks = Stock::find($cartItem['stock_id']);
                    $stocks->addReservedQuantity($cartItem['quantity']);
                }

                $cartItems = $guestCart['cartItems'];

                // Re-add custom discounts to translated cart items
                foreach ($cartItems as &$cartItem) {
                    $stockId = $cartItem['stock']['id'];
                    if (isset($customDiscounts[$stockId])) {
                        $cartItem['custom_discount'] = $customDiscounts[$stockId];
                    }
                }
                unset($cartItem); // Break reference
            }

            //add extra charges for shipping, if payment method is cash on delivery
            if (isset($paymentData['method']) && $paymentData['method'] == PaymentMethod::CASH_ON_DELIVERY->value) {
                $extraCharge = ExtraChargers::CASH_ON_DELIVERY->getChargeRate();
                $this->shippingCost += $extraCharge;
            }

            Log::info('cart items: ', [$cartItems]);
            // Calculate Order Amounts

            $this->calculateOrderAmounts($cartItems, $addressResult['address']['prefecture_id'], $orderType, $shippingCost, $taxAmount, $discount);

            // Create Order

            $order = $this->createOrder($userId, $addressResult, $cartItems, $paymentData, $orderType);

            // Check if order creation was successful
            if (!$order['success']) {
                return Response::error($order['error'], null, 422);
            }

            // Add Order Items
            Log::info('Adding order items: ', [$cartItems]);
            Log::info('Order Type', [$orderType]);
            Log:info('Cart Item Example', [$cartItems[0]]);
            $this->addOrderItems($order['order']->id, $cartItems, $orderType);


            // Process Payment
            $paymentResponse = (new PaymentService())->processPayment([
                'order_id' => $order['order']->id,
                'user_name' => $addressResult['user']['name'],
                'user_email' => $addressResult['user']['email'],
                'user_phone' => $addressResult['user']['mobile'],
                'user_type' => $addressResult['user']['user_type'],
                'payment_method' => $paymentData['method'] ?? (PaymentMethod::CARD instanceof UnitEnum ? PaymentMethod::CARD->value : PaymentMethod::CARD),
                'payment_gateway' => $paymentData['gateway'] ?? null,
                'currency' => $paymentData['currency'] ?? 'jpy',
                'due_payment_date' => $paymentData['due_payment_date'] ?? null,
                'amount' => $this->totalAmount,
            ]);

            // Check if payment was successful
            if (!$paymentResponse['status']) {
                return Response::error($paymentResponse['message'], null, 422);
            }

            // delete cart items
            Cart::where('user_id', $userId)->delete();

            //release reserved quantity and clear stock quantity
            foreach ($cartItems as $cartItem) {
                $stocks = Stock::find($cartItem['stock_id']);
                $stocks->clearStockQuantity($cartItem['quantity']);
            }

            // Update Order with Payment Details
            return Response::success([
                'address' => $addressResult['address'],
                'user' => $addressResult['user'],
                'payment' => $paymentResponse,
            ], 'Order placed successfully');
        } catch (\Exception $e) {
            Log::error('Error placing order: ' . $e->getMessage(), [
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);
            Cart::where('user_id', $userId)->delete();

            return Response::error([
                'message' => 'Error placing order: ' . $e->getMessage(),
            ], null, 500);
        }
    }

    /**
     * Calculate order amounts including subtotal, tax, discount, and shipping cost.
     *
     * @param int $prefectureId
     */
    private function calculateOrderAmounts($cartItems, int $prefectureId, $orderType, $shippingCost = 0, $taxAmount = 0, $discount = 0)
    {
        $cartService = new CartController();
        $taxService = new TaxCalcService();

        if ($orderType == 'pos') {
            if ($taxAmount == 0) {
                $taxAmount = 0;
            }
            if ($discount > 0) {
                $this->subTotal = $cartService->getTotalCartAmount($cartItems, true, 'pos', false) - $discount;
            } else {
                $this->subTotal = $cartService->getTotalCartAmount($cartItems, true, 'pos', false);
            }
            $subTotalWithoutDiscount = $cartService->getTotalCartAmount($cartItems, false, 'pos');
            $this->totalDiscount = $subTotalWithoutDiscount - $this->subTotal;
            $this->taxAmount = $taxService->calculateTax($this->subTotal, false, $taxAmount);
            $this->totalAmount = $taxService->calculateTax($this->subTotal, true, $taxAmount);
            $this->shippingCost = $shippingCost;

            $this->totalAmount += $this->shippingCost;




            return;
        }

        $this->subTotal = $cartService->getTotalCartAmount($cartItems, true);
        Log::info('subTotal: ', [$this->subTotal]);

        $subTotalWithoutDiscount = $cartService->getTotalCartAmount($cartItems, false);

        $this->totalDiscount = $subTotalWithoutDiscount - $this->subTotal;
        Log::info('totalDiscount: ', [$this->totalDiscount]);

        $this->taxAmount = $taxService->calculateTax($this->subTotal, false);
        Log::info('tax amount: ', [$this->taxAmount]);

        $this->totalAmount = $taxService->calculateTax($this->subTotal, true);
        Log::info('total amount: ', [$this->totalAmount]);

        $this->shippingCost += $this->calculateShippingCost($prefectureId)->shipping_fee;
        Log::info('shipping cost: ', [$this->shippingCost]);

        $this->totalAmount += $this->shippingCost;
        Log::info('total amount with shipping: ', [$this->totalAmount]);
    }

    /**
     * Create an order with given data
     */
    private function createOrder($userId, $addressResult, $cartItems, $paymentData, $orderType)
    {
        try {

            Log::info('Creating order with data: ', [
                'userId' => $userId,
                'addressResult' => $addressResult,
                'cartItems' => $cartItems,
                'paymentData' => $paymentData,
                'orderType' => $orderType,
            ]);

            // Validate due_payment_date
            if (!empty($paymentData['due_date'])) {
                $dueDate = Carbon::parse($paymentData['due_date']);
                if ($dueDate->isPast()) {
                    return [
                        'success' => false,
                        'message' => 'Due date must be in the future',
                        'error' => 'Due date must be in the future',
                        'line' => __LINE__,
                        'file' => __FILE__,
                    ];
                }
            }

            //open database transaction
            DB::beginTransaction();

            $order = Order::create([
                'user_id' => $userId,
                'user_name' => $addressResult['user']['name'],
                'user_email' => $addressResult['user']['email'],
                'user_phone' => $addressResult['user']['mobile'],
                'user_type' => $addressResult['user']['user_type'],
                'user_address_id' => $addressResult['address']['id'],
                'user_address_line1' => $addressResult['address']['address_line_1'],
                'user_address_line2' => $addressResult['address']['address_line_2'],
                'user_country' => $addressResult['address']['country'],
                'user_region' => $addressResult['address']['region']['name'],
                'user_region_id' => $addressResult['address']['region_id'],
                'user_prefecture' => $addressResult['address']['prefecture']['prefecture_name'],
                'user_prefecture_id' => $addressResult['address']['prefecture_id'],
                'user_city' => $addressResult['address']['city'],
                'user_postal_code' => $addressResult['address']['postal_code'],
                'subtotal' => $this->subTotal,
                'total_discount' => $this->totalDiscount,
                'tax' => $this->taxAmount,
                'shipping_cost' => $this->shippingCost,
                'total' => $this->totalAmount,
                'payment_method' => $paymentData['method'] ?? PaymentMethod::CARD->label(),
                'payment_status' => PaymentStatus::IN_PROGRESS,
                'paid_amount' => $paymentData['amount'] ?? null,
                'currency' => $paymentData['currency'] ?? 'JPY',
                'due_payment_date' => $paymentData['due_date'] ?? null,
                'due_payment_amount' => $this->totalAmount ?? 0,
                'order_status' => $orderType === 'pos' ? OrderStatus::POS->value : OrderStatus::PENDING->value,
                'type' => $orderType,
            ]);

            Log::info('Order created successfully: ', [$order->type]);


            // Commit the transaction
            DB::commit();

            return [
                'success' => true,
                'order' => $order,
                'message' => 'Order created successfully',
                'error' => null,
                'line' => null,
                'file' => null,
            ];
        } catch (\Exception $exception) {
            // Rollback the transaction if there is an error
            DB::rollBack();
            Log::error('Failed to create order: ' . $exception->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to create order: ' . $exception->getMessage(),
                'error' => $exception->getMessage(),
                'line' => $exception->getLine(),
                'file' => $exception->getFile(),
            ];
        }
    }

    
    private function addOrderItems($orderId, $cartItems, $type)
    {
        try {
            //open database transaction
            DB::beginTransaction();
    
            Log::info('type from add order items: ', [$type]);
            Log::info('pos discount: ', [$cartItems[0]['stock']['pos_discount']]);
            Log::info('web discount: ', [$cartItems[0]['stock']['web_discount']]);
    
            foreach ($cartItems as $cartItem) {
                $stockId = $cartItem['stock']['id'];
                $quantity = $cartItem['quantity'];
                
                // Get base discount based on platform type
                $baseDiscount = $type === PlatformType::POS->value ? 
                    $cartItem['stock']['pos_discount'] : 
                    $cartItem['stock']['web_discount'];
                
                // Calculate quantity-based discount from discount rules
                $quantityDiscount = $this->calculateQuantityDiscount($stockId, $quantity);
                
                // Get custom discount from cart item (if exists)
                $customDiscount = isset($cartItem['custom_discount']) && $quantity > 0
                    ? ($cartItem['custom_discount'] / $quantity)
                    : 0;
                
                // Total discount is base discount plus quantity discount plus custom discount
                $totalUnitDiscount = $baseDiscount + $quantityDiscount + $customDiscount;
                
                Log::info('Discount calculation: ', [
                    'stock_id' => $stockId,
                    'quantity' => $quantity,
                    'base_discount' => $baseDiscount,
                    'quantity_discount' => $quantityDiscount,
                    'custom_discount' => $customDiscount,
                    'total_unit_discount' => $totalUnitDiscount
                ]);
    
                OrderItem::create([
                    'order_id' => $orderId,
                    'stock_id' => $stockId,
                    'product_id' => $cartItem['stock']['product']['id'],
                    'product_name' => $cartItem['stock']['product']['name'],
                    'category_id' => $cartItem['stock']['product']['category_id'],
                    'category' => $cartItem['stock']['product']['category']['name'],
                    'brand_id' => $cartItem['stock']['product']['brand_id'],
                    'brand' => $cartItem['stock']['product']['brand']['name'],
                    'slug' => $cartItem['stock']['product']['slug'],
                    'unit_discount' => $totalUnitDiscount,
                    'unit_price' => $type === PlatformType::POS->value ? $cartItem['stock']['pos_price'] : $cartItem['stock']['web_price'],
                    'discount' => $totalUnitDiscount * $quantity, // Total discount for the line
                    'unit_quantity' => $quantity,
                    'line_total' => (new Cart())->itemTotal(PlatformType::WEB, true, $cartItem),
                ]);
            }
    
            // Commit the transaction
            DB::commit();
        } catch (\Exception $exception) {
            DB::rollBack();
            Log::error('Failed to add order items: ' . $exception->getMessage());
            return Response::error('Failed to add order items: ' . $exception->getMessage(), null, 500);
        }
    }
    
    /**
     * Calculate quantity-based discount from discount rules
     *
     * @param int $stockId
     * @param int $quantity
     * @return float
     */
    private function calculateQuantityDiscount($stockId, $quantity)
    {
        try {
            // Get the highest applicable discount rule for the given quantity
            $discountRule = DB::table('discount_rules')
                ->where('stock_id', $stockId)
                ->where('min_quantity', '<=', $quantity)
                ->orderBy('min_quantity', 'desc')
                ->first();
            
            if ($discountRule) {
                Log::info('Applied discount rule: ', [
                    'stock_id' => $stockId,
                    'min_quantity' => $discountRule->min_quantity,
                    'discount' => $discountRule->discount,
                    'actual_quantity' => $quantity
                ]);
                
                return $discountRule->discount;
            }
            
            return 0;
        } catch (\Exception $exception) {
            Log::error('Error calculating quantity discount: ' . $exception->getMessage());
            return 0;
        }
    }
    /**
     * Calculate shipping cost based on prefecture ID
     *
     * @param int $prefecture_id
     */
    private function calculateShippingCost(int $prefecture_id)
    {
        return Prefecture::where('id', $prefecture_id)->firstOrFail(
            ['shipping_fee']
        );
    }

    /**
     * Update order status
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateOrderStatus(Request $request)
    {
        //validate request
        try {
            $validatedData = $request->validate([
                'order_id' => 'required|integer|exists:orders,id',
                'status' => 'required|string',
                'isCreateInvoice' => 'required|boolean',
                'isSendInvoice' => 'required|boolean',
            ]);

            $paymentService = new PaymentService();
            $afterPayment = $paymentService->afterPayment(
                $validatedData['order_id'],
                $validatedData['status'],
            );

            if (!$afterPayment['success']) {
                Response::error(
                    $afterPayment['message'],
                    null,
                    422
                );
            }

            //invoice controller
            $invoiceController = new InvoiceController();

            //check is create invoice is true
            if ($validatedData['isCreateInvoice']) {
                //create invoice
                $invoiceResponse = $invoiceController->makeInvoice(
                    $validatedData['order_id'],
                );

                if (!$invoiceResponse['success']) {
                    return Response::error(
                        $invoiceResponse['message'],
                        null,
                        422
                    );
                }
                //send invoice
                if ($validatedData['isSendInvoice']) {
                    $sendInvoiceResponse = $invoiceController->sendInvoice(
                        $invoiceResponse['invoice']['id'],
                    );

                    if (!$sendInvoiceResponse['success']) {
                        return Response::error(
                            $sendInvoiceResponse['message'],
                            null,
                            422
                        );
                    }
                }
            }
            //update order status
            return Response::success(
                null,
                'Order status updated successfully'
            );
        } catch (\Illuminate\Validation\ValidationException $validationException) {
            Log::error(
                'Validation error',
                [
                    'errors' => $validationException->errors(),
                    'line' => $validationException->getLine(),
                    'file' => $validationException->getFile(),
                    'request' => $validationException->validator->failed(),
                ]
            );
            return Response::error(
                $validationException->errors(),
                null,
                422
            );
        } catch (\Exception $exception) {
            Log::error('Error updating order status: ' . $exception->getMessage());
            return Response::error(
                'Error updating order status: ' . $exception->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Get order details
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrderDetails(Request $request)
    {
        try {
            if ($request->has('order_id')) {
                $validatedData = $request->validate([
                    'order_id' => 'required|exists:orders,order_number',
                ]);

                $order = Order::with(['orderItems'])->where('order_number', $validatedData['order_id'])->first();

                if (!$order) {
                    return Response::error('Order not found', null, 404);
                }

                return Response::success($order, 'Order details retrieved successfully');
            } else {
                $orders = Order::with(['orderItems'])->get();
                return Response::success($orders, 'All order details retrieved successfully');
            }
        } catch (\Illuminate\Validation\ValidationException $validationException) {
            Log::error('Validation error: ' . $validationException->getMessage());
            return Response::error(
                $validationException->errors(),
                null,
                422
            );
        } catch (\Exception $exception) {
            Log::error('Error retrieving order details: ' . $exception->getMessage());
            return Response::error(
                'Error retrieving order details: ' . $exception->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Get orders by user ID
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */

    public function getOrdersByUserId(Request $request)
    {
        try {
            // Check if user_id is passed in the request, else use authenticated user ID
            $userId = $request->has('user_id')
                ? $request->validate(['user_id' => 'required|integer|exists:users,id'])['user_id']
                : $request->user()->id;

            // Retrieve orders for the given user ID
            $orders = Order::with(['orderItems'])
                ->where('user_id', $userId)
                ->get();

            // Check if orders exist
            if ($orders->isEmpty()) {
                return Response::error('No orders found for this user', null, 404);
            }

            return Response::success($orders, 'Orders retrieved successfully');
        } catch (\Illuminate\Validation\ValidationException $validationException) {
            Log::error('Validation error: ' . $validationException->getMessage());
            return Response::error(
                $validationException->errors(),
                null,
                422
            );
        } catch (\Exception $exception) {
            Log::error('Error retrieving orders: ' . $exception->getMessage());
            return Response::error(
                'Error retrieving orders: ' . $exception->getMessage(),
                null,
                500
            );
        }
    }

    public function printBill(Request $request)
    {

        try {
            $order = Order::with(['orderItems'])->find($request->id);
            Log::info('Order details for printing bill: ', ['order' => $order]);

            //return $order;
            return PDF::loadView('pos-bill', compact('order'))
                ->setPaper([0, 0, 326.77, 651.77]) // Set paper size for small receipt
                ->stream('barcodes.pdf');
        } catch (\Throwable $th) {
            Log::error('Error printing bill: ' . $th->getMessage());
            return Response::error('Error printing bill: ' . $th->getMessage(), null, 500);
        }
    }


     
    public function handlePosOrderReturn(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'return_items' => 'required|array',
            'return_items.*.stock_id' => 'required|exists:stocks,id',
            'return_items.*.quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
            'user_id' => 'nullable|exists:users,id',
        ]);
    
        try {
            DB::beginTransaction();
    
            $order = Order::with(['orderItems.stock.product'])->find($validated['order_id']);
            $returnItems = [];
            $totalReturnAmount = 0;
            $subtotalReduction = 0;
    
            foreach ($validated['return_items'] as $item) {
                $stockId = $item['stock_id'];
                $returnQuantity = $item['quantity'];
    
                // Update Stock Quantity (restock returned items)
                $stock = Stock::with('product')->find($stockId);
                $stock->quantity += $returnQuantity;
                $stock->save();
    
                // Find the order item to get price/discount
                $orderItem = $order->orderItems->where('stock_id', $stockId)->first();
                
                if (!$orderItem) {
                    throw new \Exception("Order item not found for stock ID: {$stockId}");
                }
    
                // Validate return quantity doesn't exceed order quantity
                if ($returnQuantity > $orderItem->unit_quantity) {
                    throw new \Exception("Return quantity ({$returnQuantity}) exceeds order quantity ({$orderItem->unit_quantity}) for stock ID: {$stockId}");
                }
    
                $unitPrice = $orderItem->unit_price;
                $unitDiscount = $orderItem->unit_discount;
                $unitLineTotal = ($unitPrice - $unitDiscount);
                $returnLineTotal = $unitLineTotal * $returnQuantity;
                
                $totalReturnAmount += $returnLineTotal;
                $subtotalReduction += $returnLineTotal;
    
                // Update or delete order item
                $remainingQuantity = $orderItem->unit_quantity - $returnQuantity;
                
                if ($remainingQuantity == 0) {
                    // Delete the order item if quantity becomes 0
                    $orderItem->delete();
                } else {
                    // Update the order item with remaining quantity and new line total
                    $orderItem->update([
                        'unit_quantity' => $remainingQuantity,
                        'line_total' => $unitLineTotal * $remainingQuantity
                    ]);
                }
    
                // Create return log
                DB::table('pos_orders_return')->insert([
                    'order_id' => $validated['order_id'],
                    'stock_id' => $stockId,
                    'quantity' => $returnQuantity,
                    'user_id' => $validated['user_id'] ?? '4',
                    'reason' => $validated['reason'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
    
                $returnItems[] = [
                    'product_name' => $stock->product->name ?? '',
                    'stock_id' => $stockId,
                    'quantity' => $returnQuantity,
                    'unit_price' => $unitPrice,
                    'unit_discount' => $unitDiscount,
                    'line_total' => $returnLineTotal,
                ];
            }
    
            // Update order totals
            $newSubtotal = $order->subtotal - $subtotalReduction;
            
            // Recalculate tax based on new subtotal
            $taxService = new TaxCalcService();
            $newTaxAmount = $taxService->calculateTax($newSubtotal, false);
            $newTotal = $newSubtotal + $newTaxAmount + $order->shipping_cost;
    
            // Update the order
            $order->update([
                'subtotal' => $newSubtotal,
                'tax' => $newTaxAmount,
                'total' => $newTotal,
                'due_payment_amount' => $newTotal
            ]);
    
            DB::commit();
    
            // Prepare data for the bill
            $billData = [
                'order' => $order->fresh(), // Get updated order data
                'return_items' => $returnItems,
                'total_return_amount' => $totalReturnAmount,
                'reason' => $validated['reason'] ?? null,
                'returned_at' => now(),
            ];
    
            // Return the PDF bill
            return PDF::loadView('return-bill', $billData)
                ->setPaper([0, 0, 326.77, 651.77])
                ->stream('return-bill.pdf');
    
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('POS return error: ' . $th->getMessage());
            return Response::error('Failed to process return: ' . $th->getMessage(), 500);
        }
    }
    // ...existing code...
    public function delete(Request $request)
    {
        $validatedData = $request->validate([
            'id' => 'required|integer|exists:orders,id'
        ]);

        $order = Order::find($validatedData['id']);
        if ($order) {
            $order->delete();
            return  Response::success($order, 'Order deleted successfully');;
        } else {
            return Response::error('Order not found', null, 404);
        }
    }
}
