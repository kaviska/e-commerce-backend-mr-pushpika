<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'login', 'sanctum/csrf-cookie'], // Added 'login' for your specific issue

    'allowed_methods' => ['*'], // Allow all methods (GET, POST, PUT, DELETE, OPTIONS)


'allowed_origins' => [
    'http://localhost:3000', // Replace with your frontend URL if
    'https://iy-mart-pos.vercel.app',
    'https://iy-mart-web.vercel.app',
    'https://www.iymart.jp',
    'https://pos.iymart.jp',
    'http://localhost:9001',
    'https://theme.gigantoo.com',
],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'], // Explicitly allow 'Authorization'

    'exposed_headers' => ['Authorization'], // Expose Authorization header if needed

    'max_age' => 0,

    'supports_credentials' => true, // Change to true if using authentication cookies (e.g., Laravel Sanctum)

];