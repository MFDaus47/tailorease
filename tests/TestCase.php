<?php

namespace Tests;

use Illuminate\Database\Events\DatabaseRefreshed;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();

        // db:wipe disconnects the MongoDB connection and it does not reconnect on its own,
        // so RefreshDatabase would start its transaction on a null client.
        $app['events']->listen(DatabaseRefreshed::class, fn () => $app['db']->purge('mongodb'));

        return $app;
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
