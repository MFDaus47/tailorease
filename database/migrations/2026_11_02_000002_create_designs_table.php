<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('designs', function (Blueprint $collection) {
            $collection->index('user_id');
            $collection->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('designs');
    }
};
