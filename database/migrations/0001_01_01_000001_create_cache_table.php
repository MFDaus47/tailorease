<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Cache documents and locks are written by the MongoDB cache driver.
     * These collections only need to exist so the driver can add its TTL indexes.
     */
    public function up(): void
    {
        Schema::create('cache', function (Blueprint $collection) {
            $collection->index('key');
        });

        Schema::create('cache_locks', function (Blueprint $collection) {
            $collection->index('key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
    }
};
