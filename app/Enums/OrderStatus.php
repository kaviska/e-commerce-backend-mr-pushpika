<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case REFUNDED = 'refunded';
    case FAILED = 'failed';
    case ON_HOLD = 'on_hold';
    case SHIPPED = 'shipped';
    case DELIVERED = 'delivered';
    case RETURNED = 'returned';
    case EXCHANGED = 'exchanged';
    case PARTIALLY_COMPLETED = 'partially_completed';
    case PARTIALLY_REFUNDED = 'partially_refunded';
    case POS='pos';
}
