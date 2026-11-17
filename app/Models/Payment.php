<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'amount',
        'kind',
        'recorded_by',
    ];

    protected $casts = [
        'amount' => 'float',
    ];
}
