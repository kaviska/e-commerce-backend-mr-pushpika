<?php
namespace App\Services;
class ShippingService
{
    /**
     * Calculate shipping cost based on the given amount and shipping rate.
     *
     * @param float $subTotal
     * @param bool $withAmount
     * @param mixed $shippingRate
     * @return float
     */
    public function calculateShipping(float $subTotal, bool $withAmount = false, $shippingRate = 0): float
    {
        if ($withAmount) {
            return $subTotal + $shippingRate;
        } else {
            return $shippingRate;
        }
    }
}
