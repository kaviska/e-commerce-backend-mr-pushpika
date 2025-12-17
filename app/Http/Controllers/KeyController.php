<?php
namespace App\Http\Controllers;

class KeyController extends Controller
{
    public function getStripPublishableKey()
    {
        // Get the Stripe publishable key from the environment variable
        $stripePublishableKey = env('STRIPE_PUBLISHABLE_KEY', 'your_default_publishable_key_here');

        // Return the key as a JSON response
        return response()->json([
            'stripe_publishable_key' => $stripePublishableKey,
        ]);
    }
}