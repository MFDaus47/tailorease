<?php

/*
| PHPUnit's env force flag updates getenv() and $_ENV, but not $_SERVER.
| Docker Compose injects MONGODB_DATABASE into $_SERVER, and Laravel reads
| that first, so tests would refresh the application database. Set all three
| before the framework boots.
*/

$overrides = [
    'APP_ENV' => 'testing',
    'APP_MAINTENANCE_DRIVER' => 'file',
    'BCRYPT_ROUNDS' => '4',
    'BROADCAST_CONNECTION' => 'null',
    'CACHE_STORE' => 'array',
    'DB_CONNECTION' => 'mongodb',
    'DB_DATABASE' => '',
    'DB_URL' => '',
    'MONGODB_URI' => 'mongodb://mongodb:27017/?replicaSet=rs0',
    'MONGODB_DATABASE' => 'tailorease_testing',
    'MAIL_MAILER' => 'array',
    'QUEUE_CONNECTION' => 'sync',
    'SESSION_DRIVER' => 'array',
    'PULSE_ENABLED' => 'false',
    'TELESCOPE_ENABLED' => 'false',
    'NIGHTWATCH_ENABLED' => 'false',
];

foreach ($overrides as $name => $value) {
    putenv($name.'='.$value);
    $_ENV[$name] = $value;
    $_SERVER[$name] = $value;
}

require __DIR__.'/../vendor/autoload.php';
