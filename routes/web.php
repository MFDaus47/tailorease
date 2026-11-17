<?php

use App\Http\Controllers\DesignController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StickerController;
use App\Http\Controllers\TailorOrderController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [OrderController::class, 'dashboard'])->name('dashboard');
    Route::get('catalog', [ProductController::class, 'catalog'])->name('catalog');
    Route::get('my-orders', [OrderController::class, 'myOrders'])->name('my-orders');
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications');
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');

    Route::get('order-form', [OrderController::class, 'create'])->name('order-form');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
    Route::put('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::get('order-tracking/{order}', [OrderController::class, 'show'])->name('order-tracking');
    Route::get('orders/{order}/checkout', [PaymentController::class, 'checkout'])->name('orders.checkout');
    Route::post('orders/{order}/payments', [PaymentController::class, 'store'])->name('orders.payments.store');
    Route::get('orders/{order}/payment-success', [PaymentController::class, 'success'])->name('orders.payment-success');
    Route::get('orders/{order}/payment-failed', [PaymentController::class, 'failed'])->name('orders.payment-failed');
    Route::post('orders/{order}/messages', [MessageController::class, 'store'])->name('orders.messages.store');

    Route::get('designer', [DesignController::class, 'editor'])->name('designerPage');
    Route::post('designs', [DesignController::class, 'store'])->name('designs.store');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::middleware('tailor')->group(function () {
        Route::get('incoming', [TailorOrderController::class, 'incoming'])->name('incoming');
        Route::post('incoming/{order}/accept', [TailorOrderController::class, 'accept'])->name('incoming.accept');
        Route::post('incoming/{order}/reject', [TailorOrderController::class, 'reject'])->name('incoming.reject');
        Route::get('all-orders', [TailorOrderController::class, 'allOrders'])->name('all-orders');
        Route::post('all-orders/{order}/status', [TailorOrderController::class, 'updateStatus'])->name('all-orders.update-status');
        Route::get('all-orders/export', [TailorOrderController::class, 'export'])->name('all-orders.export');
        Route::get('kanban', [TailorOrderController::class, 'kanban'])->name('kanban');
        Route::get('manage-catalog', [ProductController::class, 'manage'])->name('manage-catalog');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::post('products/{product}/availability', [ProductController::class, 'availability'])->name('products.availability');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::post('stickers', [StickerController::class, 'store'])->name('stickers.store');
        Route::put('stickers/{sticker}', [StickerController::class, 'update'])->name('stickers.update');
        Route::post('stickers/{sticker}/active', [StickerController::class, 'active'])->name('stickers.active');
        Route::get('reports', [ReportController::class, 'index'])->name('reports');
        Route::get('tailor/dashboard', [TailorOrderController::class, 'dashboard'])->name('tailor.dashboard');
    });
});

require __DIR__.'/settings.php';
