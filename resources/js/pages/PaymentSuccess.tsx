import { router } from '@inertiajs/react';

export default function PaymentSuccess({ order }: { order: { id: string } }) {
    return (
        <div className="max-w-lg space-y-4 py-8">
            <h1 className="text-xl font-bold text-foreground">Payment recorded</h1>
            <p className="text-sm text-muted-foreground">The payment is saved on this order.</p>
            <div className="flex gap-3">
                <button onClick={() => router.visit(`/order-tracking/${order.id}`)} className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg">View order</button>
                <button onClick={() => router.visit('/dashboard')} className="px-4 py-2.5 border border-border text-sm rounded-lg">Dashboard</button>
            </div>
        </div>
    );
}
