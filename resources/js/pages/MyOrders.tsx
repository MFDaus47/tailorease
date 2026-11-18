import { router, usePage } from '@inertiajs/react';
import { Search, Plus, Eye, Package, Calendar, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { matchesOrderQuery, orderNumber } from '@/lib/order-label';
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

type Order = {
    id: string;
    number?: string | null;
    name?: string | null;
    product: string;
    quantity: number;
    size: string;
    total: number;
    deposit: number;
    date: string;
    due_date: string | null;
    deliveryDate: string;
    status: OrderStatus;
    notes: string | null;
    hasDesign: boolean;
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; dot: string }> = {
    pending:       { label: 'Pending Review',       color: 'text-amber-700',   bg: 'bg-amber-50 border border-amber-200',   dot: 'bg-amber-500' },
    accepted:      { label: 'Accepted',             color: 'text-blue-700',    bg: 'bg-blue-50 border border-blue-200',     dot: 'bg-blue-500' },
    deposit_paid:  { label: 'Deposit Paid',         color: 'text-indigo-700',  bg: 'bg-indigo-50 border border-indigo-200', dot: 'bg-indigo-500' },
    in_production: { label: 'In Production',        color: 'text-violet-700',  bg: 'bg-violet-50 border border-violet-200', dot: 'bg-violet-500' },
    quality_check: { label: 'Quality Check',        color: 'text-cyan-700',    bg: 'bg-cyan-50 border border-cyan-200',     dot: 'bg-cyan-500' },
    ready:         { label: 'Ready for Collection', color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200', dot: 'bg-emerald-500' },
    completed:     { label: 'Completed',            color: 'text-slate-700',   bg: 'bg-slate-100 border border-slate-200',  dot: 'bg-slate-500' },
    rejected:      { label: 'Rejected',             color: 'text-red-700',     bg: 'bg-red-50 border border-red-200',       dot: 'bg-red-500' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function DaysLeftBadge({ dueDateStr }: { dueDateStr: string | null }) {
    if (!dueDateStr) return <span className="text-xs text-muted-foreground">—</span>;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr); due.setHours(0, 0, 0, 0);
    const days = Math.round((due.getTime() - today.getTime()) / 86400000);

    const formatted = due.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

    let badgeClass = '';
    let label = '';

    if (days < 0) {
        badgeClass = 'bg-red-50 border border-red-200 text-red-700';
        label = 'Overdue';
    } else if (days === 0) {
        badgeClass = 'bg-red-50 border border-red-200 text-red-700';
        label = 'Today';
    } else if (days <= 7) {
        badgeClass = 'bg-red-50 border border-red-200 text-red-600';
        label = `${days}d left`;
    } else if (days <= 14) {
        badgeClass = 'bg-amber-50 border border-amber-200 text-amber-700';
        label = `${days}d left`;
    } else {
        badgeClass = 'bg-emerald-50 border border-emerald-200 text-emerald-700';
        label = `${days}d left`;
    }

    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">{formatted}</p>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${badgeClass}`}>
                <Clock size={9} />
                {label}
            </span>
        </div>
    );
}

function formatTotal(total: number) {
    return `RM${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function navigateToOrder(order: Order, onSelectOrder?: (order: Order) => void, onNavigate?: (view: View) => void) {
    onSelectOrder?.(order);
    if (onNavigate) { onNavigate('order-tracking'); return; }
    router.visit(`/order-tracking/${encodeURIComponent(order.id)}`);
}

export default function MyOrders({ onNavigate, onSelectOrder }: {
    currentView?: View;
    onNavigate?: (view: View) => void;
    onSelectOrder?: (order: Order) => void;
}) {
    const { orders = [] } = usePage<{ orders?: Order[] }>().props;
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<string>('all');

    const filtered = useMemo(() => orders.filter(order =>
        (filter === 'all' || order.status === filter) &&
        matchesOrderQuery(order, search)
    ), [orders, filter, search]);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">My Orders</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Track and manage all your custom apparel orders.</p>
                </div>
                <button
                    onClick={() => router.visit('/catalog')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={16} /> New Order
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search orders..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-card rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all"
                    />
                </div>
                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="px-3 py-2 text-sm bg-card rounded-lg border border-border focus:outline-none text-foreground"
                >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
            </div>

            {/* Table */}
            <Card>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            {['Order ID', 'Product', 'Total', 'Date Ordered', 'Due Date', 'Status', ''].map(h => (
                                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map(order => (
                            <tr
                                key={order.id}
                                onClick={() => navigateToOrder(order, onSelectOrder, onNavigate)}
                                className="hover:bg-muted/30 transition-colors cursor-pointer group"
                            >
                                {/* Order ID */}
                                <td className="px-5 py-4">
                                    <span className="font-semibold text-indigo-600 group-hover:text-indigo-700">{orderNumber(order)}</span>
                                    {order.name && <p className="mt-0.5 text-xs font-normal text-muted-foreground">{order.name}</p>}
                                </td>

                                {/* Product */}
                                <td className="px-5 py-4 max-w-[220px]">
                                    <div className="space-y-0.5">
                                        {/* If product name is long (multi-product), split by comma and show each on its own line */}
                                        {order.product.includes(',')
                                            ? order.product.split(',').map((p, i) => (
                                                <p key={i} className={`font-medium leading-snug ${i === 0 ? 'text-foreground' : 'text-muted-foreground'} text-sm`}>
                                                    {p.trim()}
                                                </p>
                                            ))
                                            : <p className="font-medium text-foreground leading-snug">{order.product}</p>
                                        }
                                        <p className="text-xs text-muted-foreground">{order.quantity} pcs total</p>
                                    </div>
                                </td>

                                {/* Total */}
                                <td className="px-5 py-4">
                                    <span className="font-semibold text-foreground">{formatTotal(order.total)}</span>
                                </td>

                                {/* Date Ordered */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Calendar size={12} className="flex-shrink-0" />
                                        <span className="text-xs">{order.date}</span>
                                    </div>
                                </td>

                                {/* Due Date with days-left badge */}
                                <td className="px-5 py-4">
                                    <DaysLeftBadge dueDateStr={order.due_date ?? order.deliveryDate ?? null} />
                                </td>

                                {/* Status */}
                                <td className="px-5 py-4">
                                    <StatusBadge status={order.status} />
                                </td>

                                {/* Actions */}
                                <td className="px-5 py-4">
                                    <button
                                        onClick={e => { e.stopPropagation(); navigateToOrder(order, onSelectOrder, onNavigate); }}
                                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        <Eye size={13} /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div className="py-16 text-center">
                        <Package size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No orders found</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filter.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
