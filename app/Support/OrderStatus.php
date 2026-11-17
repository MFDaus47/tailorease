<?php

namespace App\Support;

class OrderStatus
{
    public const FLOW = [
        'pending' => 'accepted',
        'accepted' => 'deposit_paid',
        'deposit_paid' => 'in_production',
        'in_production' => 'quality_check',
        'quality_check' => 'ready',
        'ready' => 'completed',
    ];

    public static function canAdvance(string $from, string $to): bool
    {
        return (self::FLOW[$from] ?? null) === $to;
    }

    public static function next(string $from): ?string
    {
        return self::FLOW[$from] ?? null;
    }
}
