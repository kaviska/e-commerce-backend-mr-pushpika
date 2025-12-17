<?php

namespace App\Models;

use App\Enums\PlatformType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Cart extends Model
{
    /** @use HasFactory<\Database\Factories\CartFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'stock_id',
        'quantity',
    ];

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }

    public function itemTotal($type = PlatformType::WEB->value, $withDiscount = true, $cartItem = null)
    {
        // Ensure stock exists
        $stock = $cartItem['stock'] ?? $this->stock;
        if (!$stock) {
            Log::error('Stock not found for cart item', [
                'cartItem' => $cartItem,
                'cart' => $this,
            ]);
            return 0; // Prevent null reference error
        }

        // Ensure $stock is an object, not an array
        if (!is_object($stock)) {
            Log::error('Stock is not an object', [
                'stock' => $stock,
                'cartItem' => $cartItem,
            ]);
            return 0; // Prevent array access issues
        }

        if ($type === PlatformType::WEB) {
            $priceKey = 'web_price';
            $discountKey = 'web_discount';
        } elseif ($type === PlatformType::POS) {
            $priceKey = 'pos_price';
            $discountKey = 'pos_discount';
        } else {
            Log::error('Invalid PlatformType received', ['type' => $type]);
            return 0;
        }

        // Ensure stock has the necessary properties
        if (!isset($stock->$priceKey) || !isset($cartItem['quantity'])) {
            Log::error('Stock does not have the necessary properties line 4', [
                'stock' => $stock,
                'cartItem' => $cartItem,
            ]);
            return 0;
        }

        // Calculate total price
        $total = $stock->$priceKey * $cartItem['quantity'];

        // Apply discount if needed
        if ($withDiscount && isset($stock->$discountKey)) {
            $total -= $total * ($stock->$discountKey / 100);
        }

        return $total;
    }
}
