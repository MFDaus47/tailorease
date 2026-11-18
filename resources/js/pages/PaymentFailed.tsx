import { router } from '@inertiajs/react';
import { orderNumber } from '@/lib/order-label';

export default function PaymentFailed({ order, message }: { order: { id: string; number?: string | null }; message?: string | null }) {
    return (
        <div className="max-w-lg space-y-4 py-8">
            <h1 className="text-xl font-bold text-foreground">Payment was not recorded</h1>
            <p className="text-sm text-muted-foreground">{message || 'The order is not in a status that accepts this payment.'} Nothing was sent to a payment gateway.</p>
            <p className="text-sm text-foreground">Order {orderNumber(order)}</p>
            <div className="flex gap-3">
                <button onClick={() => router.visit(`/orders/${order.id}/checkout`)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Try again</button>
                <button onClick={() => router.visit(`/order-tracking/${order.id}`)} className="rounded-lg border border-border px-4 py-2.5 text-sm">Back to order</button>
            </div>
        </div>
    );
}
