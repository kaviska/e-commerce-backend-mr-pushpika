<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderTrack extends Model
{
    /** @use HasFactory<\Database\Factories\OrderTrackFactory> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'tracking_number',
        'tracking_url',
        'tracking_status',
        'tracking_date',
        'tracking_carrier',
        'tracking_carrier_name',
        'tracking_carrier_logo',
        'tracking_carrier_url'
    ];
    protected $casts = [
        'order_id' => 'integer',
        'tracking_date' => 'date',
    ];
    protected $hidden = [
        'created_at',
        'updated_at',
    ];
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
