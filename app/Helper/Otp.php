<?php

namespace App\Helper;

use App\Models\User;

class Otp
{
    public function generate(): string
    {
        do {
            $otp = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (User::where('otp', $otp)->exists());

        return $otp;
    }
}
