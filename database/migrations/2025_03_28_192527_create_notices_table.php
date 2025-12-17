<?php

use App\Enums\NoticeStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('description');
            $table->string('image');
            $table->string('link');
            $table->string('section');
            $table->string('button_text')->nullable();
            $table->string('additional_field_1')->nullable();
            $table->string('additional_field_2')->nullable();
            $table->string('additional_field_3')->nullable();
            $table->string('additional_field_4')->nullable();
            $table->string('status')->default('active');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notices');
    }
};
