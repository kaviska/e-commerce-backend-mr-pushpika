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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->string('barcode')->unique()->nullable();
            $table->string('web_availability')->nullable();
            $table->text('description');
            $table->string('primary_image');
            $table->integer('category_id')->references('id')->on('categories');
            $table->integer('brand_id')->references('id')->on('brands');
            $table->foreignId('seller_id')->default(1)->constrained('sellers');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
