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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('invoice_number')->unique();
            $table->string('invoice_url')->nullable();
            $table->string('invoice_sending_status')->nullable();
            $table->string('invoice_date')->nullable();
            $table->string('invoice_due_date')->nullable();
            $table->string('invoice_paid_date')->nullable();
            $table->float('invoice_paid_amount')->default(
                0.00
            )->nullable();
            $table->string('invoice_paid_status')->nullable();
            $table->string('invoice_paid_method')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
