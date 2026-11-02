<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'category',
        'image_path',
        'base_price',
        'available',
        'rating',
    ];

    protected $attributes = [
        'available' => true,
        'rating' => 0.0,
    ];

    protected $casts = [
        'available' => 'boolean',
        'base_price' => 'integer',
        'rating' => 'float',
    ];
}
