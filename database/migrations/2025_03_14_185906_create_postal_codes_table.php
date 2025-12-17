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
        Schema::create('postal_codes', function (Blueprint $table) {
            $table->id();
            $table->string('postal_code', 10)->index();
            $table->string('prefecture_code', 50)->nullable();
            $table->string('city_code', 50)->nullable();
            $table->string('address_detail', 500)->nullable();
            $table->string('prefecture_name_en', 100)->nullable();
            $table->string('city_name_en', 100)->nullable();
            $table->string('additional_info', 500)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('postal_codes');
    }
};
