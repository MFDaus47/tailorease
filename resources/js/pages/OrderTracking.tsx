import { router, usePage, usePoll } from '@inertiajs/react';
import {
    Check, CheckCircle, ChevronLeft, Clock, CreditCard, MessageSquare,
    Package, Scissors, Send, Star, XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import DesignPreview from '@/components/orders/DesignPreview';
import RejectOrderDialog from '@/components/orders/RejectOrderDialog';
import { Card } from '@/components/ui/card';
import { gsap, motionReduced, useGSAP } from '@/lib/gsap';
import { activeSizes, orderNumber, orderTitle } from '@/lib/order-label';

type OrderStatus =
    | 'pending'
    | 'accepted'
    | 'deposit_paid'
    | 'in_production'
    | 'quality_check'
    | 'ready'
    | 'completed'
    | 'rejected';

type Message = {
    id: string;
    sender: 'customer' | 'tailor';
    text: string;
    time: string;
};

type OrderItem = {
    product_id?: string;
    product_name: string;
    sizes: Record<string, number>;
    total_quantity: number;
    base_price: number;
    subtotal: number;
};

type Order = {
    id: string;
    number?: string | null;
    name?: string | null;
    product: string;
    customer?: string;
    quantity: number;
    size: string;
    total: number;
    deposit: number;
    date: string;
    deliveryDate: string;
    status: OrderStatus;
    notes: string | null;
    hasDesign: boolean;
    items?: OrderItem[] | null;
    remaining?: number | null;
    remaining_balance?: number | null;
    due_date?: string | null;
    designPreview?: string | null;
};

type Viewer = {
    role: 'customer' | 'tailor';
    canDecide: boolean;
    canPayDeposit: boolean;
    canPayBalance: boolean;
    canEdit: boolean;
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; dot: string }> = {
    pending: { label: 'Pending Review', color: 'text-amber-700', bg: 'bg-amber-50 border border-amber-200', dot: 'bg-amber-500' },
    accepted: { label: 'Accepted', color: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200', dot: 'bg-blue-500' },
    deposit_paid: { label: 'Deposit Paid', color: 'text-indigo-700', bg: 'bg-indigo-50 border border-indigo-200', dot: 'bg-indigo-500' },
    in_production: { label: 'In Production', color: 'text-violet-700', bg: 'bg-violet-50 border border-violet-200', dot: 'bg-violet-500' },
    quality_check: { label: 'Quality Check', color: 'text-cyan-700', bg: 'bg-cyan-50 border border-cyan-200', dot: 'bg-cyan-500' },
    ready: { label: 'Ready for Collection', color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200', dot: 'bg-emerald-500' },
    completed: { label: 'Completed', color: 'text-slate-700', bg: 'bg-slate-100 border border-slate-200', dot: 'bg-slate-500' },
    rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50 border border-red-200', dot: 'bg-red-500' },
};

const DEPOSIT_RECORDED: OrderStatus[] = ['deposit_paid', 'in_production', 'quality_check', 'ready', 'completed'];

const TIMELINE_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'pending', label: 'Pending Review', icon: <Clock size={14} /> },
    { key: 'accepted', label: 'Accepted', icon: <Check size={14} /> },
    { key: 'deposit_paid', label: 'Deposit Paid', icon: <CreditCard size={14} /> },
    { key: 'in_production', label: 'In Production', icon: <Scissors size={14} /> },
    { key: 'quality_check', label: 'Quality Check', icon: <CheckCircle size={14} /> },
    { key: 'ready', label: 'Ready for Collection', icon: <Package size={14} /> },
    { key: 'completed', label: 'Completed', icon: <Star size={14} /> },
];

const STEP_ORDER: OrderStatus[] = ['pending', 'accepted', 'deposit_paid', 'in_production', 'quality_check', 'ready', 'completed'];

function formatCurrency(value: number) {
    return `RM${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getOrderItems(order: Order): OrderItem[] {
    if (order.items && order.items.length > 0) {
        return order.items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            sizes: typeof item.sizes === 'object' ? item.sizes : {},
            total_quantity: item.total_quantity,
            base_price: item.base_price,
            subtotal: item.subtotal,
        }));
    }

    return [{
        product_name: order.product,
        sizes: {},
        total_quantity: order.quantity,
        base_price: order.quantity > 0 ? order.total / order.quantity : 0,
        subtotal: order.total,
    }];
}

function getRemainingBalance(order: Order) {
    if (typeof order.remaining === 'number') {
        return order.remaining;
    }

    if (typeof order.remaining_balance === 'number') {
        return order.remaining_balance;
    }

    return order.total - order.deposit;
}

function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CONFIG[status];

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color} ${cfg.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

export default function OrderTracking() {
    const { order, messages = [], viewer } = usePage<{ order?: Order; messages?: Message[]; viewer?: Viewer }>().props;
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [rejectOpen, setRejectOpen] = useState(false);
    const [deciding, setDeciding] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    const threadRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (motionReduced()) {
            return;
        }

        gsap.from('[data-step]', {
            x: -8,
            opacity: 0,
            duration: 0.3,
            stagger: 0.04,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
        });
    }, { scope: pageRef });

    usePoll(4000, { only: ['messages'] }, { keepAlive: false });

    useEffect(() => {
        if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight;
        }
    }, [messages.length]);

    if (!order || !viewer) {
        return (
            <div className="space-y-5">
                <button onClick={() => router.visit('/my-orders')} className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                    <ChevronLeft size={16} /> Back to orders
                </button>
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    No order data was provided.
                </div>
            </div>
        );
    }

    const currentStepIdx = STEP_ORDER.indexOf(order.status);
    const depositRecorded = DEPOSIT_RECORDED.includes(order.status);
    const reference = orderNumber(order);
    const title = orderTitle(order);

    const goBack = () => {
        if (viewer.role === 'tailor') {
            router.visit(order.status === 'pending' ? '/incoming' : '/all-orders');

            return;
        }

        router.visit('/my-orders');
    };

    const sendMsg = () => {
        if (!newMsg.trim() || sending) {
            return;
        }

        setSending(true);
        setSendError('');
        router.post(`/orders/${order.id}/messages`, { body: newMsg }, {
            preserveScroll: true,
            onSuccess: () => setNewMsg(''),
            onError: () => setSendError('The message could not be sent.'),
            onFinish: () => setSending(false),
        });
    };

    const accept = () => {
        setDeciding(true);
        router.post(`/incoming/${encodeURIComponent(order.id)}/accept`, {}, {
            preserveScroll: true,
            onFinish: () => setDeciding(false),
        });
    };

    const reject = (reason: string, notes: string) => {
        setDeciding(true);
        router.post(`/incoming/${encodeURIComponent(order.id)}/reject`, { reason, notes }, {
            preserveScroll: true,
            onSuccess: () => setRejectOpen(false),
            onFinish: () => setDeciding(false),
        });
    };

    const items = getOrderItems(order);

    return (
        <div ref={pageRef} className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
                <button onClick={goBack} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                    <ChevronLeft size={18} />
                </button>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-xl font-bold text-foreground">{title}</h1>
                        <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {reference} · Placed {order.date} · Expected {order.due_date ?? order.deliveryDate}
                        {viewer.role === 'tailor' && order.customer ? ` · ${order.customer}` : ''}
                    </p>
                </div>
                {viewer.canPayBalance && (
                    <button onClick={() => router.visit(`/orders/${order.id}/checkout`)} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
                        <CreditCard size={15} /> Pay Balance
                    </button>
                )}
                {viewer.canPayDeposit && (
                    <button onClick={() => router.visit(`/orders/${order.id}/checkout`)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                        <CreditCard size={15} /> Pay Deposit
                    </button>
                )}
                {viewer.canDecide && (
                    <>
                        <button onClick={accept} disabled={deciding} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Accept</button>
                        <button onClick={() => setRejectOpen(true)} disabled={deciding} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50">Reject</button>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card className="p-5">
                        <h3 className="mb-5 text-sm font-semibold text-foreground">Order Progress</h3>
                        {order.status === 'rejected' ? (
                            <div className="flex flex-col gap-3 rounded-lg border border-red-100 bg-red-50 p-4">
                                <div className="flex items-center gap-3">
                                    <XCircle size={20} className="text-red-500" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-700">Order Rejected</p>
                                        <p className="mt-0.5 text-xs text-red-500">Review the notes and resubmit if this is your order.</p>
                                    </div>
                                </div>
                                {viewer.canEdit && (
                                    <button onClick={() => router.visit(`/orders/${order.id}/edit`)} className="self-start rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">
                                        Edit & Resubmit
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-border" />
                                <div className="space-y-4">
                                    {TIMELINE_STEPS.map((step, idx) => {
                                        const done = idx < currentStepIdx;
                                        const active = idx === currentStepIdx;

                                        return (
                                            <div key={step.key} data-step className="relative flex items-center gap-4">
                                                <div className={`z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                                                    done ? 'border-indigo-600 bg-indigo-600 text-white' :
                                                    active ? 'border-indigo-500 bg-white text-indigo-600' :
                                                    'border-border bg-white text-muted-foreground'
                                                }`}>
                                                    {done ? <Check size={14} /> : step.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${active ? 'text-indigo-600' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {viewer.canEdit && order.status === 'pending' && (
                            <button onClick={() => router.visit(`/orders/${order.id}/edit`)} className="mt-4 text-sm font-medium text-indigo-600">
                                Edit order
                            </button>
                        )}
                    </Card>

                    <Card className="flex h-[380px] flex-col">
                        <div className="flex flex-shrink-0 items-center gap-3 border-b border-border px-5 py-3.5">
                            <MessageSquare size={16} className="text-indigo-500" />
                            <h3 className="text-sm font-semibold text-foreground">Conversation</h3>
                        </div>
                        <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                            {messages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <MessageSquare size={28} className="mb-2 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">No messages yet.</p>
                                </div>
                            ) : messages.map((msg) => {
                                const mine = msg.sender === viewer.role;

                                return (
                                    <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs rounded-lg px-4 py-2.5 ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                                            <p className={`text-[11px] font-medium ${mine ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                {mine ? 'You' : msg.sender === 'tailor' ? 'Tailor' : 'Customer'}
                                            </p>
                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                            <p className={`mt-1 text-xs ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex-shrink-0 px-4 pb-4">
                            <div className="flex gap-2">
                                <input
                                    value={newMsg}
                                    onChange={(event) => setNewMsg(event.target.value)}
                                    onKeyDown={(event) => event.key === 'Enter' && sendMsg()}
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-lg border border-border bg-muted px-3.5 py-2 text-sm focus:outline-none"
                                />
                                <button onClick={sendMsg} disabled={sending || !newMsg.trim()} className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-40">
                                    <Send size={16} />
                                </button>
                            </div>
                            {sendError && <p className="mt-2 text-xs text-red-700">{sendError}</p>}
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="p-4">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">Order Details</h3>
                        <div className="space-y-2.5 text-sm">
                            {items.map((item, idx) => {
                                const sizes = activeSizes(item.sizes);

                                return (
                                    <div key={idx} className="space-y-2 rounded-lg border border-border bg-muted/50 p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                                            <span className="text-xs font-semibold text-indigo-700">{item.total_quantity}×</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{formatCurrency(Number(item.subtotal) || 0)}</p>
                                        {sizes.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {sizes.map(({ size, qty }) => (
                                                    <span key={size} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium">
                                                        <span className="text-muted-foreground">{size}</span>
                                                        <span className="text-indigo-600">×{qty}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">Financial Summary</h3>
                        <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Amount</span>
                                <span className="font-medium text-foreground">{formatCurrency(order.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{depositRecorded ? 'Deposit paid' : 'Deposit due'}</span>
                                <span className="font-medium text-foreground">{formatCurrency(order.deposit)}</span>
                            </div>
                            <div className="my-1 h-px bg-border" />
                            <div className="flex justify-between">
                                <span className="font-medium text-muted-foreground">Remaining Balance</span>
                                <span className="font-semibold text-foreground">{formatCurrency(getRemainingBalance(order))}</span>
                            </div>
                        </div>
                    </Card>

                    {order.hasDesign && (
                        <Card className="p-4">
                            <h3 className="mb-3 text-sm font-semibold text-foreground">Design</h3>
                            <DesignPreview src={order.designPreview} label={`${reference} design`} />
                        </Card>
                    )}

                    {order.notes && (
                        <Card className="p-4">
                            <h3 className="mb-2 text-sm font-semibold text-foreground">Special Instructions</h3>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{order.notes}</p>
                        </Card>
                    )}
                </div>
            </div>

            <RejectOrderDialog open={rejectOpen} busy={deciding} onClose={() => setRejectOpen(false)} onConfirm={reject} />
        </div>
    );
}
