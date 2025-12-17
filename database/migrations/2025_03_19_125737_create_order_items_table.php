<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('stock_id');
            $table->string('product_id');
            $table->string('product_name');
            $table->string('category_id')->nullable();
            $table->string('category')->nullable();
            $table->string('brand_id')->nullable();
            $table->string('brand')->nullable();
            $table->string('slug')->nullable();
            $table->float('unit_price');
            $table->float('unit_discount');
            $table->float('unit_quantity')->default(1);
            $table->float('line_total');
            $table->string('status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
