<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TailorOrderController extends Controller
{
    public function incoming(Request $request)
    {
        self::ensureTailor($request);

        $orders = Order::with('customer')
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => self::formatOrder($order))
            ->all();

        return Inertia::render('IncomingOrders', [
            'orders' => $orders,
        ]);
    }

    public function allOrders(Request $request)
    {
        self::ensureTailor($request);

        $orders = Order::with('customer')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => self::formatOrder($order))
            ->all();

        return Inertia::render('AllOrders', [
            'orders' => $orders,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        self::ensureTailor($request);

        $request->validate([
            'status' => ['required', Rule::in(['pending','accepted','deposit_paid','in_production','quality_check','ready','completed','rejected'])],
        ]);

        $order = Order::findOrFail($order->id);
        $order->update([
            'status' => $request->input('status'),
        ]);

        return back()->with('success', 'Order status updated.');
    }

    public function export(Request $request)
    {
        self::ensureTailor($request);

        $orders = Order::with('customer')
            ->orderByDesc('created_at')
            ->get();

        $csv = fopen('php://temp', 'r+');

        fputcsv($csv, ['Order ID','Customer','Email','Product','Size','Quantity','Total','Deposit','Remaining','Order Date','Due Date','Status','Notes']);

        foreach ($orders as $order) {
            $customer = $order->customer;
            $nameParts = collect(explode(' ', trim((string) ($customer?->name ?? ''))))->filter()->values();

            $avatar = '??';

            if ($nameParts->count() === 1) {
                $avatar = strtoupper(substr($nameParts->first(), 0, 2));
            } elseif ($nameParts->count() > 1) {
                $avatar = strtoupper(substr($nameParts->get(0), 0, 1) . substr($nameParts->get(1), 0, 1));
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
            'Content-Disposition' => 'attachment; filename="all-orders-' . now()->format('Y-m-d') . '.csv"',
        ]);
    }

    public function accept(Request $request, Order $order)
    {
        self::ensureTailor($request);

        $order = Order::findOrFail($order->id);

        if ($order->status !== 'pending') {
            abort(409, 'Only pending orders can be accepted.');
        }

        $order->update([
            'status' => 'accepted',
        ]);

        return back()->with('success', 'Order accepted.');
    }

    public function reject(Request $request, Order $order)
    {
        self::ensureTailor($request);

        $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $order = Order::findOrFail($order->id);

        if ($order->status !== 'pending') {
            abort(409, 'Only pending orders can be rejected.');
        }

        $order->update([
            'status' => 'rejected',
            'notes' => trim(($order->notes ?: '') . "\n\nRejected: " . $request->input('reason')),
        ]);

        return back()->with('success', 'Order rejected.');
    }

    private static function ensureTailor(Request $request): void
    {
        $user = $request->user();

        if (!$user || $user->getAttribute('role') !== 'tailor') {
            abort(403);
        }
    }

    private static function formatOrder(Order $order): array
    {
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

        $customer = $order->customer;
        $nameParts = collect(explode(' ', trim((string) ($customer?->name ?? ''))))->filter()->values();
        $avatar = '??';

        if ($nameParts->count() === 1) {
            $avatar = strtoupper(substr($nameParts->first(), 0, 2));
        } elseif ($nameParts->count() > 1) {
            $avatar = strtoupper(substr($nameParts->get(0), 0, 1) . substr($nameParts->get(1), 0, 1));
        }

        return [
            'id' => (string) $order->id,
            'customer' => $customer?->name ?? 'Unknown Customer',
            'customerEmail' => $customer?->email ?? '',
            'avatar' => $avatar,
            'product' => (string) $order->product_name,
            'productId' => (string) $order->product_id,
            'size' => $sizeLabel,
            'quantity' => (int) $order->total_quantity,
            'total' => (float) $order->total,
            'deposit' => (float) $order->deposit,
            'remaining' => (float) $order->remaining_balance,
            'deliveryDate' => $order->due_date?->format('Y-m-d'),
            'date' => $order->created_at?->format('M d, Y') ?? '',
            'status' => (string) $order->status,
            'notes' => $order->notes ?: null,
            'hasDesign' => (bool) $order->has_design,
        ];
    }
}
