<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prefecture extends Model
{
    /** @use HasFactory<\Database\Factories\PrefectureFactory> */
    use HasFactory;

    protected $fillable = ['prefecture_name', 'shipping_fee', 'region_id'];

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    protected $casts = [
        'shipping_fee' => 'float',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    // Specify which relations to load by default
    protected $with = ['region'];

    // Customize JSON serialization
    public function toArray()
    {
        $array = parent::toArray();

        // Ensure region is included but only with specific fields
        if (isset($array['region'])) {
            $array['region'] = [
                'id' => $this->region->id,
                'region_name' => $this->region->name
            ];
        }

        return $array;
    }

}
