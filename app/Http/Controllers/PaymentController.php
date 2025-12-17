<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Services\PaymentService;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function createPayment(Request $request)
    {
       // Validate incoming request data
        $paymentData = [
            'amount' => $request->input('amount'),
            'currency' => $request->input('currency', 'usd'),
            'metadata' => [
                // 'user_id' => auth()->id(),
                'order_id' => $request->input('order_id'),
            ],
        ];

        $result = $this->paymentService->processPayment($paymentData);
        return response()->json($result);
    }

    public function processWebhook(Request $request, $gateway)
    {
        // Switch based on gateway
        switch ($gateway) {
            case 'stripe':
                return $this->handleStripeWebhook($request);
            case 'paypal':
                return $this->handlePayPalWebhook($request);
            default:
                return response()->json(['error' => 'Unsupported gateway'], 400);
        }
    }

    protected function handleStripeWebhook(Request $request)
    {
        // Implement Stripe webhook handling
    }

    protected function handlePayPalWebhook(Request $request)
    {
        // Implement PayPal webhook handling
    }
}
