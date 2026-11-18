<?php

namespace App\Support;

use App\Models\AppNotification;
use App\Models\User;

class Notifier
{
    public static function to(string $userId, string $type, string $title, string $body, ?string $orderId = null, string $audience = 'customer'): void
    {
        AppNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'order_id' => $orderId,
            'audience' => $audience === 'tailor' ? 'tailor' : 'customer',
            'read' => false,
        ]);
    }

    public static function toTailors(string $type, string $title, string $body, ?string $orderId = null): void
    {
        User::query()
            ->where('role', 'tailor')
            ->get()
            ->each(function (User $user) use ($type, $title, $body, $orderId): void {
                self::to((string) $user->id, $type, $title, $body, $orderId, 'tailor');
            });
    }
}
