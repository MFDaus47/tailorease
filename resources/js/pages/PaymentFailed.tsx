import { router } from '@inertiajs/react';

export default function PaymentFailed({ order, message }: { order: { id: string }; message?: string | null }) {
    return (
        <div className="max-w-lg space-y-4 py-8">
            <h1 className="text-xl font-bold text-foreground">Payment was not recorded</h1>
            <p className="text-sm text-muted-foreground">{message || 'The order is not in a status that accepts this payment.'}</p>
            <div className="flex gap-3">
                <button onClick={() => router.visit(`/orders/${order.id}/checkout`)} className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg">Try again</button>
                <button onClick={() => router.visit(`/order-tracking/${order.id}`)} className="px-4 py-2.5 border border-border text-sm rounded-lg">Back to order</button>
            </div>
        </div>
    );
}
