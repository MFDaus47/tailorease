<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class AppNotification extends Model
{
    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'order_id',
        'read',
    ];

    protected $attributes = [
        'read' => false,
    ];

    protected $casts = [
        'read' => 'boolean',
    ];
}
