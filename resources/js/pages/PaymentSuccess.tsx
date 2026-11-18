import { router } from '@inertiajs/react';
import { orderNumber, orderTitle } from '@/lib/order-label';

type Order = {
    id: string;
    number?: string | null;
    name?: string | null;
    product: string;
};

function money(value: number) {
    return `RM${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PaymentSuccess({ order, payment }: { order: Order; payment?: { kind?: string | null; amount?: number | null } }) {
    const kind = payment?.kind === 'balance' ? 'Balance' : 'Deposit';
    const amount = Number(payment?.amount ?? 0);

    return (
        <div className="max-w-lg space-y-4 py-8">
            <h1 className="text-xl font-bold text-foreground">Payment recorded</h1>
            <p className="text-sm text-muted-foreground">
                {kind} of {money(amount)} for {orderNumber(order)} was recorded in TailorEase. It was not sent to a payment gateway.
            </p>
            <div className="space-y-2 rounded-lg border border-border bg-card p-4 text-sm">
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Order</span><span className="font-medium">{orderNumber(order)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Title</span><span className="font-medium text-right">{orderTitle(order)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Amount</span><span className="font-medium">{money(amount)}</span></div>
            </div>
            <div className="flex gap-3">
                <button onClick={() => router.visit(`/order-tracking/${order.id}`)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">View order</button>
                <button onClick={() => router.visit('/dashboard')} className="rounded-lg border border-border px-4 py-2.5 text-sm">Dashboard</button>
            </div>
        </div>
    );
}
