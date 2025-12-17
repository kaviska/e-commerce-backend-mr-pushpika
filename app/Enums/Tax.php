<?php

namespace App\Enums;

enum Tax
{
    case VAT;
    case GST;
    case PST;
    case HST;
    case QST;
    case JCT;
    case RST;
    case LST;
    case SST;
    case UST;

    public function getTaxRate(): float
    {
        return match ($this) {
            self::VAT => 8.0,
            self::GST => 5.0,
            self::PST => 7.0,
            self::HST => 13.0,
            self::QST => 9.975,
            self::JCT => 10.0,
            self::RST => 6.0,
            self::LST => 8.0,
            self::SST => 4.0,
            self::UST => 3.0,
        };
    }
}
