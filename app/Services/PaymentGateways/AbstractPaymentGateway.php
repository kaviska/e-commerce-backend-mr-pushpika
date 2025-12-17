<?php

namespace App\Services\PaymentGateways;

abstract class AbstractPaymentGateway implements PaymentGatewayInterface
{
    protected $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    // Common methods can be implemented here
    public function validateAmount(float $amount): bool
    {
        return $amount > 0;
    }
}
