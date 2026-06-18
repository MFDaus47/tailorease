import { router, usePage } from '@inertiajs/react';
import { Search, Plus, Eye, Package } from 'lucide-react';
import { useMemo, useState } from 'react';
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

type Order = {
    id: string;
    product: string;
    quantity: number;
    size: string;
    total: number;
    deposit: number;
    date: string;
    deliveryDate: string;
    status: OrderStatus;
    notes: string | null;
    hasDesign: boolean;
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

function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CONFIG[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function formatTotal(total: number) {
    return `RM${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function navigateToOrder(order: Order, onSelectOrder?: (order: Order) => void, onNavigate?: (view: View) => void) {
    onSelectOrder?.(order);

    if (onNavigate) {
        onNavigate('order-tracking');
        return;
    }

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
        (search === '' || order.id.includes(search) || order.product.toLowerCase().includes(search.toLowerCase()))
    ), [orders, filter, search]);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">My Orders</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Track and manage all your custom apparel orders.</p>
                </div>
                <button onClick={() => onNavigate ? onNavigate('catalog') : router.visit('/catalog')} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus size={16} /> New Order
                </button>
            </div>
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-9 pr-4 py-2 text-sm bg-card rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all" />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 text-sm bg-card rounded-lg border border-border focus:outline-none text-foreground">
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
            </div>
            <Card>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            {['Order ID', 'Product', 'Size', 'Total', 'Date', 'Status', 'Actions'].map(h => (
                                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map(order => (
                            <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-5 py-3.5 font-semibold text-indigo-600">{order.id}</td>
                                <td className="px-5 py-3.5">
                                    <p className="font-medium text-foreground">{order.product}</p>
                                    <p className="text-xs text-muted-foreground">×{order.quantity}</p>
                                </td>
                                <td className="px-5 py-3.5 text-foreground">{order.size}</td>
                                <td className="px-5 py-3.5 font-semibold text-foreground">{formatTotal(order.total)}</td>
                                <td className="px-5 py-3.5 text-muted-foreground">{order.date}</td>
                                <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                                <td className="px-5 py-3.5">
                                    <button onClick={() => navigateToOrder(order, onSelectOrder, onNavigate)} className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
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
                    </div>
                )}
            </Card>
        </div>
    );
}
