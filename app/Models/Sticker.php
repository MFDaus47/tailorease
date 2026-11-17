<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Sticker extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'category',
        'tags',
        'svg',
        'active',
    ];

    protected $attributes = [
        'active' => true,
        'tags' => [],
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
