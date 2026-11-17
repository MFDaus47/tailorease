import { router, usePage } from '@inertiajs/react';
import { Calendar, Download, Eye, Image, Search, X } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

type OrderStatus =
    | 'pending'
    | 'accepted'
    | 'deposit_paid'
    | 'in_production'
    | 'quality_check'
    | 'ready'
    | 'completed'
    | 'rejected';

type Order = {
    id: string;
    customer: string;
    customerEmail: string;
    avatar: string;
    product: string;
    productId?: string;
    size: string;
    quantity: number;
    total: number;
    deposit: number;
    remaining?: number;
    status: OrderStatus;
    date: string;
    deliveryDate: string;
    notes: string | null;
    hasDesign: boolean;
};

type AllOrdersPageProps = {
    orders: Order[];
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: 'accepted',
    accepted: 'deposit_paid',
    deposit_paid: 'in_production',
    in_production: 'quality_check',
    quality_check: 'ready',
    ready: 'completed',
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

function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CONFIG[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function formatCurrency(value: number) {
    return `RM${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatFullDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function urgencyMeta(dateStr: string | null): { label: string; color: string; bg: string; border: string } | null {
    if (!dateStr) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(`${dateStr}T00:00:00`);
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

function exportCsv(search: string, filter: string) {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set('search', search.trim());
    }

    if (filter !== 'all') {
        params.set('filter', filter);
    }

    const query = params.toString();
    window.location.href = `/all-orders/export${query ? `?${query}` : ''}`;
}

export default function AllOrders() {
    const { orders: pageOrders = [] } = usePage<AllOrdersPageProps>().props;
    const [orders, setOrders] = useState<Order[]>(pageOrders);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<string>('all');
    const [selected, setSelected] = useState<Order | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const filtered = useMemo(() => orders.filter(order => {
        const term = search.trim().toLowerCase();
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch = !term ||
            order.id.toLowerCase().includes(term) ||
            order.customer.toLowerCase().includes(term) ||
            order.product.toLowerCase().includes(term);

        return matchesFilter && matchesSearch;
    }), [orders, filter, search]);

    const updateStatus = (status: OrderStatus) => {
        if (!selected) {
            return;
        }

        setUpdatingId(selected.id);

        router.post(`/all-orders/${encodeURIComponent(selected.id)}/status`, { status }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelected(current => current ? { ...current, status } : current);
                setOrders(current => current.map(order => order.id === selected.id ? { ...order, status } : order));
                setUpdatingId(null);
            },
            onError: () => {
                setUpdatingId(null);
            },
        });
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">All Orders</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor every customer order from the database.</p>
                </div>
                <button
                    onClick={() => exportCsv(search, filter)}
                    className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                    <Download size={14} /> Export
                </button>
            </div>

            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by order, customer, product..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-card rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all"
                    />
                </div>
                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="px-3 py-2 text-sm bg-card rounded-lg border border-border focus:outline-none text-foreground"
                >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <Card className={`${selected ? 'lg:col-span-3' : 'lg:col-span-5'} overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    {['Order', 'Customer', 'Product', 'Total', 'Order Date', 'Due Date', 'Status', ''].map(header => (
                                        <th key={header} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3 whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map(order => {
                                    const urgency = urgencyMeta(order.deliveryDate);

                                    return (
                                        <tr
                                            key={order.id}
                                            onClick={() => setSelected(order)}
                                            className={`cursor-pointer transition-colors ${selected?.id === order.id ? 'bg-indigo-50/60' : 'hover:bg-muted/30'}`}
                                        >
                                            <td className="px-5 py-3.5 font-semibold text-indigo-600 whitespace-nowrap">{order.id}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <AvatarBadge initials={order.avatar} />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-foreground truncate">{order.customer}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{order.customerEmail}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-foreground">{order.product}</td>
                                            <td className="px-5 py-3.5 font-semibold whitespace-nowrap">{formatCurrency(order.total)}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{formatDate(order.date)}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-semibold text-foreground whitespace-nowrap">{formatDate(order.deliveryDate)}</span>
                                                    {urgency && (
                                                        <span className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md ${urgency.color} ${urgency.bg}`}>
                                                            {urgency.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                                            <td className="px-5 py-3.5">
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        router.visit(`/order-tracking/${encodeURIComponent(order.id)}`);
                                                    }}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                                                >
                                                    <Eye size={13} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length === 0 && (
                        <div className="py-16 text-center">
                            <p className="text-sm font-medium text-muted-foreground">No orders found</p>
                        </div>
                    )}
                </Card>

                {selected && (
                    <Card className="lg:col-span-2 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">Order Details</h3>
                            <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                            <AvatarBadge initials={selected.avatar} color="violet" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{selected.customer}</p>
                                <p className="text-xs text-muted-foreground truncate">{selected.customerEmail}</p>
                            </div>
                        </div>

                        {(() => {
                            const urgency = urgencyMeta(selected.deliveryDate);
                            const daysLeft = Math.max(0, Math.round((new Date(`${selected.deliveryDate}T00:00:00`).getTime() - Date.now()) / 86400000));

                            return (
                                <div className={`rounded-xl border-2 overflow-hidden ${urgency ? urgency.border : 'border-border'}`}>
                                    <div className={`px-3.5 py-2.5 flex items-center gap-3 ${urgency ? urgency.bg : 'bg-muted/30'}`}>
                                        <Calendar size={16} className={urgency ? urgency.color : 'text-muted-foreground'} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Due Date</p>
                                            <p className={`text-sm font-bold mt-0.5 ${urgency ? urgency.color : 'text-foreground'}`}>{formatFullDate(selected.deliveryDate)}</p>
                                        </div>
                                        <div className={`text-center px-2.5 py-1.5 rounded-lg ${urgency ? `${urgency.bg} border ${urgency.border}` : ''}`}>
                                            <p className={`text-xl font-black leading-none ${urgency ? urgency.color : 'text-foreground'}`}>{daysLeft}</p>
                                            <p className={`text-xs font-semibold ${urgency ? urgency.color : 'text-muted-foreground'}`}>days</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="space-y-2 text-sm">
                            {[
                                ['Order ID', selected.id],
                                ['Product', selected.product],
                                ['Size', selected.size],
                                ['Quantity', `×${selected.quantity}`],
                                ['Total', formatCurrency(selected.total)],
                                ['Deposit', formatCurrency(selected.deposit)],
                                ['Remaining', formatCurrency(selected.remaining ?? selected.total - selected.deposit)],
                                ['Order Date', formatDate(selected.date)],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className="font-medium text-foreground text-right">{value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <StatusBadge status={selected.status} />
                            {selected.hasDesign && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Image size={14} /> Design attached
                                </span>
                            )}
                        </div>

                        {selected.notes && (
                            <div className="bg-muted rounded-lg p-3">
                                <p className="text-xs font-semibold text-foreground mb-1">Customer Notes</p>
                                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{selected.notes}</p>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1.5">Status</label>
                            <select
                                value={NEXT_STATUS[selected.status] ?? selected.status}
                                onChange={e => updateStatus(e.target.value as OrderStatus)}
                                className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none text-foreground"
                            >
                                <option value={selected.status}>{STATUS_CONFIG[selected.status].label}</option>
                                {NEXT_STATUS[selected.status] && (
                                    <option value={NEXT_STATUS[selected.status]}>{STATUS_CONFIG[NEXT_STATUS[selected.status]!].label}</option>
                                )}
                            </select>
                        </div>

                        <button
                            onClick={() => updateStatus(selected.status)}
                            disabled={updatingId === selected.id}
                            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updatingId === selected.id ? 'Updating...' : 'Update Status'}
                        </button>
                    </Card>
                )}
            </div>
        </div>
    );
}
