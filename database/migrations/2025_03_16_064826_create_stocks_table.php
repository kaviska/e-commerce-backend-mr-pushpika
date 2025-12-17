<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products');
            $table->integer('quantity')->default(0);
            $table->double('web_price')->default(0);
            $table->double('pos_price')->default(0);
            $table->double('web_discount')->default(0);
            $table->double('pos_discount')->default(0);
            $table->double('cost')->default(0);
            $table->double('alert_quantity')->default(20);
            // Some MySQL versions don't accept CURRENT_DATE as a default for DATE columns.
            // Make the column nullable and handle defaults in application logic (or use a TIMESTAMP with useCurrent()).
            $table->date('purchase_date')->nullable();
            $table->string('barcode')->nullable();
            
        
           
            $table->foreignId('seller_id')->default(1)->constrained('sellers');

            $table->integer('reserved_quantity')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
