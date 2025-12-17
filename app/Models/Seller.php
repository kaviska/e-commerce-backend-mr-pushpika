<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{
    /** @use HasFactory<\Database\Factories\SellerFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shop_name',
        'shop_description',
        'shop_logo',
        'shop_banner',
        'shop_address',
        'shop_phone',
        'shop_email',
        'shop_url',
        'status',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'tax_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
