import { router, usePage } from '@inertiajs/react';
import { Calendar, Check, Eye, Inbox, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import DesignPreview from '@/components/orders/DesignPreview';
import RejectOrderDialog from '@/components/orders/RejectOrderDialog';
import { Card } from '@/components/ui/card';
import { gsap, motionReduced, useGSAP } from '@/lib/gsap';
import { activeSizes, matchesOrderQuery, orderNumber, orderTitle } from '@/lib/order-label';

type OrderItem = {
    product_name: string;
    sizes: Record<string, number>;
    total_quantity: number;
};

type Order = {
    id: string;
    number?: string | null;
    name?: string | null;
    customer: string;
    customerEmail: string;
    avatar: string;
    product: string;
    size: string;
    quantity: number;
    total: number;
    deposit: number;
    date: string;
    deliveryDate: string;
    notes: string | null;
    hasDesign: boolean;
    designPreview?: string | null;
    items?: OrderItem[];
};

function urgencyMeta(dateStr: string | null): { label: string; color: string; bg: string; border: string } | null {
    if (!dateStr) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const days = Math.round((due.getTime() - today.getTime()) / 86400000);

    if (days < 0) {
        return { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' };
    }

    if (days <= 7) {
        return { label: `${days}d left`, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    }

    if (days <= 14) {
        return { label: `${days}d left`, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    }

    return { label: `${days}d left`, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
}

export default function IncomingOrders() {
    const { orders: pageOrders = [] } = usePage<{ orders: Order[] }>().props;
    const [orders, setOrders] = useState<Order[]>(pageOrders);
    const [search, setSearch] = useState('');
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectTarget, setRejectTarget] = useState('');
    const root = useRef<HTMLDivElement>(null);
    const visible = useMemo(
        () => orders.filter((order) => matchesOrderQuery(order, search)),
        [orders, search],
    );

    useGSAP(() => {
        if (motionReduced()) {
            return;
        }

        gsap.from('[data-incoming-order]', {
            y: 8,
            opacity: 0,
            duration: 0.35,
            stagger: 0.04,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
        });
    }, { scope: root });

    const accept = (id: string) => {
        router.post(`/incoming/${encodeURIComponent(id)}/accept`, {}, {
            onSuccess: () => setOrders((current) => current.filter((order) => order.id !== id)),
        });
    };

    const confirmReject = (reason: string, notes: string) => {
        if (!rejectTarget) {
            return;
        }

        router.post(`/incoming/${encodeURIComponent(rejectTarget)}/reject`, { reason, notes }, {
            onSuccess: () => {
                setOrders((current) => current.filter((order) => order.id !== rejectTarget));
                setRejectOpen(false);
                setRejectTarget('');
            },
        });
    };

    return (
        <div ref={root} className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Incoming Orders</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">Review the order, then accept or reject it here.</p>
                </div>
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search number or name"
                    className="w-full max-w-xs rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none"
                />
            </div>

            {visible.length === 0 ? (
                <Card className="py-16 text-center">
                    <Inbox size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">{orders.length === 0 ? 'No pending orders' : 'No orders match that search'}</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {visible.map((order) => {
                        const urgency = urgencyMeta(order.deliveryDate);
                        const items = order.items?.length ? order.items : [{ product_name: order.product, sizes: {}, total_quantity: order.quantity }];

                        return (
                            <Card key={order.id} data-incoming-order className="p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-600">{orderNumber(order)}</p>
                                        <h2 className="mt-1 text-base font-semibold text-foreground">{orderTitle(order)}</h2>
                                        <p className="text-sm text-foreground">{order.customer}</p>
                                        <p className="text-xs text-muted-foreground">{order.customerEmail} · {order.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-foreground">RM{order.total}</p>
                                        <p className="text-xs text-muted-foreground">Deposit RM{order.deposit}</p>
                                    </div>
                                </div>

                                <div className={`mt-3 flex items-center gap-3 rounded-lg border px-3 py-2 ${urgency ? `${urgency.border} ${urgency.bg}` : 'border-border'}`}>
                                    <Calendar size={16} className={urgency ? urgency.color : 'text-muted-foreground'} />
                                    <p className={`text-sm font-medium ${urgency ? urgency.color : 'text-foreground'}`}>
                                        Due {order.deliveryDate || 'not set'}{urgency ? ` · ${urgency.label}` : ''}
                                    </p>
                                </div>

                                <div className="mt-3 space-y-2">
                                    {items.map((item, index) => {
                                        const sizes = activeSizes(item.sizes);

                                        return (
                                            <div key={`${item.product_name}-${index}`} className="rounded-lg bg-muted px-3 py-2">
                                                <p className="text-sm font-medium text-foreground">{item.product_name} · {item.total_quantity} pcs</p>
                                                {sizes.length > 0 && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {sizes.map(({ size, qty }) => `${size} ×${qty}`).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {order.notes && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{order.notes}</p>}

                                {order.hasDesign && order.designPreview && (
                                    <div className="mt-3 max-w-xs">
                                        <DesignPreview src={order.designPreview} label={`${orderNumber(order)} design`} />
                                    </div>
                                )}

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <button onClick={() => accept(order.id)} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white">
                                        <Check size={14} /> Accept
                                    </button>
                                    <button onClick={() => { setRejectTarget(order.id); setRejectOpen(true); }} className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">
                                        <X size={14} /> Reject
                                    </button>
                                    <button onClick={() => router.visit(`/order-tracking/${encodeURIComponent(order.id)}`)} className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                                        <Eye size={13} /> View details
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <RejectOrderDialog
                key={rejectTarget || 'reject'}
                open={rejectOpen}
                onClose={() => { setRejectOpen(false); setRejectTarget(''); }}
                onConfirm={confirmReject}
            />
        </div>
    );
}
