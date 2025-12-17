<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function testOrder(Request $request)
    {

        // Validate the incoming request
        $validated = $request->validate([
            'user_id' =>  'integer',
        ]);
        $cartController = new CartController();
        $cartItems = $cartController->getCartItems($validated['user_id'], 'all');

        // dd($cartItems);
        // return 
        $total = $cartController->getTotalCartAmount($cartItems, true);

        return Response::success([
            'cart_items' => $cartItems,
            'total_with_discounts' => $total
        ], 'Order placed successfully');
    }
}
