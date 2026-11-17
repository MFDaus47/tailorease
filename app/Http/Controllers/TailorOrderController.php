<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Support\Notifier;
use App\Support\OrderFormatter;
use App\Support\OrderStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class TailorOrderController extends Controller
{
    public function incoming(Request $request)
    {
        $orders = Order::with('customer')
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => OrderFormatter::forTailor($order))
            ->all();

        return Inertia::render('IncomingOrders', [
            'orders' => $orders,
        ]);
    }

    public function dashboard(Request $request)
    {
        $orders = Order::with('customer')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => OrderFormatter::forTailor($order))
            ->all();

        return Inertia::render('TailorDashboard', [
            'orders' => $orders,
        ]);
    }

    public function allOrders(Request $request)
    {
        $orders = Order::with('customer')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => OrderFormatter::forTailor($order))
            ->all();

        return Inertia::render('AllOrders', [
            'orders' => $orders,
        ]);
    }

    public function kanban()
    {
        $orders = Order::with('customer')
            ->whereIn('status', ['accepted', 'deposit_paid', 'in_production', 'quality_check', 'ready', 'completed'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => OrderFormatter::forTailor($order))
            ->all();

        return Inertia::render('KanbanBoard', [
            'orders' => $orders,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $order = Order::with('customer')->findOrFail($order->id);
        $next = $data['status'];

        if (! OrderStatus::canAdvance((string) $order->status, $next)) {
            abort(422, 'That status change is not allowed.');
        }

        $order->update(['status' => $next]);
        $this->notifyStatus($order);

        return back()->with('success', 'Order status updated.');
    }

    public function export(Request $request)
    {
        $orders = Order::with('customer')
            ->orderByDesc('created_at')
            ->get();

        $csv = fopen('php://temp', 'r+');

        fputcsv($csv, ['Order ID', 'Customer', 'Email', 'Product', 'Size', 'Quantity', 'Total', 'Deposit', 'Remaining', 'Order Date', 'Due Date', 'Status', 'Notes']);

        foreach ($orders as $order) {
            $customer = $order->customer;
            $nameParts = collect(explode(' ', trim((string) ($customer?->name ?? ''))))->filter()->values();

            $avatar = '??';

            if ($nameParts->count() === 1) {
                $avatar = strtoupper(substr($nameParts->first(), 0, 2));
            } elseif ($nameParts->count() > 1) {
                $avatar = strtoupper(substr($nameParts->get(0), 0, 1).substr($nameParts->get(1), 0, 1));
            }

            $sizes = $order->sizes;

            if (is_array($sizes) && count($sizes) > 0) {
                if (array_is_list($sizes)) {
                    $sizeLabel = implode(', ', array_filter($sizes));
                } else {
                    $sizeLabel = implode(', ', array_map(
                        fn ($size, $quantity) => ((int) $quantity > 1) ? "{$size} x{$quantity}" : (string) $size,
                        array_keys(array_filter($sizes, fn ($quantity) => (int) $quantity > 0)),
                        array_values(array_filter($sizes, fn ($quantity) => (int) $quantity > 0))
                    ));
                }
            } else {
                $sizeLabel = 'N/A';
            }

            fputcsv($csv, [
                (string) $order->id,
                $customer?->name ?? 'Unknown Customer',
                $customer?->email ?? '',
                (string) $order->product_name,
                $sizeLabel,
                (int) $order->total_quantity,
                number_format((float) $order->total, 2, '.', ''),
                number_format((float) $order->deposit, 2, '.', ''),
                number_format((float) $order->remaining_balance, 2, '.', ''),
                $order->created_at?->format('M d, Y') ?? '',
                $order->due_date?->format('Y-m-d') ?? '',
                (string) $order->status,
                (string) ($order->notes ?? ''),
            ]);
        }

        rewind($csv);
        $output = stream_get_contents($csv);
        fclose($csv);

        return Response::make($output, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="all-orders-'.now()->format('Y-m-d').'.csv"',
        ]);
    }

    public function accept(Request $request, Order $order)
    {
        $order = Order::with('customer')->findOrFail($order->id);

        if ($order->status !== 'pending') {
            abort(409, 'Only pending orders can be accepted.');
        }

        $order->update([
            'status' => 'accepted',
        ]);
        $this->notifyStatus($order);

        return back()->with('success', 'Order accepted.');
    }

    public function reject(Request $request, Order $order)
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $order = Order::with('customer')->findOrFail($order->id);

        if ($order->status !== 'pending') {
            abort(409, 'Only pending orders can be rejected.');
        }

        $order->update([
            'status' => 'rejected',
            'notes' => trim(($order->notes ?: '')."\n\nRejected: ".$request->input('reason')),
        ]);
        $this->notifyStatus($order, $request->input('reason'));

        return back()->with('success', 'Order rejected.');
    }

    private function notifyStatus(Order $order, ?string $reason = null): void
    {
        $status = str_replace('_', ' ', (string) $order->status);
        $body = $reason
            ? "Your order was rejected. {$reason}"
            : "Your order is now {$status}.";

        Notifier::to(
            (string) $order->customer_id,
            $order->status === 'rejected' ? 'order' : 'order',
            'Order '.$status,
            $body,
            (string) $order->id,
        );
    }
}
