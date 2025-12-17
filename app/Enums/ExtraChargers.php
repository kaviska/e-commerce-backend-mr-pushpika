<?php
namespace App\Enums;
use Illuminate\Validation\Rules\Enum;

enum ExtraChargers
{
    case CASH_ON_DELIVERY;

    public function getChargeRate(): float
    {
        return match ($this) {
            self::CASH_ON_DELIVERY => 300.0,
        };
    }
}