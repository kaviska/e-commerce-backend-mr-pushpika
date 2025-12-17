<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->integer('user_id');
            $table->string('user_name');
            $table->string('user_email');
            $table->string('user_phone');
            $table->string('user_type')->nullable();
            $table->integer('user_address_id');
            $table->string('user_address_line1');
            $table->string('user_address_line2')->nullable();
            $table->string('user_country');
            $table->string('user_region');
            $table->integer('user_region_id');
            $table->string('user_prefecture');
            $table->string('user_prefecture_id');
            $table->string('user_city');
            $table->string('user_postal_code');
            $table->string('subtotal');
            $table->string('total_discount')->nullable();
            $table->string('tax')->nullable();
            $table->string('shipping_cost');
            $table->string('total');
            $table->string('payment_method');
            $table->string('payment_status');
            $table->string('paid_amount')->nullable();
            $table->string('currency')->nullable();
            $table->string('due_payment_date')->nullable();
            $table->string('due_payment_amount')->nullable();
            $table->string('send_invoice_status')->nullable();
            $table->string('payment_gateway')->nullable();
            $table->string('payment_id')->nullable();
            $table->string('payment_data')->nullable();
            $table->string('order_status');
            $table->string('shipping_status')->nullable();
            $table->string('type')->default('web');
          
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
