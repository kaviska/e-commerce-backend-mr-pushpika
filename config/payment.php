<?php

return [
              'default_gateway' => env('PAYMENT_GATEWAY', 'stripe'),

              'gateways' => [
                            'stripe' => [
                                          'secret_key' => env('STRIPE_SECRET_KEY'),
                                          'publishable_key' => env('STRIPE_PUBLISHABLE_KEY'),
                                          'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
                            ],

                            'paypal' => [
                                          'client_id' => env('PAYPAL_CLIENT_ID'),
                                          'client_secret' => env('PAYPAL_CLIENT_SECRET'),
                                          'environment' => env('PAYPAL_ENVIRONMENT', 'sandbox'), // sandbox or live
                            ],

                            // Add other gateways as needed
              ],
];