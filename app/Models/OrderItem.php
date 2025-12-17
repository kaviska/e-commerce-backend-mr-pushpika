<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\OrderItemFactory> */
    use HasFactory;


    protected $fillable = [
        'order_id',
        'stock_id',
        'product_id',
        'product_name',
        'category_id',
        'category',
        'brand_id',
        'brand',
        'slug',
        'unit_price',
        'unit_discount',
        'unit_quantity',
        'line_total'
    ];
    protected $casts = [
        'order_id' => 'integer',
        'stock_id' => 'integer',
        'product_id' => 'integer',
        'unit_price' => 'float',
        'unit_discount' => 'float',
        'unit_quantity' => 'float',
        'line_total' => 'float',
    ];
    protected $hidden = [
        'created_at',
        'updated_at',
    ];
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

}
