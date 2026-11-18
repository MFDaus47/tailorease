import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { gsap, motionReduced, useGSAP } from '@/lib/gsap';
import { orderNumber, orderTitle } from '@/lib/order-label';

type Order = {
    id: string;
    number?: string | null;
    name?: string | null;
    product: string;
    status: string;
    deposit: number;
    remaining: number;
    total: number;
};

const BANKS = ['Maybank', 'CIMB', 'Public Bank', 'RHB'];

function money(value: number) {
    return `RM${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCard(value: string) {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 4);

    if (digits.length <= 2) {
        return digits;
    }

    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export default function Checkout({ order }: { order: Order }) {
    const root = useRef<HTMLDivElement>(null);
    const kind = order.status === 'ready' ? 'balance' : 'deposit';
    const amount = kind === 'balance' ? order.remaining : order.deposit;
    const allowed = order.status === 'accepted' || order.status === 'ready';
    const [method, setMethod] = useState<'card' | 'bank'>('card');
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [bank, setBank] = useState(BANKS[0]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useGSAP(() => {
        if (motionReduced()) {
            return;
        }

        gsap.from('[data-pay-section]', {
            y: 8,
            opacity: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
        });
    }, { scope: root });

    const pay = () => {
        if (!allowed || submitting) {
            return;
        }

        if (method === 'card') {
            const digits = cardNumber.replace(/\D/g, '');
            const expiryDigits = expiry.replace(/\D/g, '');

            if (cardName.trim().length < 2 || digits.length < 16 || expiryDigits.length < 4 || cvc.length < 3) {
                setError('Enter the card name, number, expiry, and CVC to continue.');

                return;
            }
        }

        setError('');
        setSubmitting(true);
        router.post(`/orders/${order.id}/payments`, { kind }, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div ref={root} className="mx-auto max-w-3xl space-y-5">
            <div data-pay-section>
                <h1 className="text-xl font-bold text-foreground">{kind === 'balance' ? 'Pay balance' : 'Pay deposit'}</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">{orderNumber(order)} · {orderTitle(order)}</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-5">
                <div data-pay-section className="space-y-4 lg:col-span-3">
                    <div className="rounded-lg border border-border bg-card p-5">
                        <p className="text-sm font-semibold text-foreground">Payment method</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {(['card', 'bank'] as const).map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setMethod(option)}
                                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${method === option ? 'border-foreground bg-muted text-foreground' : 'border-border text-muted-foreground'}`}
                                >
                                    {option === 'card' ? 'Card' : 'Online banking'}
                                </button>
                            ))}
                        </div>

                        {method === 'card' ? (
                            <div className="mt-4 space-y-3">
                                <label className="block text-xs font-medium text-foreground">
                                    Name on card
                                    <input value={cardName} onChange={(event) => setCardName(event.target.value)} autoComplete="cc-name" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                </label>
                                <label className="block text-xs font-medium text-foreground">
                                    Card number
                                    <input value={cardNumber} onChange={(event) => setCardNumber(formatCard(event.target.value))} inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block text-xs font-medium text-foreground">
                                        Expiry
                                        <input value={expiry} onChange={(event) => setExpiry(formatExpiry(event.target.value))} inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                    </label>
                                    <label className="block text-xs font-medium text-foreground">
                                        CVC
                                        <input value={cvc} onChange={(event) => setCvc(event.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" autoComplete="cc-csc" placeholder="123" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label className="mt-4 block text-xs font-medium text-foreground">
                                Bank
                                <select value={bank} onChange={(event) => setBank(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none">
                                    {BANKS.map((name) => <option key={name}>{name}</option>)}
                                </select>
                            </label>
                        )}
                        <p className="mt-4 text-xs text-muted-foreground">Card details stay in this browser. Confirming records the payment in TailorEase and does not send a charge to a gateway.</p>
                        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
                    </div>
                </div>

                <div data-pay-section className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
                    <p className="text-sm font-semibold text-foreground">Amount due</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{money(amount)}</p>
                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Order total</span>
                            <span>{money(order.total)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Deposit</span>
                            <span>{money(order.deposit)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Balance</span>
                            <span>{money(order.remaining)}</span>
                        </div>
                        <div className="flex justify-between gap-3 border-t border-border pt-2 font-medium">
                            <span>{kind === 'balance' ? 'Paying now' : 'Deposit now'}</span>
                            <span>{money(amount)}</span>
                        </div>
                    </div>
                    {allowed ? (
                        <button type="button" onClick={pay} disabled={submitting} className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                            {submitting ? 'Recording…' : `Pay ${money(amount)}`}
                        </button>
                    ) : (
                        <p className="mt-5 text-sm text-amber-700">This order is not ready for that payment.</p>
                    )}
                    <button type="button" onClick={() => router.visit(`/order-tracking/${order.id}`)} className="mt-2 w-full rounded-lg border border-border py-2.5 text-sm">
                        Back to order
                    </button>
                </div>
            </div>
        </div>
    );
}
