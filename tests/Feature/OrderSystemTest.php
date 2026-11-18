<?php

use App\Models\AppNotification;
use App\Models\Order;
use App\Models\Product;
use App\Models\Sticker;
use App\Models\User;
use App\Support\Notifier;

function makeProduct(): Product
{
    return Product::create([
        'name' => 'Test Shirt',
        'description' => 'A shirt',
        'category' => 'Shirts',
        'image_path' => '/products-images/test.jpg',
        'base_price' => 40,
        'deposit_rate' => 0.5,
        'available' => true,
        'rating' => 4,
    ]);
}

function orderPayload(Product $product): array
{
    return [
        'product_id' => (string) $product->id,
        'product_name' => $product->name,
        'sizes' => ['M' => 2],
        'total_quantity' => 2,
        'total' => 80,
        'deposit' => 40,
        'remaining_balance' => 40,
        'due_date' => now()->addDays(14)->toDateString(),
        'notes' => 'Hem it',
        'has_design' => false,
        'items' => [[
            'product_id' => (string) $product->id,
            'product_name' => $product->name,
            'sizes' => ['M' => 2],
            'total_quantity' => 2,
            'base_price' => 40,
            'subtotal' => 80,
        ]],
    ];
}

test('catalog includes products saved with integer availability', function () {
    $customer = User::factory()->create();

    Product::query()->insert([
        'name' => 'Seeded Shirt',
        'description' => 'A shirt',
        'category' => 'Shirts',
        'image_path' => '/products-images/test.jpg',
        'base_price' => 40,
        'deposit_rate' => 0.5,
        'available' => 1,
        'rating' => 4,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($customer)
        ->get(route('catalog'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('ApparelCatalog')
            ->has('products', 1)
            ->where('products.0.name', 'Seeded Shirt')
            ->where('products.0.available', true));
});

test('catalog and order pages use real routes', function () {
    $customer = User::factory()->create();
    $product = makeProduct();

    $this->actingAs($customer)
        ->get(route('catalog'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('ApparelCatalog')->has('products', 1));

    $this->actingAs($customer)
        ->get(route('order-form', ['product' => $product->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('OrderForm'));
});

test('a customer order can be accepted, paid, and moved forward one step', function () {
    $customer = User::factory()->create();
    $tailor = User::factory()->create(['role' => 'tailor']);
    $product = makeProduct();

    $this->actingAs($customer)
        ->post(route('orders.store'), orderPayload($product))
        ->assertRedirect(route('my-orders'));

    $order = Order::first();
    expect($order->status)->toBe('pending')
        ->and($order->number)->toMatch('/^TE-\d{4,}$/');

    $this->actingAs($customer)
        ->post(route('all-orders.update-status', $order), ['status' => 'accepted'])
        ->assertForbidden();

    $this->actingAs($tailor)
        ->get(route('order-tracking', $order))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('viewer.canDecide', true)
            ->where('viewer.canPayDeposit', false)
            ->where('viewer.canEdit', false)
            ->where('order.number', $order->number));

    $this->actingAs($tailor)
        ->post(route('incoming.accept', $order))
        ->assertRedirect();

    $this->actingAs($tailor)
        ->post(route('orders.payments.store', $order), ['kind' => 'deposit'])
        ->assertForbidden();

    $this->actingAs($tailor)
        ->post(route('all-orders.update-status', $order), ['status' => 'completed'])
        ->assertStatus(422);

    $this->actingAs($customer)
        ->get(route('order-tracking', $order))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('viewer.canPayDeposit', true)
            ->where('viewer.canDecide', false));

    $this->actingAs($customer)
        ->post(route('orders.payments.store', $order), ['kind' => 'deposit'])
        ->assertRedirect(route('orders.payment-success', $order));

    expect($order->fresh()->status)->toBe('deposit_paid');

    $this->actingAs($tailor)
        ->post(route('all-orders.update-status', $order), ['status' => 'in_production'])
        ->assertRedirect();

    $this->actingAs($customer)
        ->post(route('orders.messages.store', $order), ['body' => 'Please use navy thread.'])
        ->assertRedirect();

    $this->actingAs($tailor)
        ->get(route('kanban'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('KanbanBoard'));

    $this->actingAs($tailor)
        ->get(route('reports'))
        ->assertOk();
});

test('orders store a public number and optional title', function () {
    $customer = User::factory()->create();
    $product = makeProduct();

    $this->actingAs($customer)
        ->post(route('orders.store'), orderPayload($product) + ['order_name' => 'Friday jerseys'])
        ->assertRedirect(route('my-orders'));

    $first = Order::query()->first();
    expect($first->order_name)->toBe('Friday jerseys')
        ->and($first->number)->toMatch('/^TE-\d{4,}$/');

    $this->actingAs($customer)
        ->post(route('orders.store'), orderPayload($product))
        ->assertRedirect(route('my-orders'));

    $second = Order::query()->get()->first(fn (Order $order) => (string) $order->id !== (string) $first->id);
    expect((int) substr((string) $second->number, 3))->toBe(((int) substr((string) $first->number, 3)) + 1);

    $this->actingAs($customer)
        ->get(route('my-orders'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('orders', function ($orders) {
            $names = collect($orders)->pluck('name');

            return $names->contains('Friday jerseys') && $names->contains(null);
        }));
});

test('notifications stay with the role that should see them', function () {
    $user = User::factory()->create(['role' => 'customer']);

    Notifier::to((string) $user->id, 'order', 'Customer note', 'For the customer');
    Notifier::to((string) $user->id, 'order', 'Tailor note', 'For the tailor', null, 'tailor');

    $this->actingAs($user)
        ->get(route('notifications'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('notifications', 1)
            ->where('notifications.0.title', 'Customer note'));

    $this->actingAs($user)
        ->post(route('notifications.read-all'))
        ->assertRedirect();

    expect(AppNotification::query()->where('title', 'Customer note')->first()->read)->toBeTrue()
        ->and(AppNotification::query()->where('title', 'Tailor note')->first()->read)->toBeFalse();

    $user->update(['role' => 'tailor']);

    $this->actingAs($user->fresh())
        ->get(route('notifications'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('notifications', 1)
            ->where('notifications.0.title', 'Tailor note'));
});

test('tailors can store an svg sticker and customers can open it in the designer', function () {
    $customer = User::factory()->create();
    $tailor = User::factory()->create(['role' => 'tailor']);

    $this->actingAs($tailor)
        ->post(route('stickers.store'), [
            'name' => 'Mark',
            'category' => 'Badges',
            'tags' => 'mark, badge',
            'svg' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>',
            'active' => true,
        ])
        ->assertRedirect(route('manage-catalog'));

    expect(Sticker::where('slug', 'mark')->exists())->toBeTrue();

    $this->actingAs($customer)
        ->get(route('designerPage'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('DesignerPage')->has('stickers'));
});
