<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $collection) {
            $collection->index('order_id');
        });

        Schema::create('messages', function (Blueprint $collection) {
            $collection->index('order_id');
        });

        Schema::create('notifications', function (Blueprint $collection) {
            $collection->index('user_id');
            $collection->index('read');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('payments');
    }
};
