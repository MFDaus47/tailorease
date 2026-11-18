<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Design;
use App\Models\Message;
use App\Models\Order;
use App\Models\Product;
use App\Support\Notifier;
use App\Support\OrderFormatter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function dashboard(Request $request): RedirectResponse|Response
    {
        $user = $request->user();

        if ($user && $user->getAttribute('role') === 'tailor') {
            return redirect()->route('tailor.dashboard');
        }

        $orders = $user->orders()
            ->with('customer')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => OrderFormatter::forCustomer($order))
            ->all();

        return Inertia::render('CustomerDashboard', [
            'orders' => $orders,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('OrderForm', [
            'products' => $this->products(),
            'design' => $this->designFor($request, $request->query('design')),
            'productId' => $request->query('product'),
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        $order = $this->visibleOrder($request, $order);
        $messages = Message::query()
            ->where('order_id', (string) $order->id)
            ->orderBy('created_at')
            ->get()
            ->map(fn (Message $message) => [
                'id' => (string) $message->id,
                'sender' => (string) $message->sender_role,
                'text' => (string) $message->body,
                'time' => $message->created_at?->format('M d, g:i A') ?? '',
            ])
            ->all();

        return Inertia::render('OrderTracking', [
            'order' => OrderFormatter::forCustomer($order),
            'messages' => $messages,
            'viewer' => $this->viewer($request, $order),
        ]);
    }

    public function myOrders(Request $request): Response
    {
        $orders = $request->user()->orders()
            ->with('customer')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => OrderFormatter::forCustomer($order))
            ->all();

        return Inertia::render('MyOrders', [
            'orders' => $orders,
        ]);
    }

    public function store(StoreOrderRequest $request): RedirectResponse
    {
        $validated = $this->payload($request);
        $validated['customer_id'] = Auth::id();
        $validated['status'] = 'pending';

        $order = Order::create($validated);
        $this->attachDesign($request, $order);

        $reference = (string) $order->number;

        Notifier::to(
            (string) $order->customer_id,
            'order',
            'Order submitted',
            "{$reference} is waiting for the tailor to review it.",
            (string) $order->id,
        );
        Notifier::toTailors(
            'order',
            'New order',
            "{$request->user()->name} submitted {$reference}.",
            (string) $order->id,
        );

        return redirect()
            ->route('my-orders')
            ->with('success', 'Order submitted successfully!');
    }

    public function edit(Request $request, Order $order): Response
    {
        $order = $request->user()->orders()->findOrFail($order->id);
        $design = $order->design_id
            ? $this->designFor($request, (string) $order->design_id)
            : $this->designFor($request, $request->query('design'));

        return Inertia::render('OrderForm', [
            'products' => $this->products(),
            'orderToEdit' => $order,
            'design' => $design,
            'productId' => $order->product_id,
        ]);
    }

    public function update(StoreOrderRequest $request, Order $order): RedirectResponse
    {
        $order = $request->user()->orders()->findOrFail($order->id);

        if (! in_array($order->status, ['pending', 'rejected'], true)) {
            abort(409, 'This order can no longer be edited.');
        }

        $order->update($this->payload($request, $order) + ['status' => 'pending']);
        $this->attachDesign($request, $order);

        Notifier::toTailors(
            'order',
            'Order updated',
            "{$request->user()->name} resubmitted {$order->number}.",
            (string) $order->id,
        );

        return redirect()
            ->route('my-orders')
            ->with('success', 'Order resubmitted successfully!');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function products(): array
    {
        return Product::query()
            ->available()
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product) => ProductController::present($product))
            ->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function designFor(Request $request, mixed $id): ?array
    {
        if (! is_string($id) || $id === '') {
            return null;
        }

        $design = Design::query()->find($id);

        if (! $design) {
            return null;
        }

        $owns = (string) $design->user_id === (string) $request->user()->id;
        $tailor = $request->user()->getAttribute('role') === 'tailor';
        abort_unless($owns || $tailor, 403);

        return DesignController::present($design);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(StoreOrderRequest $request, ?Order $existing = null): array
    {
        $validated = $request->safe()->except(['design_file']);
        $validated['has_design'] = (bool) ($validated['has_design'] ?? false);
        $validated['order_name'] = filled($validated['order_name'] ?? null)
            ? trim((string) $validated['order_name'])
            : null;

        if ($request->hasFile('design_file')) {
            $stored = $request->file('design_file')->store('designs', 'public');
            $validated['design_file_path'] = '/storage/'.$stored;
            $validated['has_design'] = true;
        } elseif (! empty($validated['design_id'])) {
            $design = Design::query()->find($validated['design_id']);
            abort_unless($design && (string) $design->user_id === (string) $request->user()->id, 403);
            $validated['design_file_path'] = $design->preview_path;
            $validated['has_design'] = true;
        } elseif ($existing) {
            $validated['design_file_path'] = $existing->design_file_path;
            $validated['design_id'] = $existing->design_id;
            $validated['has_design'] = (bool) $existing->has_design;
        }

        return $validated;
    }

    private function attachDesign(Request $request, Order $order): void
    {
        if (! $order->design_id) {
            return;
        }

        Design::query()
            ->where('user_id', (string) $request->user()->id)
            ->whereKey($order->design_id)
            ->update(['order_id' => (string) $order->id]);
    }

    /**
     * @return array{role: string, canDecide: bool, canPayDeposit: bool, canPayBalance: bool, canEdit: bool}
     */
    private function viewer(Request $request, Order $order): array
    {
        $isTailor = $request->user()?->getAttribute('role') === 'tailor';
        $owns = (string) $order->customer_id === (string) $request->user()?->id;
        $status = (string) $order->status;

        return [
            'role' => $isTailor ? 'tailor' : 'customer',
            'canDecide' => $isTailor && $status === 'pending',
            'canPayDeposit' => $owns && ! $isTailor && $status === 'accepted',
            'canPayBalance' => $owns && ! $isTailor && $status === 'ready',
            'canEdit' => $owns && ! $isTailor && in_array($status, ['pending', 'rejected'], true),
        ];
    }

    private function visibleOrder(Request $request, Order $order): Order
    {
        $isTailor = $request->user()?->getAttribute('role') === 'tailor';

        return $isTailor
            ? Order::with('customer')->findOrFail($order->id)
            : $request->user()->orders()->with('customer')->findOrFail($order->id);
    }
}
