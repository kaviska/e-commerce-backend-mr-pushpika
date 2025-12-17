<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    /** @use HasFactory<\Database\Factories\AddressFactory> */
    use HasFactory;

    protected $fillable = [
        'country',
        'region_id',
        'user_id',
        'prefecture_id',
        'city',
        'postal_code',
        'address_line_1',
        'address_line_2',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function prefecture()
    {
        return $this->belongsTo(Prefecture::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

   
}
