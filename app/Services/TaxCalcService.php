<?php

namespace App\Services;

use App\Enums\Tax;


class TaxCalcService
{
    /**
     * Calculate tax based on the given amount and tax rate.
     *
     * @param float $subTotal
     * @param bool $withAmount
     * @param mixed $taxRate
     * @return float
     */
    public function calculateTax(float $subTotal, bool $withAmount = false, $taxRate = null): float
    {
        if ($taxRate === null) {
            $taxRate = Tax::VAT->getTaxRate();
        }

        if ($withAmount) {
            $tax = ($subTotal * $taxRate) / 100;
            $subTotalWithTax = $subTotal + $tax;
            return (int) round($subTotalWithTax);
        } else {

            $tax = ($subTotal * $taxRate) / 100;
            return (int) round($tax);
        }
    }
}
