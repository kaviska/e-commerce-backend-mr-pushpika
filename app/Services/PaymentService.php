<?php

namespace App\Services;

use App\Enums\PaymentGateways;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Stock;
use App\Services\PaymentGateways\PaymentGatewayInterface;
use App\Services\PaymentGateways\Stripe\StripeGateway;
use App\Services\PaymentGateways\PayPal\PayPalGateway;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Enum;
use InvalidArgumentException;

class PaymentService
{
    /**
     * Available payment gateways
     *
     * @var array
     */
    protected $gateways = [];

    /**
     * Default payment gateway
     *
     * @var string
     */
    protected $defaultGateway;

    /**
     * PaymentService constructor.
     */
    public function __construct()
    {
        $this->registerGateways();
        $this->defaultGateway = config('payment.default_gateway', PaymentGateways::STRIPE->value);
    }

    /**
     * Register all available payment gateways.
     *
     * @return void
     */
    protected function registerGateways(): void
    {
        // Register Stripe
        $this->gateways[PaymentGateways::STRIPE->value] = new StripeGateway([
            'secret_key' => config('payment.gateways.stripe.secret_key'),
            'publishable_key' => config('payment.gateways.stripe.publishable_key'),
            'webhook_secret' => config('payment.gateways.stripe.webhook_secret'),
        ]);

        //=========================================================================================//
        //* Example of registering other gateways
        // Register PayPal
        // $this->gateways[PaymentGateways::PAYPAL->value] = new PayPalGateway([
        //               'client_id' => config('payment.gateways.paypal.client_id'),
        //               'client_secret' => config('payment.gateways.paypal.client_secret'),
        //               'environment' => config('payment.gateways.paypal.environment', 'sandbox'),
        // ]);
        //=========================================================================================//

        //====================================================================================//
        //* Register other gateways in a similar manner
        //* This approach allows for dynamic loading of gateways based on configuration

        //* You would add similar initialization for all other payment gateways
        //* For brevity, I've only shown a few examples
        //=====================================================================================//
    }

    /**
     * Get a specific payment gateway instance.
     * @param string|null $name Gateway name
     * @return PaymentGatewayInterface
     * @throws InvalidArgumentException
     */
    public function gateway(?string $name = null): PaymentGatewayInterface
    {
        $gateway = $name ?: $this->defaultGateway;

        if (!isset($this->gateways[$gateway])) {
            throw new InvalidArgumentException("Payment gateway [{$gateway}] is not supported.");
        }

        return $this->gateways[$gateway];
    }

    /**
     * Process the payment for an order.
     * @param array $orderData Order details including payment method and gateway.
     * @return array Response containing payment status and message.
     */
    public function processPayment(array $orderData): array
    {
        // // Step 1: Validate the incoming order data
        $validator = Validator::make($orderData, [
            'order_id' => 'required|exists:orders,id',
            'user_name' => 'required|string|max:255',
            'user_email' => 'required|email|max:255',
            'user_phone' => 'required|string|max:20',
            'payment_method' => [
                'required',
                new Enum(PaymentMethod::class),
            ],
            'payment_gateway' => ['nullable', 'string'],
            'currency' => 'required|string|size:3',
            'amount' => 'required|numeric|min:0',
        ]);

        Log::info('validator payment service : ===================================== line 116');

        // Return validation errors if any
        if ($validator->fails()) {
            return ['errors' => $validator->errors()];
        }
        
        Log::info('validator payment service : ===================================== line 121');


        // Step 2: Determine the selected payment method
        $paymentMethod = PaymentMethod::tryFrom($orderData['payment_method']);
    

        // dd($paymentMethod);

        if (!$paymentMethod) {
            return ['error' => 'Invalid payment method.'];
        }

        // Step 3: If the payment method does not require a gateway, simply update the database
        if (
            in_array($paymentMethod, [
                PaymentMethod::BANK_TRANSFER,
                PaymentMethod::CASH_ON_DELIVERY,
                PaymentMethod::BUY_TODAY_PAY_LATER,
                PaymentMethod::HOME_DELIVERY,
            ])
        ) {
            return $this->updateOrderStatus($orderData['order_id'], $paymentMethod->label());
        }

        // Step 4: Determine the payment gateway (default to STRIPE if not provided)
        $gatewayName = $orderData['payment_gateway'] ?? PaymentGateways::STRIPE->value;
        $paymentGateway = PaymentGateways::tryFrom($gatewayName);

        if (!$paymentGateway) {
            return ['error' => 'Invalid payment gateway.'];
        }

        // Step 5: Process payment through the selected gateway
        try {
            // Get the gateway instance
            $gateway = $this->gateway($paymentGateway->value);

            // Prepare payment data for the gateway
            $paymentData = [
                'order_id' => $orderData['order_id'],
                'amount' => $orderData['amount'],
                'currency' => $orderData['currency'],
                'customer' => [
                    'name' => $orderData['user_name'],
                    'email' => $orderData['user_email'],
                    'phone' => $orderData['user_phone'],
                ],
                'metadata' => [
                    'order_id' => $orderData['order_id'],
                ],
            ];

            // Create payment through the gateway
            $result = $gateway->createPayment($paymentData);

            if (!$result['success']) {
                return [
                    'status' => false,
                    'message' => $result['error'] ?? 'Payment processing failed.',
                    'order_id' => $orderData['order_id'],
                ];
            }

            // Update order with payment information
            $updatedOrderDetails = $this->updateOrderWithPaymentInfo(
                $orderData['order_id'],
                $paymentMethod->label(),
                $paymentGateway->value,
                $result
            );

            return [
                'status' => true,
                'message' => 'Payment initiated successfully.',
                'payment_id' => $result['payment_id'] ?? null, // payment ID from the gateway
                'paymentIntent' => $result['paymentIntent'] ?? null, //client_secret
                'ephemeralKey' => $result['ephemeralKey'] ?? null, // ephemeral key for Stripe
                'customer' => $result['customer'] ?? null,
                'amount' => $orderData['amount'],
                'order_id' => $orderData['order_id'],
                'order_details' => $updatedOrderDetails['order_details'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Payment Gateway Error: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Payment processing failed: ' . $e->getMessage(),
                'order_id' => $orderData['order_id'],
            ];
        }
    }

    /**
     * Update order status in the database.
     * @param int $orderId Order ID.
     * @param string $paymentMethod Payment method used.
     * @return array Response data.
     */
    private function updateOrderStatus(int $orderId, string $paymentMethod): array
    {
        try {
            // Database transaction
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);
            $order->update([
                'payment_status' => PaymentStatus::PENDING,
                'payment_method' => $paymentMethod,
            ]);

            // Commit the transaction
            DB::commit();
            return [
                'status' => true,
                'order' => $order,
            ];
        } catch (\Exception $exception) {
            // Rollback the transaction in case of an error
            DB::rollBack();
            Log::error('Payment processing failed: ' . $exception->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to process payment: ' . $exception->getMessage(),
                'order_id' => $orderId,
            ];
        }
    }

    /**
     * Update order with payment information from the gateway.
     * @param int $orderId Order ID.
     * @param string $paymentMethod Payment method.
     * @param string $paymentGateway Payment gateway.
     * @param array $paymentResult Payment result from gateway.
     * @return bool Success status.
     */
    private function updateOrderWithPaymentInfo(
        int $orderId,
        string $paymentMethod,
        string $paymentGateway,
        array $paymentResult
    ): array {
        try {
            DB::beginTransaction();

            // Find the order by ID and update it with payment information
            $order = Order::findOrFail($orderId);
            $order->update([
                'payment_status' => PaymentStatus::INITIATED,
                'payment_method' => $paymentMethod,
                'due_payment_amount' => $paymentResult['amount'] ?? null,
                'paid_amount' => 0,
                'currency' => $paymentResult['currency'] ?? null,
                'payment_gateway' => $paymentGateway,
                'payment_id' => $paymentResult['payment_id'] ?? null,
                'payment_data' => json_encode($paymentResult),
            ]);
            DB::commit();
            return [
                'status' => true,
                'order_details' => $order,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update order with payment info: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update order with payment info: ' . $e->getMessage(),
                'order_id' => $orderId,
            ];
        }
    }

    /**
     * Process a payment webhook.
     * @param string $gateway Gateway name.
     * @param array $data Webhook data.
     * @return array Response.
     */
    public function processWebhook(string $gateway, array $data): array
    {
        try {
            $gatewayInstance = $this->gateway($gateway);

            // Handle the webhook based on the gateway
            // This would typically verify the payment status and update the order

            // You would implement specific webhook handling logic here
            // For now, we'll return a generic success response

            return [
                'success' => true,
                'message' => 'Webhook processed successfully.',
            ];
        } catch (\Exception $e) {
            Log::error('Webhook processing failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to process webhook: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get payment status for an order.
     * @param int $orderId Order ID.
     * @return array Payment status information.
     */
    public function getPaymentStatus(int $orderId): array
    {
        try {
            $order = Order::findOrFail($orderId);

            // If the order has no payment gateway (e.g., COD), return the current status
            if (empty($order->payment_gateway) || empty($order->payment_id)) {
                return [
                    'success' => true,
                    'status' => $order->payment_status,
                    'method' => $order->payment_method,
                    'gateway' => $order->payment_gateway ?? 'none',
                ];
            }

            // Otherwise, check with the gateway for the latest status
            $gateway = $this->gateway($order->payment_gateway);
            $result = $gateway->getPaymentStatus($order->payment_id);

            // Update the order status if needed
            if ($result['success'] && isset($result['status'])) {
                // Map gateway status to your application's payment status
                // This would be gateway-specific logic

                // Example logic (would need to be customized):
                $newStatus = match ($result['status']) {
                    'succeeded', 'captured', 'completed' => PaymentStatus::COMPLETED->value,
                    'pending', 'processing' => PaymentStatus::PENDING->value,
                    'failed', 'canceled' => PaymentStatus::FAILED->value,
                    default => $order->payment_status,
                };

                if ($newStatus !== $order->payment_status) {
                    $order->update(['payment_status' => $newStatus]);
                }

                return [
                    'success' => true,
                    'status' => $newStatus,
                    'gateway_status' => $result['status'],
                    'method' => $order->payment_method,
                    'gateway' => $order->payment_gateway,
                ];
            }

            return [
                'success' => false,
                'message' => $result['error'] ?? 'Failed to get payment status.',
                'current_status' => $order->payment_status,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get payment status: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to get payment status: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Refund a payment.
     * @param int $orderId Order ID.
     * @param float|null $amount Amount to refund (null for full refund).
     * @return array Refund result.
     */
    public function refundPayment(int $orderId, ?float $amount = null): array
    {
        try {
            $order = Order::findOrFail($orderId);

            // Check if the order can be refunded
            if (empty($order->payment_gateway) || empty($order->payment_id)) {
                return [
                    'success' => false,
                    'message' => 'This payment cannot be refunded.',
                ];
            }

            // Process the refund through the appropriate gateway
            $gateway = $this->gateway($order->payment_gateway);
            $result = $gateway->refundPayment($order->payment_id, $amount);

            // Update order status if refund was successful
            if ($result['success']) {
                $order->update([
                    'payment_status' => $amount ? PaymentStatus::PARTIALLY_REFUNDED->value : PaymentStatus::REFUNDED->value,
                    'refund_id' => $result['refund_id'] ?? null,
                    'refund_data' => json_encode($result),
                    'refunded_amount' => $amount ?? $order->amount,
                ]);

                return [
                    'success' => true,
                    'message' => 'Payment refunded successfully.',
                    'refund_id' => $result['refund_id'] ?? null,
                    'order_id' => $orderId,
                ];
            }

            return [
                'success' => false,
                'message' => $result['error'] ?? 'Failed to process refund.',
                'order_id' => $orderId,
            ];
        } catch (\Exception $e) {
            Log::error('Payment refund failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to process refund: ' . $e->getMessage(),
                'order_id' => $orderId,
            ];
        }
    }

    /**
     * Change the order status after the payment is completed.
     * @param int $orderId Order ID.
     * @param string $status New status to set.
     * @return array Response data.
     * @throws \Exception
     */
    public function afterPayment(int $orderId, string $status): array
    {
        try {

            $validStatus = array_column(PaymentStatus::cases(), 'value');

            //validate the order and status
            $validator = Validator::make(['order_id' => $orderId, 'status' => $status], [
                'order_id' => 'required|exists:orders,id',
                'status' => 'required|string|in:' . implode(',', $validStatus),
            ]);

            if ($validator->fails()) {
                return [
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()->toArray(),
                    'order_id' => $orderId,
                ];
            }
  
            //open the transaction
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            // Convert the string status to the enum instance
            $statusEnum = PaymentStatus::from($status);

            // Update the order status
            $order->payment_status = $statusEnum->value;

            //get the order due payment amount and assign it to the paid amount
            if ($statusEnum->value === PaymentStatus::COMPLETED->value) {
                $order->paid_amount = $order->due_payment_amount;
                $order->due_payment_amount = 0;
            } elseif ($statusEnum->value === PaymentStatus::FAILED->value) {
                $order->paid_amount = 0;
                $order->due_payment_amount = $order->total;

                //find related order items and update the stock quantity
                foreach ($order->orderItems as $item) {
                    Stock::where('id', $item->stock_id)->increment('quantity', $item->unit_quantity);
                }

            }

            $order->save();
            //commit the transaction
            DB::commit();

            return [
                'success' => true,
                'message' => 'Order status updated successfully.',
                'order_id' => $orderId,
                'status' => $statusEnum->value,
            ];

        } catch (\Exception $e) {
            // Rollback the transaction in case of an error
            DB::rollBack();
            Log::error('Failed to update order status: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage(),
                'order_id' => $orderId,
            ];
        }
    }
}
