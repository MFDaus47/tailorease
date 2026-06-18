<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('orders');

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->string('product_id')->nullable();
            $table->string('product_name');
            $table->json('sizes');
            $table->integer('total_quantity');
            $table->decimal('total', 12, 2);
            $table->decimal('deposit', 12, 2);
            $table->decimal('remaining_balance', 12, 2)->nullable();
            $table->date('due_date');
            $table->text('notes')->nullable();
            $table->boolean('has_design')->default(false);
            $table->string('design_file_path')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
