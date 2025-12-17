<?php

namespace App\Enums;

enum PaymentStatus: string
{
              case PENDING = 'pending';
              case COMPLETED = 'completed';
              case INITIATED = 'initiated';
              case FAILED = 'failed';
              case REFUNDED = 'refunded';
              case DUE_TO_PAY = 'due_to_pay';
              case IN_PROGRESS = 'in_progress';
              case PARTIALLY_COMPLETED = 'partially_completed';
              case PARTIALLY_REFUNDED = 'partially_refunded';
              case CANCELLED = 'cancelled';
              case CHARGEBACK = 'chargeback';
              case DISPUTED = 'disputed';
}
