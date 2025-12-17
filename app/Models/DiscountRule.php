<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscountRule extends Model
{
    /** @use HasFactory<\Database\Factories\DiscountRuleFactory> */
    use HasFactory;

    protected $fillable = [
        'stock_id',
        'min_quantity',
        'discount',
    ];

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }
}
