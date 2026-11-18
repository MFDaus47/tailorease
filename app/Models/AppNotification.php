<?php

namespace App\Models;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model as EloquentModel;
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
        'audience',
        'read',
    ];

    protected $attributes = [
        'read' => false,
    ];

    protected $casts = [
        'read' => 'boolean',
    ];

    public static function audienceFor(Authenticatable $user): string
    {
        $role = $user instanceof EloquentModel ? $user->getAttribute('role') : null;

        return $role === 'tailor' ? 'tailor' : 'customer';
    }

    /**
     * @param  Builder<AppNotification>  $query
     * @return Builder<AppNotification>
     */
    public function scopeForAudience(Builder $query, Authenticatable $user): Builder
    {
        return $query
            ->where('user_id', (string) $user->getAuthIdentifier())
            ->where('audience', self::audienceFor($user));
    }
}
