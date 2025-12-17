<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostalCode extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'postal_code',
        'prefecture_code',
        'city_code',
        'address_detail',
        'prefecture_name_en',
        'city_name_en',
        'additional_info',
    ];

    /**
     * Find addresses by postal code (Exact Match).
     *
     * @param string $postalCode
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function findByPostalCode(string $postalCode)
    {
        return self::where('postal_code', 'LIKE',  $postalCode . "%")->get();
    }

    /**
     * Find addresses by prefecture name (Case-Insensitive).
     *
     * @param string $prefecture
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function findByPrefecture(string $prefecture)
    {
        return self::whereRaw('UPPER(prefecture_name_en) LIKE UPPER(?)', ["%" . strtoupper($prefecture) . "%"])->get();
    }

    /**
     * Find addresses by city name (Case-Insensitive).
     *
     * @param string $city
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function findByCity(string $city)
    {
        return self::whereRaw('UPPER(city_name_en) LIKE UPPER(?)', ["%" . strtoupper($city) . "%"])->get();
    }
}
