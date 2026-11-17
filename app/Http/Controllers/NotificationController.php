<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = AppNotification::query()
            ->where('user_id', (string) $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (AppNotification $notification) => self::present($notification))
            ->all();

        return Inertia::render('Notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function read(Request $request, AppNotification $notification): RedirectResponse
    {
        abort_unless((string) $notification->user_id === (string) $request->user()->id, 403);
        $notification->update(['read' => true]);

        if ($notification->order_id) {
            return redirect()->route('order-tracking', $notification->order_id);
        }

        return back();
    }

    public function readAll(Request $request): RedirectResponse
    {
        AppNotification::query()
            ->where('user_id', (string) $request->user()->id)
            ->where('read', false)
            ->update(['read' => true]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    public static function present(AppNotification $notification): array
    {
        return [
            'id' => (string) $notification->id,
            'type' => (string) $notification->type,
            'title' => (string) $notification->title,
            'body' => (string) $notification->body,
            'read' => (bool) $notification->read,
            'orderId' => $notification->order_id ? (string) $notification->order_id : null,
            'time' => $notification->created_at?->diffForHumans() ?? '',
        ];
    }
}
