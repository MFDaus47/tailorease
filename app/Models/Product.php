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
        'deposit_rate',
        'available',
        'rating',
    ];

    protected $attributes = [
        'available' => true,
        'rating' => 0.0,
        'deposit_rate' => 0.5,
    ];

    protected $casts = [
        'available' => 'boolean',
        'base_price' => 'integer',
        'deposit_rate' => 'float',
        'rating' => 'float',
    ];

    /**
     * Seeded products stored availability as 1/0. MongoDB does not treat that as a boolean.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<Product>  $query
     * @return \Illuminate\Database\Eloquent\Builder<Product>
     */
    public function scopeAvailable($query)
    {
        return $query->whereIn('available', [true, 1]);
    }
}
