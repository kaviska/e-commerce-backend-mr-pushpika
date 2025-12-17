<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CREDIT_CARD = 'credit_card';
    case DEBIT_CARD = 'debit_card';
    case CARD = 'card';
    case PAYPAL = 'paypal';
    case BANK_TRANSFER = 'bank_transfer';
    case CASH_ON_DELIVERY = 'cash_on_delivery';
    case BUY_TODAY_PAY_LATER = 'buy_today_pay_later';
    case CRYPTOCURRENCY = 'cryptocurrency';
    case HOME_DELIVERY = 'home_delivery_2';

    public function label(): string
    {
        return match ($this) {
            self::CREDIT_CARD => 'Credit Card',
            self::DEBIT_CARD => 'Debit Card',
            self::CARD => 'Card',
            self::PAYPAL => 'PayPal',
            self::BANK_TRANSFER => 'Bank Transfer',
            self::CASH_ON_DELIVERY => 'Cash on Delivery',
            self::BUY_TODAY_PAY_LATER => 'Buy Today Pay Later',
            self::CRYPTOCURRENCY => 'Cryptocurrency',
            self::HOME_DELIVERY => 'Home Delivery',
        };
    }
}
