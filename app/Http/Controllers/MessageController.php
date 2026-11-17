<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Order;
use App\Support\Notifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request, Order $order): RedirectResponse
    {
        $isTailor = $request->user()?->getAttribute('role') === 'tailor';
        $order = $isTailor
            ? Order::query()->findOrFail($order->id)
            : $request->user()->orders()->findOrFail($order->id);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $role = $isTailor ? 'tailor' : 'customer';

        Message::create([
            'order_id' => (string) $order->id,
            'user_id' => (string) $request->user()->id,
            'body' => $data['body'],
            'sender_role' => $role,
        ]);

        if ($isTailor) {
            Notifier::to(
                (string) $order->customer_id,
                'message',
                'New message on your order',
                $data['body'],
                (string) $order->id,
            );
        } else {
            Notifier::toTailors(
                'message',
                'New customer message',
                $data['body'],
                (string) $order->id,
            );
        }

        return back()->with('success', 'Message sent.');
    }
}
