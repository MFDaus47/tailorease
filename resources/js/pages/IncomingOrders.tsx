import { router, usePage } from '@inertiajs/react';
import { Calendar, Check, Eye, FileText, Image, Inbox, X } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { View } from '@/types';

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

type Order = {
    id: string;
    customer: string;
    customerEmail: string;
    avatar: string;
    product: string;
    productId: string;
    size: string;
    quantity: number;
    total: number;
    deposit: number;
    status: OrderStatus;
    date: string;
    deliveryDate: string;
    notes: string;
    hasDesign: boolean;
    messages: Message[];
};

type IncomingOrdersProps = {
    orders: Order[];
};

type IncomingOrdersPageProps = {
    onNavigate?: (view: View) => void;
    onSelectOrder?: (order: Order) => void;
};

function AvatarBadge({ initials, color = 'violet' }: { initials: string; color?: string }) {
    const colors: Record<string, string> = {
        indigo: 'bg-indigo-100 text-indigo-700',
        violet: 'bg-violet-100 text-violet-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
    };

    return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${colors[color] || colors.violet}`}>
            {initials}
        </div>
    );
}

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

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

function navigateToOrder(order: Order, onSelectOrder?: (order: Order) => void, onNavigate?: (view: View) => void) {
    onSelectOrder?.(order);

    if (onNavigate) {
        onNavigate('order-tracking');

        return;
    }

    router.visit(`/order-tracking/${encodeURIComponent(order.id)}`);
}

export default function IncomingOrders({ onNavigate, onSelectOrder }: IncomingOrdersPageProps) {
    const { orders: pageOrders = [] } = usePage<IncomingOrdersProps>().props;
    const [orders, setOrders] = useState<Order[]>(pageOrders);
    const [rejectModal, setRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectTarget, setRejectTarget] = useState('');

    const accept = (id: string) => {
        router.post(`/incoming/${encodeURIComponent(id)}/accept`, {}, {
            onSuccess: () => {
                setOrders(current => current.filter(order => order.id !== id));
            },
        });
    };

    const openReject = (id: string) => {
        setRejectTarget(id);
        setRejectModal(true);
    };

    const confirmReject = () => {
        if (!rejectReason || !rejectTarget) {
            return;
        }

        router.post(`/incoming/${encodeURIComponent(rejectTarget)}/reject`, { reason: rejectReason }, {
            onSuccess: () => {
                setOrders(current => current.filter(order => order.id !== rejectTarget));
                setRejectModal(false);
                setRejectReason('');
                setRejectTarget('');
            },
        });
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-foreground">Incoming Orders</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Review and respond to new customer orders.</p>
            </div>

            {orders.length === 0 ? (
                <Card className="py-20 text-center">
                    <Inbox size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No pending orders</p>
                    <p className="text-xs text-muted-foreground mt-1">All caught up!</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <Card key={order.id} className="p-5">
                            <div className="flex items-start gap-4">
                                <AvatarBadge initials={order.avatar} color="violet" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between flex-wrap gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-indigo-600">{order.id}</span>
                                                <span className="text-xs text-muted-foreground">·</span>
                                                <span className="text-xs text-muted-foreground">{order.date}</span>
                                                {order.hasDesign && (
                                                    <span className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                                                        <Image size={10} /> Has design file
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">{order.customer}</p>
                                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-foreground">RM{order.total}</p>
                                            <p className="text-xs text-muted-foreground">Deposit: RM{order.deposit}</p>
                                        </div>
                                    </div>

                                    {(() => {
                                        const urgency = urgencyMeta(order.deliveryDate);
                                        const dueDisplay = new Date(order.deliveryDate).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        });

                                        return (
                                            <div className={`mt-3 flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${urgency ? `${urgency.border} ${urgency.bg}` : 'border-border bg-muted/30'}`}>
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${urgency ? urgency.bg : 'bg-muted'}`}>
                                                    <Calendar size={17} className={urgency ? urgency.color : 'text-muted-foreground'} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer Due Date</p>
                                                    <p className={`text-sm font-bold mt-0.5 ${urgency ? urgency.color : 'text-foreground'}`}>{dueDisplay}</p>
                                                </div>
                                                {urgency && (
                                                    <div className={`flex-shrink-0 text-center px-3 py-1.5 rounded-lg border ${urgency.border} ${urgency.bg}`}>
                                                        <p className={`text-lg font-black leading-none ${urgency.color}`}>
                                                            {Math.max(0, Math.round((new Date(order.deliveryDate).getTime() - Date.now()) / 86400000))}
                                                        </p>
                                                        <p className={`text-xs font-semibold ${urgency.color}`}>days left</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    <div className="mt-3 grid grid-cols-3 gap-3">
                                        {[
                                            ['Product', order.product],
                                            ['Size', order.size],
                                            ['Quantity', `×${order.quantity}`],
                                        ].map(([label, value]) => (
                                            <div key={label} className="bg-muted rounded-lg p-2.5">
                                                <p className="text-xs text-muted-foreground">{label}</p>
                                                <p className="text-xs font-semibold text-foreground mt-0.5">{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {order.notes && (
                                        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                                            <FileText size={13} className="mt-0.5 flex-shrink-0" />
                                            <span>{order.notes}</span>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center gap-3">
                                        <button onClick={() => accept(order.id)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                                            <Check size={14} /> Accept Order
                                        </button>
                                        <button onClick={() => openReject(order.id)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                                            <X size={14} /> Reject
                                        </button>
                                        <button onClick={() => navigateToOrder(order, onSelectOrder, onNavigate)} className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                                            <Eye size={13} /> View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject Order">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Please provide a reason for rejecting this order. The customer will be notified.</p>
                    <div>
                        <label className="text-xs font-semibold text-foreground block mb-2">Rejection Reason</label>
                        {['Unable to source required fabric', 'Delivery date not feasible', 'Design too complex for current capacity', 'Other'].map(reason => (
                            <label key={reason} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer mb-2 transition-all ${rejectReason === reason ? 'border-red-400 bg-red-50' : 'border-border hover:border-red-200'}`}>
                                <input type="radio" name="reason" value={reason} checked={rejectReason === reason} onChange={() => setRejectReason(reason)} className="accent-red-500" />
                                <span className="text-sm text-foreground">{reason}</span>
                            </label>
                        ))}
                    </div>
                    <textarea placeholder="Additional notes (optional)..." rows={3} className="w-full px-3 py-2.5 text-sm bg-muted rounded-lg border border-border focus:outline-none resize-none placeholder:text-muted-foreground" />
                    <div className="flex gap-3">
                        <button onClick={() => setRejectModal(false)} className="flex-1 py-2.5 border border-border text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted transition-colors">Cancel</button>
                        <button onClick={confirmReject} disabled={!rejectReason} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors">
                            Confirm Rejection
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
