<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TailorOrderController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [OrderController::class, 'dashboard'])->name('dashboard');

    Route::inertia('catalog', 'ApparelCatalog')->name('catalog');
    Route::get('my-orders', [OrderController::class, 'myOrders'])->name('my-orders');
    Route::inertia('notifications', 'Notifications')->name('notifications');

    Route::get('incoming', [TailorOrderController::class, 'incoming'])->name('incoming');
    Route::post('incoming/{order}/accept', [TailorOrderController::class, 'accept'])->name('incoming.accept');
    Route::post('incoming/{order}/reject', [TailorOrderController::class, 'reject'])->name('incoming.reject');
    Route::get('all-orders', [TailorOrderController::class, 'allOrders'])->name('all-orders');
    Route::post('all-orders/{order}/status', [TailorOrderController::class, 'updateStatus'])->name('all-orders.update-status');
    Route::get('all-orders/export', [TailorOrderController::class, 'export'])->name('all-orders.export');
    Route::inertia('kanban', 'KanbanBoard')->name('kanban');
    Route::inertia('manage-catalog', 'ManageCatalog')->name('manage-catalog');
    Route::inertia('reports', 'Reports')->name('reports');

    Route::inertia('order-form', 'OrderForm')->name('order-form');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('order-tracking/{order}', [OrderController::class, 'show'])->name('order-tracking');
    Route::inertia('payment-success', 'PaymentSuccess')->name('payment-success');
    Route::inertia('payment-failed', 'PaymentFailed')->name('payment-failed');
    Route::inertia('checkout', 'Checkout')->name('checkout');
});

require __DIR__.'/settings.php';
