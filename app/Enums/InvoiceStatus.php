<?php

namespace App\Enums;
use Illuminate\Validation\Rules\Enum;

enum InvoiceStatus: string
{
    case PREPARED = 'prepared';
    case SENT = 'sent';
    case PENDING = 'pending';
    case PAID = 'paid';
    case OVERDUE = 'overdue';
    case CANCELLED = 'cancelled';
}