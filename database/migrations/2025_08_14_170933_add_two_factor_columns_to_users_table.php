<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Two-factor fields live on the user document. MongoDB does not alter columns.
     */
    public function up(): void
    {
        //
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
