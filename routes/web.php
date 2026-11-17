<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StickerController;
use App\Http\Controllers\TailorOrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [OrderController::class, 'dashboard'])->name('dashboard');

    Route::get('catalog', [ProductController::class, 'catalog'])->name('catalog');
    Route::get('my-orders', [OrderController::class, 'myOrders'])->name('my-orders');
    Route::inertia('notifications', 'Notifications')->name('notifications');

    Route::middleware('tailor')->group(function () {
        Route::get('incoming', [TailorOrderController::class, 'incoming'])->name('incoming');
        Route::post('incoming/{order}/accept', [TailorOrderController::class, 'accept'])->name('incoming.accept');
        Route::post('incoming/{order}/reject', [TailorOrderController::class, 'reject'])->name('incoming.reject');
        Route::get('all-orders', [TailorOrderController::class, 'allOrders'])->name('all-orders');
        Route::post('all-orders/{order}/status', [TailorOrderController::class, 'updateStatus'])->name('all-orders.update-status');
        Route::get('all-orders/export', [TailorOrderController::class, 'export'])->name('all-orders.export');
        Route::inertia('kanban', 'KanbanBoard')->name('kanban');
        Route::get('manage-catalog', [ProductController::class, 'manage'])->name('manage-catalog');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::post('products/{product}/availability', [ProductController::class, 'availability'])->name('products.availability');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::post('stickers', [StickerController::class, 'store'])->name('stickers.store');
        Route::put('stickers/{sticker}', [StickerController::class, 'update'])->name('stickers.update');
        Route::post('stickers/{sticker}/active', [StickerController::class, 'active'])->name('stickers.active');
        Route::inertia('reports', 'Reports')->name('reports');
        Route::get('tailor/dashboard', [TailorOrderController::class, 'dashboard'])->name('tailor.dashboard');
    });

    Route::inertia('order-form', 'OrderForm')->name('order-form');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
    Route::put('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::get('order-tracking/{order}', [OrderController::class, 'show'])->name('order-tracking');
    Route::inertia('payment-success', 'PaymentSuccess')->name('payment-success');
    Route::inertia('payment-failed', 'PaymentFailed')->name('payment-failed');
    Route::inertia('checkout', 'Checkout')->name('checkout');
});

Route::get('/designer', function() {
    return Inertia::render('DesignerPage');
})->name('designerPage');

require __DIR__.'/settings.php';
