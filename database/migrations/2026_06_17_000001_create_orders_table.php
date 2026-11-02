<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $collection) {
            $collection->index('customer_id');
            $collection->index('product_id');
            $collection->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
