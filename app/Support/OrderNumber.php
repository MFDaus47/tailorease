<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use MongoDB\Collection;
use MongoDB\Laravel\Connection;
use MongoDB\Model\BSONDocument;
use MongoDB\Operation\FindOneAndUpdate;
use RuntimeException;

class OrderNumber
{
    public static function next(): string
    {
        $document = self::counters()->findOneAndUpdate(
            ['_id' => 'orders'],
            [['$set' => ['seq' => ['$add' => [['$ifNull' => ['$seq', 1000]], 1]]]]],
            [
                'upsert' => true,
                'returnDocument' => FindOneAndUpdate::RETURN_DOCUMENT_AFTER,
            ],
        );

        return self::format(self::sequence($document));
    }

    public static function format(int $sequence): string
    {
        return 'TE-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }

    public static function setSequence(int $sequence): void
    {
        self::counters()->updateOne(
            ['_id' => 'orders'],
            ['$set' => ['seq' => $sequence]],
            ['upsert' => true],
        );
    }

    private static function counters(): Collection
    {
        $connection = DB::connection('mongodb');

        if (! $connection instanceof Connection) {
            throw new RuntimeException('Order numbers require the MongoDB connection.');
        }

        return $connection->getMongoDB()->selectCollection('counters');
    }

    private static function sequence(mixed $document): int
    {
        if ($document instanceof BSONDocument || is_array($document)) {
            return (int) ($document['seq'] ?? 0);
        }

        return 0;
    }
}
