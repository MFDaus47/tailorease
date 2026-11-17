<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stickers', function (Blueprint $collection) {
            $collection->unique('slug');
            $collection->index('category');
            $collection->index('active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stickers');
    }
};
