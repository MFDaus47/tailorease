<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'CustomerDashboard')->name('dashboard');

    Route::inertia('catalog', 'Catalog')->name('catalog');
    Route::inertia('my-orders', 'MyOrders')->name('my-orders');
    Route::inertia('notifications', 'Notifications')->name('notifications');

    Route::inertia('incoming', 'IncomingOrders')->name('incoming');
    Route::inertia('all-orders', 'AllOrders')->name('all-orders');
    Route::inertia('kanban', 'KanbanBoard')->name('kanban');
    Route::inertia('manage-catalog', 'ManageCatalog')->name('manage-catalog');
    Route::inertia('reports', 'Reports')->name('reports');

    Route::inertia('order-form', 'OrderForm')->name('order-form');
    Route::inertia('order-tracking', 'OrderTracking')->name('order-tracking');
    Route::inertia('payment-success', 'PaymentSuccess')->name('payment-success');
    Route::inertia('payment-failed', 'PaymentFailed')->name('payment-failed');
    Route::inertia('checkout', 'Checkout')->name('checkout');
});

require __DIR__.'/settings.php';
