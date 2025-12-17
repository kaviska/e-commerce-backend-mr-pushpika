<?php

namespace App\Http\Controllers;

use App\Enums\PlatformType;
use App\Enums\UserType;
use App\Helper\Response;
use App\Models\Cart;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use InvalidArgumentException;
use App\Models\DiscountRule;


class PosCartController extends Controller
{

    public $DEFAULT_LIMIT = 10;
    public $DEFAULT_OFFSET = 0;
    public $TAX_RATE = 8;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            //code...
            $validated = $request->validate([
                'user_id' => 'integer',
                'guest_cart' => 'array',
                'guest_cart.*.stock_id' => 'required|exists:stocks,id',
                'guest_cart.*.quantity' => 'required|min:1',

                'with' => 'string|in:all,stock,product',
                'type' => 'string|in:web,pos',
                'with_discount' => 'boolean',
                'type' => 'nullable|string',

                'limit' => 'integer|min:1',
                'offset' => 'integer|min:0',
            ]);



            if ($request->has('user_id')) {
                if (Auth::user()->user_type == UserType::ADMIN) {
                    $userId = $validated['user_id'];
                } else {
                    return Response::error('Unauthorized : 1', 403);
                }
            } else if (Auth::user()) {
                $userId = Auth::user()->id;
            } else if ($request->has('guest_cart')) {
                $userId = null;
            } else {
                return Response::error('Unauthorized : 2', 403);
            }

            $response = [];

            if ($request->has('guest_cart')) {
                $response['cart_items'] = $this->getCartItemsFromGuestCart($request->all(), $request->with ?? 'all', $request->limit ?? $this->DEFAULT_LIMIT, $request->offset ?? $this->DEFAULT_OFFSET);
            } else {
                $response['cart_items'] = $this->getCartItems($userId, $request->with ?? 'none', $request->limit ?? $this->DEFAULT_LIMIT, $request->offset ?? $this->DEFAULT_OFFSET);
            }


            if ($request->has('guest_cart')) {

                if ($request->has('type')) {
                    $response['total_amount'] = $this->getTotalCartAmount($response['cart_items'], false, $request->type ?? PlatformType::POS->value, true);
                    $response['total_with_discounts'] = $this->getTotalCartAmount($response['cart_items'], $request->with_discount ?? true, $request->type ?? PlatformType::POS->value, true);

                    $response["saved_amount"] = (float) number_format($response['total_amount'] - $response['total_with_discounts'], 2);

                    $response['tax_amount'] = 0;
                    $response['total_amount_with_tax'] = $response['total_with_discounts'] + $response['tax_amount'];
                } else {
                    $response['total_amount'] = $this->getTotalCartAmount($response['cart_items'], false, $request->type ?? PlatformType::WEB->value);
                    $response['total_with_discounts'] = $this->getTotalCartAmount($response['cart_items'], $request->with_discount ?? true, $request->type ?? PlatformType::WEB->value);

                    $response["saved_amount"] = (float) number_format($response['total_amount'] - $response['total_with_discounts'], 2);

                    $response['tax_amount'] = $this->getTotalTaxAmount($response['total_with_discounts']);
                    $response['total_amount_with_tax'] = $response['total_with_discounts'] + $response['tax_amount'];
                }
            } else {

                Log::info("test : ", [$response['cart_items']]);
                $response['total_amount'] = $this->getTotalCartAmount($response['cart_items'], false, $request->type ?? PlatformType::WEB->value, true);
                $response['total_with_discounts'] = $this->getTotalCartAmount($response['cart_items'], $request->with_discount ?? true, $request->type ?? PlatformType::WEB->value, true);

                $response["saved_amount"] = (float) number_format($response['total_amount'] - $response['total_with_discounts'], 2);

                $response['tax_amount'] = $this->getTotalTaxAmount($response['total_with_discounts']);
                $response['total_amount_with_tax'] = $response['total_with_discounts'] + $response['tax_amount'];
            }
            // Get discount rules that match the stock ids in the cart
            $stockIds = collect($response['cart_items'])->pluck('stock_id')->unique()->toArray();
            $response['discount_rules'] = DiscountRule::whereIn('stock_id', $stockIds)->get();


            return Response::success($response, 'Cart List fetched successfully');
        } catch (\Throwable $th) {
            //throw $th;
            return Response::error($th->getMessage(), null);
        }
    }

    public function getTotalTaxAmount($amount)
    {
        $taxAmount = 0;
        $taxAmount = $amount * $this->TAX_RATE / 100;
        return round($taxAmount, 2);
    }

    public function getCartItemsFromGuestCart($guestCart, $with = "all", $limit = 10, $offset = 0)
    {

        $validator = validator()->make($guestCart, [
            'guest_cart.*.stock_id' => 'required|exists:stocks,id',
            'guest_cart.*.quantity' => 'required|min:1',
        ]);

        $validated = $validator->validate();


        $withQueryMap = [
            "none" => [],
            "product" => ["product"],
            "all" => ["product", "product.brand", "product.category", "product.taxonomies"],
        ];

        $with = $withQueryMap[$with ?? "all"];

        $cartItems = [];
        $index = 0;
        foreach ($validated['guest_cart'] as $cartItem) {
            $stock = Stock::with($with)->find($cartItem['stock_id']);

            $cartItems[] = [
                'id' => $index++,
                'user_id' => null,
                'stock_id' => $cartItem['stock_id'],
                'quantity' => $cartItem['quantity'],
                'created_at' => now(),
                'updated_at' => now(),
                'stock' => $stock,
            ];
        }
        return $cartItems;
    }

    /**
     * Get the cart items
     * 
     * @param int $userId
     * @param string $with
     */
    public function getCartItems(int $userId, string $with = "all", int $limit = 10, int $offset = 0)
    {
        $withQueryMap = [
            "none" => [],
            "stock" => ["stock"],
            "product" => ["stock.product"],
            "all" => ["stock", "stock.product", "stock.product.brand", "stock.product.category", "stock.product.taxonomies"],
        ];

        $with = $withQueryMap[$with ?? "all"];


        $cartItems = Cart::query();

        if ($userId) {
            $cartItems->where('user_id', $userId);
        }

        if ($with) {
            $cartItems->with($with);
        }

        $cartItems = $cartItems->limit($limit)->offset($offset)->get();

        return $cartItems;
    }

    /**
     * Get the total cart amount
     * 
     * @param string $type
     * @return int
     */


    public function getTotalCartAmount($cartItems, $withDiscount = false, $type = PlatformType::WEB->value, $isGuestCart = false)
    {
        $totalAmount = 0;
        foreach ($cartItems as $cartItem) {
            $priceKey = $type === PlatformType::WEB->value ? 'web_price' : ($type === PlatformType::POS->value ? 'pos_price' : null);
            $discountKey = $type === PlatformType::WEB->value ? 'web_discount' : ($type === PlatformType::POS->value ? 'pos_discount' : null);

            $stockId = $isGuestCart ? $cartItem["stock_id"] : $cartItem->stock_id;
            $quantity = $isGuestCart ? $cartItem["quantity"] : $cartItem->quantity;

            if ($isGuestCart) {
                $itemTotalAmount = $cartItem["stock"][$priceKey] * $quantity;
            } else {
                $itemTotalAmount = $cartItem->stock->$priceKey * $quantity;
            }

            if ($withDiscount) {
                // Apply regular discount first
                if ($isGuestCart) {
                    $itemTotalAmount -= $cartItem["stock"][$discountKey] * $quantity;
                } else {
                    $itemTotalAmount -= $cartItem->stock->$discountKey * $quantity;
                }

                // Apply discount rules based on quantity
                $discountRules = DiscountRule::where('stock_id', $stockId)
                    ->where('min_quantity', '<=', $quantity)
                    ->orderBy('min_quantity', 'desc')
                    ->get();

                foreach ($discountRules as $rule) {
                    if ($quantity >= $rule->min_quantity) {
                        $itemTotalAmount -= $rule->discount * $quantity;
                    }
                }
            }

            $totalAmount += $itemTotalAmount;
        }
        return round($totalAmount, 2);
    }
    // ...existing code...
    public function addToCart(int $stockId, int $quantity, $isReplace = false)
    {
        $cart = Cart::where('user_id', Auth::user()->id)->where('stock_id', $stockId)->first();
        if ($cart) {
            if ($isReplace) {
                $cart->quantity = $quantity;
            } else {
                $cart->quantity += $quantity;
            }
            $cart->save();
        } else {
            $cart = new Cart();
            $cart->user_id = Auth::user()->id;
            $cart->stock_id = $stockId;
            $cart->quantity = $quantity;
            $cart->save();
        }
        return $cart;
    }

    public function removeFromCart($stockId, $quantity = 1)
    {
        $cartItem = Cart::where('user_id', Auth::user()->id)->where('stock_id', $stockId)->first();
        if ($cartItem) {
            $cartItem->quantity -= $quantity;
            if ($cartItem->quantity <= 0) {
                $cartItem->delete();
            } else {
                $cartItem->save();
            }
        }

        return $cartItem;
    }

    public function clearCart($stockId = null)
    {
        if ($stockId) {
            $cartItems = Cart::where('user_id', Auth::user()->id)->where('stock_id', $stockId)->delete();
        } else {
            $cartItems = Cart::where('user_id', Auth::user()->id)->delete();
        }
        return $cartItems;
    }

    public function transitionToCart(Request $request)
    {
        if ($request->has("cart_items")) {
            try {
                $this->translation($request->all());
            } catch (\Throwable $th) {
                return Response::error($th->getMessage(), null);
            }
        }

        return Response::success(null, 'Cart items transitioned successfully');
    }

    public function translation($cartItems)
    {
        $validator = validator()->make($cartItems, [
            'cart_items' => 'required|array',
            'cart_items.*.stock_id' => 'required|exists:stocks,id',
            'cart_items.*.quantity' => 'required|min:1|max:1000',
        ]);

        $validated = $validator->validate();

        foreach ($validated['cart_items'] as $cartItem) {
            $this->addToCart($cartItem['stock_id'], $cartItem['quantity'], true);
        }
    }

    public function translationGuestCartItems($cartItems, $userId)
    {
        // Validate the input data structure
        $validator = Validator::make(['cart_items' => $cartItems], [
            'cart_items' => 'required|array',
            'cart_items.*.stock_id' => 'required|exists:stocks,id',
            'cart_items.*.quantity' => 'required|min:1|max:1000',
        ]);

        // If validation fails, it will automatically throw a ValidationException
        $validated = $validator->validated();

        try {
            DB::beginTransaction();

            foreach ($validated['cart_items'] as $cartItem) {
                $cart = new Cart();
                $cart->user_id = $userId;
                $cart->stock_id = $cartItem['stock_id'];
                $cart->quantity = $cartItem['quantity'];
                $cart->save();
            }

            $cartItemsData = $this->getCartItems($userId, "all");

            DB::commit();

            return [
                'status' => true,
                'cartItems' => $cartItemsData,
            ];
        } catch (\Throwable $th) {
            Log::error("Guest cart items adding error: " . $th->getMessage());
            DB::rollBack();

            return [
                'status' => false,
                'message' => 'Guest cart items adding error: ' . $th->getMessage(),
            ];
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // clear all items from cart validation
        $validated = $request->validate([
            'action' => 'required|string|in:add,remove,clear,clear_all,replace',
        ]);

        if ($validated['action'] == 'clear_all') {
            $this->clearCart();
            return Response::success(null, 'Cart cleared successfully');
        }

        // clear single item from cart validation
        $validated = array_merge($validated, $request->validate([
            'stock_id' => 'required|exists:stocks,id',
        ]));

        if ($validated['action'] == 'clear') {
            return Response::success($this->clearCart($validated['stock_id']), 'Cart item removed successfully');
        }

        // add or update item to cart validation
        $validated = array_merge($validated, $request->validate([
            'quantity' => 'required|min:1|max:1000',
        ]));

        if ($validated['action'] == 'add') {
            return Response::success($this->addToCart($validated['stock_id'], $validated['quantity']), 'Cart item quantity added successfully');
        } else if ($validated['action'] == 'remove') {
            return Response::success($this->removeFromCart($validated['stock_id'], $validated['quantity']), 'Cart item quantity reduced successfully');
        }

        // replace item in cart validation
        if ($validated['action'] == 'replace') {
            return Response::success($this->addToCart($validated['stock_id'], $validated['quantity'], true), 'Cart item replaced successfully');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Cart $cart)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Cart $cart)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cart $cart)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request) {}
}
