<?php

namespace App\Enums;

enum PaymentGateways: string
{
              case STRIPE = 'stripe';
              case PAYPAL = 'paypal';
              case RAZORPAY = 'razorpay';
              case PAYSTACK = 'paystack';
              case FLUTTERWAVE = 'flutterwave';
              case PAYMONGO = 'paymongo';
              case MIDTRANS = 'midtrans';
              case MOLPAY = 'molpay';
              case PAYONEER = 'payoneer';
              case SQUARE = 'square';
              case PAY_HERE = 'pay_here';
              case WORLD_PAY = 'world_pay';
}
