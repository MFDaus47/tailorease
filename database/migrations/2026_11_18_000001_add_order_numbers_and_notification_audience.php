<?php

use App\Models\AppNotification;
use App\Models\Order;
use App\Models\User;
use App\Support\OrderNumber;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $sequence = 1000;

        Order::withoutEvents(function () use (&$sequence): void {
            $orders = Order::query()->orderBy('created_at')->orderBy('_id')->get();

            foreach ($orders as $order) {
                $current = (string) ($order->number ?? '');

                if (preg_match('/^TE-(\d+)$/', $current, $matches) === 1) {
                    $sequence = max($sequence, (int) $matches[1]);

                    continue;
                }

                $sequence++;
                $order->number = OrderNumber::format($sequence);
                $order->save();
            }
        });

        OrderNumber::setSequence($sequence);

        Schema::table('orders', function (Blueprint $collection) {
            $collection->unique('number');
        });

        AppNotification::withoutEvents(function (): void {
            AppNotification::query()->orderBy('created_at')->get()->each(function (AppNotification $notification): void {
                if (filled($notification->audience)) {
                    return;
                }

                $notification->audience = $this->audienceFor($notification);
                $notification->save();
            });
        });

        Schema::table('notifications', function (Blueprint $collection) {
            $collection->index('audience');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $collection) {
            $collection->dropIndex('number');
        });

        Schema::table('notifications', function (Blueprint $collection) {
            $collection->dropIndex('audience');
        });
    }

    private function audienceFor(AppNotification $notification): string
    {
        if ($notification->order_id) {
            $order = Order::query()->find($notification->order_id);

            if ($order && (string) $order->customer_id === (string) $notification->user_id) {
                return 'customer';
            }

            return 'tailor';
        }

        $user = User::query()->find($notification->user_id);

        return $user?->getAttribute('role') === 'tailor' ? 'tailor' : 'customer';
    }
};
