<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\ApiAuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\KeyController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PlaceOrderController;
use App\Http\Controllers\PosOrderController;
use App\Http\Controllers\PostalCodeController;
use App\Http\Controllers\PosCartController;
use App\Http\Controllers\PrefectureController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Settings\CustomProfileController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TaxonomyController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VariationController;
use App\Http\Controllers\VariationOptionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DeletController;
use App\Http\Controllers\HeroSliderController;


// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


// Business Components API
// FEATURE : Product Feature
// 🏷️ Categories
Route::resource('/categories', CategoryController::class);
Route::delete('/categories', [CategoryController::class, 'destroy']);
Route::post('/categories/update', [CategoryController::class, 'update']); // update method : POST used due to image uploading

// ⚜️ Brands
Route::resource('/brands', BrandController::class);
Route::delete('/brands', [BrandController::class, 'destroy']);
Route::post('/brands/update/{id}', [BrandController::class, 'update']);

// 🔖 Taxonomies
Route::resource('/taxonomies', TaxonomyController::class);
Route::delete('/taxonomies', [TaxonomyController::class, 'destroy']);
Route::put('/taxonomies', [TaxonomyController::class, 'update']);

// 📦 Products
Route::resource('/products', ProductController::class);
Route::post('/add/products', [ProductController::class, 'store']);
Route::delete('/products', [ProductController::class, 'destroy']);
Route::post('/products/update', [ProductController::class, 'update']); // update method : POST used due to image uploading

//route for handle multiple product
Route::post('/products/multipleStock', [ProductController::class, 'multipleStockHandler']);

// 🌟 Reviews
Route::get('/products/{id}/reviews', [App\Http\Controllers\ReviewController::class, 'index']);
Route::middleware('auth:sanctum')->post('/reviews', [App\Http\Controllers\ReviewController::class, 'store']);

// 🎠 Hero Sliders
Route::resource('/hero-sliders', HeroSliderController::class);
Route::delete('/hero-sliders', [HeroSliderController::class, 'destroy']);
Route::post('/hero-sliders/update', [HeroSliderController::class, 'update']);

// =============================

// FEATURE : Stock Feature
// 🏷️ Variations
Route::resource('/variations', VariationController::class);
Route::delete('/variations', [VariationController::class, 'destroy']);
Route::put('/variations', [VariationController::class, 'update']);

// 🏷️ Variation Options
Route::resource('/variation-options', VariationOptionController::class);
Route::delete('/variation-options', [VariationOptionController::class, 'destroy']);
Route::put('/variation-options', [VariationOptionController::class, 'update']);
Route::get('/variation-options-for-delete', [VariationOptionController::class, 'getVariationForDelete']);


// 🏷️ Stocks
Route::resource('/stocks', StockController::class);
Route::delete('/stocks', [StockController::class, 'destroy']);
Route::put('/stocks', [StockController::class, 'update']);
Route::put('/stocks-quantity', [StockController::class, 'editQuantity']);
Route::post('/stocks/print-label', [StockController::class, 'printLabels']);
Route::get('bar-code-type', [StockController::class, 'BarcodeType']);
Route::get('/all-stocks', [StockController::class, 'allStock']);
Route::get('/clear-reserve', [StockController::class, 'recerveQuanityClear']);
Route::post('/pos-stocks-update', [StockController::class, 'posStockUpdate']);

// Route::get('/stocks-test', [StockController::class, 'test']);

// 📦 Carts
Route::middleware('auth:sanctum')->group(function () {
    Route::resource('/carts', CartController::class);
    Route::post('/translate-to-cart', [CartController::class, 'transitionToCart']);
});

Route::resource('/guest_carts', CartController::class);
Route::resource('/pos-guest_carts', PosCartController::class);


// =======================================================================================================//

// Notice and Notifications
// 🔔 Notice
Route::resource('/notices', NoticeController::class);
Route::delete('/notices', [NoticeController::class, 'destroy']);
Route::post('/notices/update', [NoticeController::class, 'update']);

// 🔔 Notification
Route::get('/notifications', [NotificationController::class, 'index'])->middleware('auth:sanctum');
Route::get('/notifications/mark-as-read', [NotificationController::class, 'markAsRead'])->middleware('auth:sanctum');

// =======================================================================================================//

// FEATURE : User Feature
// ✈️Auth APIs
Route::post('/register', [ApiAuthController::class, 'register']);
Route::post('/login', [ApiAuthController::class, 'login']);
Route::get('/is-logged', [ApiAuthController::class, 'isLogin']);
Route::post('/forgot-password', [ApiAuthController::class, 'forgotPassword']);

// 👤 Admin User Creation
Route::post('/users/admin', [UserController::class, 'createAdminUser']);



// Guest User
Route::post('/create-guest/user', [ApiAuthController::class, 'guestUser']);

//🔏 Authenticated User
Route::middleware('auth:sanctum')->group(function () {
    // authenticated user routes
    Route::get('/logout', [ApiAuthController::class, 'logout']);
    Route::post('/verify-otp', [ApiAuthController::class, 'verifyOtp']);
    Route::put('/resend-otp', [ApiAuthController::class, 'resendOtp']);
    Route::post('/reset-password', [ApiAuthController::class, 'resetPassword']);

    Route::post('/auto-login', [ApiAuthController::class, 'autoSignIn']);
});

//check user data is changed or not
Route::post('/check-user-data', [ApiAuthController::class, 'checkUserData']);

// Seller Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/seller/register', [\App\Http\Controllers\SellerController::class, 'register']);
    Route::get('/seller/details', [\App\Http\Controllers\SellerController::class, 'getSellerDetails']);
});

// Handles both authenticated and guest users
Route::prefix('v1')->group(function () {
    //Routes that require authentication
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/shipping-data', [AddressController::class, 'getAddress']);
        Route::delete('/shipping-data/{addressId}', [AddressController::class, 'deleteAddress']);
        Route::put('/shipping-data', [AddressController::class, 'updateShippingData']);
        Route::post('/shipping-data', [AddressController::class, 'storeShippingData']);

        // Get order data by user id
        Route::get('/orders', [OrderController::class, 'getOrdersByUserId']);

        // Delete user account
        Route::delete('/delete-account', [UserController::class, 'removeUser']);
        Route::put('/user-update', [UserController::class, 'update']);

        //change password
        Route::put('/change-password', [ApiAuthController::class, 'changePassword']);
    });
    //user profile
    Route::put('/profile', [CustomProfileController::class, 'update']);
    Route::delete('/profile', [CustomProfileController::class, 'deleteAccountPermanently']);
});

Route::get('/test', [TestController::class, 'testOrder'])->name('test');
Route::post('/place-order', [OrderController::class, 'placeOrder']);

// 📩 Shipping data routes
Route::get('/regions', [RegionController::class, 'index']);
Route::get('/prefectures', [PrefectureController::class, 'index']);
Route::get('/postal-data', [PostalCodeController::class, 'index']);
Route::get('/postal-data-by', [PostalCodeController::class, 'showAllPostalCodesBy']);

//get stripe publishable key
Route::get('/stripe-key', [KeyController::class, 'getStripPublishableKey']);

// Payment route
Route::put('/update/order-status', [OrderController::class, 'updateOrderStatus']);

// User Orders route
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/orders', [OrderController::class, 'getOrdersByUserId']);
});

//suppliers routes
Route::resource('/suppliers', SupplierController::class);
Route::delete('/suppliers', [SupplierController::class, 'destroy']);


//Admin APIs
Route::prefix('admin')->group(function () {
    //get all orders
    Route::get('/orders', [OrderController::class, 'getOrderDetails']);
    //update order status
    Route::put('/update/order-status', [OrderController::class, 'updateStatus']);
});
//pos orders
Route::prefix('admin')->group(function () {
    Route::get('/pos-orders', [PosOrderController::class, 'getOrderDetails']);
    //handlePosOrderReturn
    Route::post('order-return', [PosOrderController::class, 'handlePosOrderReturn']);
});

Route::delete('/pos-sales-delete', [PosOrderController::class, 'delete']);

// Admin routes
Route::group(['prefix' => 'admin', 'middleware' => ['auth:sanctum', 'admin']], function () {
    // temp : user remove 
    Route::get('/remove-user', [UserController::class, 'delete']);
});


//get all users
Route::get('/users', [UserController::class, 'index']);

Route::post('/pos-print-bill', [OrderController::class, 'printBill']);


Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/is-logged', [AdminAuthController::class, 'isLogin']);
    Route::get('/logout', [AdminAuthController::class, 'logout']);



    //get all orders
    // Route::get('/orders', [OrderController::class, 'getOrderDetails'])->name('orders.get');
});

Route::prefix('admin')->group(function () {

    Route::post('/register', [AdminAuthController::class, 'register']);
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::delete('', [AdminAuthController::class, 'delete']);

    Route::get('', [AdminAuthController::class, 'load']);
    //deleteff

});

Route::prefix('reports')->group(function () {
    Route::post('/sales', [ReportController::class, 'generateSalesReport']);
    Route::post('/products', [ReportController::class, 'generateProductReport']);
    Route::post('/stocks', [ReportController::class, 'generateStockReport']);
    Route::get('/pie-chart', [ReportController::class, 'pieChart']);
    Route::get('/bar-chart', [ReportController::class, 'barChart']);
    Route::get('/line-chart', [ReportController::class, 'lineChart']);
    Route::get('alert-table', [ReportController::class, 'getStocksExceedingAlertQuantity']);
    //calcuator
    Route::get('/calcuator', [ReportController::class, 'calcuator']);
});

//
Route::post('/report/order-invoice', [ReportController::class, 'generateOrderInvoice']);


Route::post('/pos-place-order', [PosOrderController::class, 'placeOrder']);

//this api route is  used tohanndle multiple stock multipleStockHandler
Route::get('/multiple-stock', [ProductController::class, 'multipleStockHandler']);

//temp product
Route::get('/temp-product', [ProductController::class, 'tempProduct']);

//deleteAllOrdersAndItems
//Route::delete('/delete-all-orders-and-items', [OrderController::class, 'deleteAllOrdersAndItems']);


// Route to delete all users except the first two
Route::get('/delete-all-except-first-two-users', [DeletController::class, 'deleteAllExceptFirstTwo']);

// Route to delete all orders where type is 'pos' and their items
Route::get('/delete-orders-pos', [DeletController::class, 'deleteOrdersWhereTypeIsPos']);

// Route to delete all orders where type is NOT 'pos' and their items
Route::get('/delete-orders-not-pos', [DeletController::class, 'deleteOrdersWhereTypeIsNotPos']);
