<?php

namespace App\Services\PaymentGateways;

interface PaymentGatewayInterface
{
    public function createPayment(array $data): array;
    public function processPayment(array $data): array;
    public function refundPayment(string $paymentId, ?float $amount = null): array;
    public function getPaymentStatus(string $paymentId): array;
    public function getPaymentMethods(?string $customerId = null): array;
}
