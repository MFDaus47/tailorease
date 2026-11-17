<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Support\Notifier;
use App\Support\OrderFormatter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function checkout(Request $request, Order $order): Response
    {
        $order = $this->visibleOrder($request, $order);

        return Inertia::render('Checkout', [
            'order' => OrderFormatter::forCustomer($order),
        ]);
    }

    public function store(Request $request, Order $order): RedirectResponse
    {
        $order = $this->visibleOrder($request, $order);
        $kind = $request->validate([
            'kind' => ['required', 'in:deposit,balance'],
        ])['kind'];

        if ($kind === 'deposit' && $order->status !== 'accepted') {
            return redirect()
                ->route('orders.payment-failed', $order)
                ->with('error', 'The deposit can be recorded after the tailor accepts the order.');
        }

        if ($kind === 'balance' && $order->status !== 'ready') {
            return redirect()
                ->route('orders.payment-failed', $order)
                ->with('error', 'The balance can be recorded when the order is ready.');
        }

        $amount = $kind === 'deposit' ? (float) $order->deposit : (float) $order->remaining_balance;

        Payment::create([
            'order_id' => (string) $order->id,
            'amount' => $amount,
            'kind' => $kind,
            'recorded_by' => (string) $request->user()->id,
        ]);

        if ($kind === 'deposit') {
            $order->update(['status' => 'deposit_paid']);
        }

        $label = $kind === 'deposit' ? 'Deposit' : 'Balance';
        Notifier::to(
            (string) $order->customer_id,
            'payment',
            "{$label} recorded",
            "{$label} of RM".number_format($amount, 2).' was recorded.',
            (string) $order->id,
        );
        Notifier::toTailors(
            'payment',
            "{$label} recorded",
            "{$label} recorded for {$order->product_name}.",
            (string) $order->id,
        );

        return redirect()
            ->route('orders.payment-success', $order)
            ->with('success', "{$label} recorded.");
    }

    public function success(Request $request, Order $order): Response
    {
        $order = $this->visibleOrder($request, $order);

        return Inertia::render('PaymentSuccess', [
            'order' => OrderFormatter::forCustomer($order),
        ]);
    }

    public function failed(Request $request, Order $order): Response
    {
        $order = $this->visibleOrder($request, $order);

        return Inertia::render('PaymentFailed', [
            'order' => OrderFormatter::forCustomer($order),
            'message' => session('error'),
        ]);
    }

    private function visibleOrder(Request $request, Order $order): Order
    {
        $isTailor = $request->user()?->getAttribute('role') === 'tailor';

        return $isTailor
            ? Order::with('customer')->findOrFail($order->id)
            : $request->user()->orders()->with('customer')->findOrFail($order->id);
    }
}
