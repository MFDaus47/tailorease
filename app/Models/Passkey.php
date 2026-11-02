<?php

namespace App\Models;

use Laravel\Passkeys\Passkey as FortifyPasskey;
use MongoDB\Laravel\Eloquent\DocumentModel;

class Passkey extends FortifyPasskey
{
    use DocumentModel;

    protected $connection = 'mongodb';

    protected $table = 'passkeys';

    protected $primaryKey = '_id';

    protected $keyType = 'string';

    public $incrementing = false;
}
