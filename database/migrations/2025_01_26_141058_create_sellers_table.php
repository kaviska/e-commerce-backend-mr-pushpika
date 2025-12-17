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
        Schema::create('sellers', function (Blueprint $table) {
            $table->id();
            //user id from users
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Seller shop details
            $table->string('shop_name')->unique();
            $table->text('shop_description')->nullable();
            $table->string('shop_logo')->nullable(); // Path to shop logo
            $table->string('shop_banner')->nullable(); // Path to shop banner
            $table->string('shop_address')->nullable();
            $table->string('shop_phone')->unique()->nullable();
            $table->string('shop_email')->unique()->nullable();
            $table->string('shop_url')->nullable(); // Custom shop URL/slug

            // Seller status
            $table->tinyInteger('status')->default(0); // 0: Pending, 1: Active, 2: Suspended, etc.

            // Financial details (optional, could be in a separate table)
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_name')->nullable();
            $table->string('tax_id')->nullable(); // e.g., VAT, GST, SSN, EIN

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sellers');
    }
};
