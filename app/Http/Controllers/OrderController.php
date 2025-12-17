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


class OrderController extends Controller
{
    public $shippingCost = 0;
    public $taxAmount = 0;
    public $subTotal = 0;
    public $totalDiscount = 0;
    public $totalAmount = 0;
    public $isHomeDelivery = false;
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
                $taxAmount = 0;
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
                $guestCart = $cartService->translationGuestCartItems($cartItems, $userId);
                //Reserve stock quantity

                if (!$guestCart['status']) {
                    return Response::error($guestCart['message'], null, 422);
                }


                $cartItems = $guestCart['cartItems'];
                foreach ($cartItems as $cartItem) {

                    $stocks = Stock::find($cartItem['stock_id']);
                    $stocks->addReservedQuantity($cartItem['quantity']);
                }

            }

            //add extra charges for shipping, if payment method is cash on delivery
            if (isset($paymentData['method']) && $paymentData['method'] == PaymentMethod::CASH_ON_DELIVERY->value) {
                $extraCharge = ExtraChargers::CASH_ON_DELIVERY->getChargeRate();
                $this->shippingCost += $extraCharge;

                // special case for home delivery
            } else if (isset($paymentData['method']) && $paymentData['method'] == PaymentMethod::HOME_DELIVERY->value) {
                $this->isHomeDelivery = true;
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
            // return Response::error([
            //     'message' => 'Error placing order: ' . $e->getMessage(),
            // ], null, 500);
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
                $taxAmount = Tax::VAT->getTaxRate();
            }
            $this->subTotal = $cartService->getTotalCartAmount($cartItems, true, 'pos', false, $discount);
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

        // Calculate shipping cost specifically for home delivery
        if ($this->isHomeDelivery) {
            $this->shippingCost = 0;
        } else {
            $this->shippingCost += $this->calculateShippingCost($prefectureId)->shipping_fee;
            Log::info('shipping cost: ', [$this->shippingCost]);
        }
        // Add shipping cost to total amount
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

    /**
     * Add cart items to an order
     */
    private function addOrderItems($orderId, $cartItems, $type)
    {
        try {

            //open database transaction
            DB::beginTransaction();

            foreach ($cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $orderId,
                    'stock_id' => $cartItem['stock']['id'],
                    'product_id' => $cartItem['stock']['product']['id'],
                    'product_name' => $cartItem['stock']['product']['name'],
                    'category_id' => $cartItem['stock']['product']['category_id'],
                    'category' => $cartItem['stock']['product']['category']['name'],
                    'brand_id' => $cartItem['stock']['product']['brand_id'],
                    'brand' => $cartItem['stock']['product']['brand']['name'],
                    'slug' => $cartItem['stock']['product']['slug'],
                    'unit_discount' => $cartItem['stock']['web_discount'],
                    'unit_price' => $type === PlatformType::POS->value ? $cartItem['stock']['pos_price'] : $cartItem['stock']['web_price'],
                    'discount' => $type === PlatformType::POS->value ? $cartItem['stock']['pos_discount'] : $cartItem['stock']['web_discount'],
                    'unit_quantity' => $cartItem['quantity'],
                    'line_total' => (new Cart())->itemTotal(PlatformType::WEB, true, $cartItem),
                ]);
            }

            // Commit the transaction
            DB::commit();
        } catch (\Exception $exception) {
            Log::error('Failed to add order items: ' . $exception->getMessage());
            return Response::error('Failed to add order items: ' . $exception->getMessage(), null, 500);
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
            // Define base validation rules
            $validationRules = [];

            if ($request->filled('order_id')) {
                $validationRules['order_id'] = 'integer|exists:orders,id';
            }

            if ($request->filled('order_number')) {
                $validationRules['order_number'] = 'string';
            }

            if ($request->filled('user_email')) {
                $validationRules['user_email'] = 'email';
            }

            if ($request->filled('order_status')) {
                $validationRules['order_status'] = 'string|in:' . implode(',', array_map(fn($case) => $case->value, OrderStatus::cases()));
            }

            // Validate provided fields if any
            if (!empty($validationRules)) {
                $validatedData = $request->validate($validationRules);
            } else {
                $validatedData = [];
            }

            // Build the query
            $query = Order::with(['orderItems']);

            // Apply filters if they exist in validated data
            if (isset($validatedData['order_id'])) {
                $query->where('id', $validatedData['order_id']);
            }

            if (isset($validatedData['order_number'])) {
                $query->where('order_number', 'like', '%' . $validatedData['order_number'] . '%');
            }

            if (isset($validatedData['user_email'])) {
                $query->where('user_email', $validatedData['user_email']);
            }

            if (isset($validatedData['order_status'])) {
                $query->where('order_status', $validatedData['order_status']);
            }

            // Sort by created_at in ascending order
            $query->orderBy('created_at', 'desc');

            // Execute query - get a single result only if specifically looking for one order by ID
            $result = isset($validatedData['order_id']) ? $query->first() : $query->get();

            // Handle no results for specific order lookup
            if (isset($validatedData['order_id']) && !$result) {
                return Response::error('Order not found', null, 404);
            }

            // Return appropriate response
            $message = isset($validatedData['order_id'])
                ? 'Order details retrieved successfully'
                : 'Order details retrieved successfully';

            return Response::success($result, $message);

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
                ->orderBy('created_at', 'desc')->get();

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
        $order = Order::with([
            'orderItems',
            'orderItems.product',
            'orderItems.stock.variationStocks.variationOption.variation'
        ])->find($request->id);

        Log::info('Order details for printing bill: ', ['order' => $order]);
        $paymentType = $request->payment_type;
        $payingAmount=$request->paying_amount;
        $returnAmount=$request->return_amount;

        return PDF::loadView('pos-bill', compact('order', 'paymentType','payingAmount','returnAmount'))
            ->setPaper([0, 0, 326.77, 'auto']) // Set paper size with auto height for small receipt
            ->stream('barcodes.pdf');
    } catch (\Throwable $th) {
        Log::error('Error printing bill: ' . $th->getMessage());
        return Response::error('Error printing bill: ' . $th->getMessage(), null, 500);
    }
}

  
    public function deleteAllOrdersAndItems()
    {
        try {
            // Truncate OrderItem table
            OrderItem::truncate();
    
            // Truncate Order table
            Order::truncate();
    
            return Response::success(null, 'All orders and order items deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting orders and order items: ' . $e->getMessage());
            return Response::error('Error deleting orders and order items: ' . $e->getMessage(), null, 500);
        }
      
    }


    /**
     * Update order status
     * This method is used to update the status of an order in admin panel
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */

    public function updateStatus(Request $request)
    {
        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'status' => 'required|string|in:' . implode(',', array_map(fn($case) => $case->value, OrderStatus::cases())),
        ]);

        $order = Order::find($request->order_id);
        $order->update(['order_status' => $request->status]);

        return Response::success(null, 'Order status updated successfully');

    }
}
