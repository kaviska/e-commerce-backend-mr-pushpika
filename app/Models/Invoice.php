<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    /** @use HasFactory<\Database\Factories\InvoiceFactory> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'invoice_number',
        'invoice_url',
        'invoice_sending_status',
        'invoice_date',
        'invoice_due_date',
        'invoice_paid_date',
        'invoice_paid_amount',
        'invoice_paid_status',
        'invoice_paid_method'
    ];
    protected $casts = [
        'order_id' => 'integer',
        'invoice_paid_amount' => 'float',
    ];
    protected $hidden = [
        'created_at',
        'updated_at',
    ];
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }
    public function orderItem()
    {
        return $this->hasOne(OrderItem::class, 'order_id', 'order_id');
    }
}
