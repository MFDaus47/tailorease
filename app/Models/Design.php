<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Design extends Model
{
    protected $fillable = [
        'user_id',
        'order_id',
        'name',
        'product_type',
        'shirt_color',
        'elements',
        'preview_path',
    ];
}
