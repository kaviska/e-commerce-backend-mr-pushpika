<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PlaceOrderController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('login');
})->name('home');

Route::get('/login', function () {
    return Inertia::render('login');
})->name('login');
Route::get('/register', function () {
    return Inertia::render('register');
})->name('register');

Route::get('/otp-verification', function () {
    return Inertia::render('otp-verification');
})->name('otp-verification');

Route::get('/seller/register', function () {
    return Inertia::render('seller-register');
})->name('seller.register');

Route::get('/seller/dashboard', function () {
    return Inertia::render('seller-dashboard');
})->name('seller.dashboard');

Route::get('/seller/products/add-existing', function () {
    return Inertia::render('seller/add-existing-product');
})->name('seller.products.add-existing');

Route::get('/seller/products/create', function () {
    return Inertia::render('seller/create-new-product');
})->name('seller.products.create');

Route::get('/seller/products/manage', function () {
    return Inertia::render('seller/manage-products');
})->name('seller.products.manage');

Route::get('/seller/stocks/manage', function () {
    return Inertia::render('seller/manage-stocks');
})->name('seller.stocks.manage');

Route::get('/seller/brands/add', function () {
    return Inertia::render('seller/add-brand');
})->name('seller.brands.add');

Route::get('/seller/brands/manage', function () {
    return Inertia::render('seller/manage-brands');
})->name('seller.brands.manage');

Route::get('/seller/categories/add', function () {
    return Inertia::render('seller/add-category');
})->name('seller.categories.add');

Route::get('/seller/categories/manage', function () {
    return Inertia::render('seller/manage-categories');
})->name('seller.categories.manage');

Route::get('/seller/hero-sliders', function () {
    return Inertia::render('seller/hero-sliders');
})->name('seller.hero-sliders');

Route::get('/seller/notifications', function () {
    return Inertia::render('seller/notifications');
})->name('seller.notifications');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// 🏙️ Handles both authenticated and guest users
Route::middleware(['auth'])->group(function () {
    Route::get('/address', [AddressController::class, 'getAddress'])->name('address.get');
    Route::post('/address', [AddressController::class, 'storeOrUpdateAddress'])->name('address.store');
    Route::delete('/address/{addressId}', [AddressController::class, 'deleteAddress'])->name('address.delete');
    Route::put('/address/{addressId}/default', [AddressController::class, 'setDefaultAddress'])->name('address.default');
});

//🪪 Admin APIs
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::get('/is-logged', [AdminAuthController::class, 'isLogin']);
    Route::get('/logout', [AdminAuthController::class, 'logout']);
    Route::post('/register', [AdminAuthController::class, 'register']);


    //get all orders
    Route::get('/orders', [OrderController::class, 'getOrderDetails'])->name('orders.get');
});


Route::middleware(['auth'])->group(function () {
    // Admin get users details
    Route::get('/users', [UserController::class, 'index'])->name('users.get');
});

##🤞sample code using permission middleware
// Route::group(['middleware' => ['custom.permission:admin-permission']], function () {
//     Route::post('users', [UserController::class, 'store'])->name('users.store');
// });




// test 🧪
Route::get('/sandbox', function () {
    return Inertia::render('sandbox');
})->name('sandbox');

Route::get('/single-product', function () {
    return Inertia::render('single-product');
})->name('single-product');

Route::get('/cart', function () {
    return Inertia::render('cart');
})->name('cart');

// Checkout routes
Route::get('/checkout/step1', function () {
    return Inertia::render('checkout/step1');
})->name('checkout.step1');

Route::get('/checkout/step2', function () {
    return Inertia::render('checkout/step2');
})->name('checkout.step2');

Route::get('/checkout/step3', function () {
    return Inertia::render('checkout/step3');
})->name('checkout.step3');

Route::get('/home', function () {
    return Inertia::render('home');
})->name('home');

Route::get('/categories', function () {
    return Inertia::render('categories');
})->name('categories');

Route::get('/products', function () {
    return Inertia::render('product');
})->name('products');

Route::get('/product/{slug}', function ($slug) {
    return Inertia::render('product-details', ['slug' => $slug]);
})->name('product-details');

Route::get('/orders', function () {
    return Inertia::render('orders');
})->name('orders');

Route::get('/orders/{orderId}', function ($orderId) {
    return Inertia::render('order-details', ['orderId' => (int)$orderId]);
})->name('order-details');

Route::get('/wishlist', function () {
    return Inertia::render('wishlist');
})->name('wishlist');


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
