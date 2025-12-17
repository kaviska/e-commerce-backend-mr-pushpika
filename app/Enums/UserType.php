<?php

namespace App\Enums;

enum UserType: string
{
    case ADMIN = 'admin';
    case REGISTERED = 'registered';
    case GUEST = 'guest';
}
