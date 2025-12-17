<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'user_name',
        'user_email',
        'user_phone',
        'user_type',
        'user_address_id',
        'user_address_line1',
        'user_address_line2',
        'user_country',
        'user_region',
        'user_region_id',
        'user_prefecture',
        'user_prefecture_id',
        'user_city',
        'user_postal_code',
        'subtotal',
        'total_discount',
        'tax',
        'shipping_cost',
        'total',
        'payment_method',
        'payment_id',
        'payment_data',
        'payment_status',
        'paid_amount',
        'currency',
        'due_payment_date',
        'due_payment_amount',
        'send_invoice_status',
        'payment_gateway',
        'order_status',
        'shipping_status',
        'type',
    ];
    protected $casts = [
        'user_id' => 'integer',
        'user_address_id' => 'integer',
        'subtotal' => 'float',
        'total_discount' => 'float',
        'tax' => 'float',
        'shipping_cost' => 'float',
        'total' => 'float',
        'paid_amount' => 'float',
        'due_payment_amount' => 'float',
    ];
    // protected $hidden = [
    //     'created_at',
    //     'updated_at',
    // ];

    /**
     * Define the relationship with OrderItem.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }


    /**
     * Generate a unique order number with format "IY-XXXXXX".
     *
     * @return string
     */
    public static function generateUniqueOrderNumber(): string
    {
        do {
            $randomNumber = mt_rand(100000, 999999);
            $orderNumber = "IY-{$randomNumber}";
        } while (self::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    /**
     * Boot method to automatically set order_number before creating an order.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            $order->order_number = self::generateUniqueOrderNumber();
        });
    }
}
