<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'product_id',
        'product_name',
        'sizes',
        'total_quantity',
        'total',
        'deposit',
        'remaining_balance',
        'due_date',
        'notes',
        'has_design',
        'design_file_path',
        'status',
    ];

    protected $casts = [
        'sizes' => 'array',
        'due_date' => 'date',
        'has_design' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
