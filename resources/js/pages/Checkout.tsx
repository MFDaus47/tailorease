import { router } from '@inertiajs/react';

type Order = {
    id: string;
    product: string;
    status: string;
    deposit: number;
    remaining: number;
};

export default function Checkout({ order }: { order: Order }) {
    const kind = order.status === 'ready' ? 'balance' : 'deposit';
    const amount = kind === 'balance' ? order.remaining : order.deposit;
    const allowed = order.status === 'accepted' || order.status === 'ready';

    return (
        <div className="max-w-lg space-y-5">
            <div>
                <h1 className="text-xl font-bold text-foreground">{kind === 'balance' ? 'Pay balance' : 'Pay deposit'}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{order.product}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-semibold text-foreground">RM{Number(amount).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">This records the payment on the order. Card details are not collected here.</p>
                {allowed ? (
                    <button
                        onClick={() => router.post(`/orders/${order.id}/payments`, { kind })}
                        className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg"
                    >
                        Record {kind}
                    </button>
                ) : (
                    <p className="text-sm text-amber-700">This order is not ready for that payment.</p>
                )}
                <button onClick={() => router.visit(`/order-tracking/${order.id}`)} className="w-full py-2.5 border border-border text-sm rounded-lg">
                    Back to order
                </button>
            </div>
        </div>
    );
}
