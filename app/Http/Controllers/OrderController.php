<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    /* -------------------------------------------------------------------------------

        SHARED FUNCTIONS

     ------------------------------------------------------------------------------- */

    public function dashboard(Request $request)
    {

        $user = $request->user();
        $orders = [];

        if ($user && $user->getAttribute('role') === 'tailor') {
            $orders = Order::with('customer')
                ->orderByDesc('created_at')
                ->take(5)
                ->get()
                ->map(fn (Order $o) => self::formatOrder($o))
                ->all();
        } else {
            $orders = $user->orders()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $o) => self::formatOrder($o))
                ->all();
        }

        return Inertia::render('CustomerDashboard', [
            'orders' => $orders,
        ]);
    }
    public function show(Request $request, Order $order)
    {
        $isTailor = $request->user()?->getAttribute('role') === 'tailor';

        $order = $isTailor
            ? Order::findOrFail($order->id)
            : $request->user()->orders()->findOrFail($order->id);

        return Inertia::render('OrderTracking', [
            'order' => self::formatOrder($order),
        ]);
    }

        /* -------------------------------------------------------------------------------

        FUNCTIONS FOR CUSTOMERS

     ------------------------------------------------------------------------------- */


    public function myOrders(Request $request)
    {
        $orders = $request->user()->orders()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $o) => self::formatOrder($o))
            ->all();

        return Inertia::render('MyOrders', [
            'orders' => $orders,
            ]);
    }

    public function store(StoreOrderRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['customer_id'] = Auth::id();
        $validated['status'] = 'pending';

        Order::create($validated);

        return redirect()
            ->route('my-orders')
            ->with('success', 'Order submitted successfully!');
    }

    public function edit(Request $request, Order $order)
    {
        $order = $request->user()->orders()->findOrFail($order->id);
        
        return Inertia::render('OrderForm', [
            'orderToEdit' => $order,
        ]);
    }

    public function update(StoreOrderRequest $request, Order $order): RedirectResponse
    {
        $order = $request->user()->orders()->findOrFail($order->id);
        
        $validated = $request->validated();
        $validated['status'] = 'pending';

        $order->update($validated);

        return redirect()
            ->route('my-orders')
            ->with('success', 'Order resubmitted successfully!');
    }

    private static function formatOrder(Order $order): array
    {
        $sizes = $order->sizes;

        if (is_array($sizes) && count($sizes) > 0) {
            if (array_is_list($sizes)) {
                $sizeLabel = implode(', ', array_filter($sizes));
            } else {
                $sizeLabel = implode(', ', array_map(
                    fn ($size, $quantity) => ((int) $quantity > 1) ? "{$size} ×{$quantity}" : (string) $size,
                        array_keys(array_filter($sizes, fn ($quantity) => (int) $quantity > 0)),
                        array_values(array_filter($sizes, fn ($quantity) => (int) $quantity > 0))
                ));
            }
        } else {
        $sizeLabel = 'N/A';
        }

        return [
        'id' => (string) $order->id,
        'product' => (string) $order->product_name,
        'customer_name' => (string) $order->customer->name ??  'Unknown Customer',
        'customer_email' => (string) $order->customer->email ?? 'N/A',
        'quantity' => (int) $order->total_quantity,
        'size' => $sizeLabel ?: 'N/A',
        'total' => (float) $order->total,
        'deposit' => (float) $order->deposit,
        'due_date' => $order->due_date?->format('Y-m-d'),
        'deliveryDate' => $order->due_date?->format('M d, Y'),
        'date' => $order->created_at->format('M d, Y'),
        'status' => (string) $order->status,
        'notes' => $order->notes ?: null,
        'hasDesign' => (bool) $order->has_design,
        ];
    }
}
