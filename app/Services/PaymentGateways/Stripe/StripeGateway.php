<?php

namespace App\Services\PaymentGateways\Stripe;

use App\Services\PaymentGateways\AbstractPaymentGateway;
use Stripe\Customer;
use Stripe\EphemeralKey;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;

class StripeGateway extends AbstractPaymentGateway
{
    public function __construct(array $config)
    {
        parent::__construct($config);
        Stripe::setApiKey($this->config['secret_key']);
    }

    public function createPayment(array $data): array
    {
        try {

            $customer = Customer::create([
                'name' => $data['customer']['name'] ?? null,
                'email' => $data['customer']['email'] ?? null,
                'phone' => $data['customer']['phone'] ?? null,
                'description' => $data['description'] ?? null,
            ]);
            // Create a customer object if needed
            $ephemeralKey = EphemeralKey::create([
                'customer' => $customer->id ?? null,
            ], [
                'stripe_version' => '2024-11-20.acacia',
            ]);

            // For JPY, round to the nearest whole number - no decimals allowed
            $amount = ($data['currency'] ?? 'usd') === 'jpy'
                ? (int) round($data['amount'])
                : (int) ($data['amount'] * 100);

            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => $data['currency'] ?? 'usd',
                'metadata' => $data['metadata'] ?? [],
                'customer' => $customer->id ?? null,
                // In the latest version of the API, specifying the `automatic_payment_methods` parameter
                // is optional because Stripe enables its functionality by default.
                'automatic_payment_methods' => [
                    'enabled' => 'true',
                ],
            ]);

            return [
                'success' => true,
                'payment_id' => $paymentIntent->id,
                'paymentIntent' => $paymentIntent->client_secret,
                'ephemeralKey' => $ephemeralKey->secret,
                'customer' => $customer->id,
                'intent' => $paymentIntent,
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'usd',
            ];
        } catch (ApiErrorException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function processPayment(array $data): array
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($data['payment_id']);
            // For Stripe, the payment is confirmed on the client side,
            // so this might just check the status

            return [
                'success' => true,
                'status' => $paymentIntent->status,
                'payment_id' => $paymentIntent->id,
            ];
        } catch (ApiErrorException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function refundPayment(string $paymentId, ?float $amount = null): array
    {
        try {
            $refundData = ['payment_intent' => $paymentId];

            if ($amount !== null) {
                $refundData['amount'] = $amount * 100;
                // Convert to cents
            }

            $refund = \Stripe\Refund::create($refundData);

            return [
                'success' => true,
                'refund_id' => $refund->id,
                'status' => $refund->status,
            ];
        } catch (ApiErrorException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function getPaymentStatus(string $paymentId): array
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentId);

            return [
                'success' => true,
                'status' => $paymentIntent->status,
            ];
        } catch (ApiErrorException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function getPaymentMethods(?string $customerId = null): array
    {
        try {
            if (!$customerId) {
                return [
                    'success' => false,
                    'error' => 'Customer ID is required',
                ];
            }

            $methods = \Stripe\PaymentMethod::all([
                'customer' => $customerId,
                'type' => 'card',
            ]);

            return [
                'success' => true,
                'methods' => $methods->data,
            ];
        } catch (ApiErrorException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
