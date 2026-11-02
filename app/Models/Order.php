<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use MongoDB\Laravel\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'product_id',
        'product_name',
        'order_name',
        'sizes',
        'total_quantity',
        'total',
        'deposit',
        'remaining_balance',
        'due_date',
        'notes',
        'has_design',
        'design_file_path',
        'items',
        'status',
    ];

    protected $attributes = [
        'status' => 'pending',
        'has_design' => false,
    ];

    protected $casts = [
        'due_date' => 'date',
        'has_design' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}
