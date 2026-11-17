<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\Sticker;
use App\Models\User;

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
    expect($order->status)->toBe('pending');

    $this->actingAs($customer)
        ->post(route('all-orders.update-status', $order), ['status' => 'accepted'])
        ->assertForbidden();

    $this->actingAs($tailor)
        ->post(route('incoming.accept', $order))
        ->assertRedirect();

    $this->actingAs($tailor)
        ->post(route('all-orders.update-status', $order), ['status' => 'completed'])
        ->assertStatus(422);

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
