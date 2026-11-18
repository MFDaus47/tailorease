import { router, usePage } from '@inertiajs/react';
import { Plus, Scissors, ShoppingBag, Package, Bell, ChevronRight, ArrowRight, ShoppingCart, Activity, DollarSign } from 'lucide-react';
import { orderNumber, orderTitle } from '@/lib/order-label';

type OrderStatus =
    | 'pending' | 'accepted' | 'deposit_paid' | 'in_production'
    | 'quality_check' | 'ready' | 'completed' | 'rejected';

type Order = {
    id: string;
    number?: string | null;
    name?: string | null;
    product: string;
    quantity: number;
    total: number;
    date: string;
    status: OrderStatus;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
    pending: 'Pending Review',
    accepted: 'Accepted',
    deposit_paid: 'Deposit Paid',
    in_production: 'In Production',
    quality_check: 'Quality Check',
    ready: 'Ready',
    completed: 'Completed',
    rejected: 'Rejected',
};

export default function CustomerDashboard({ orders = [] }: { orders?: Order[] }) {
    const { auth } = usePage().props as { auth?: { user?: { name?: string } } };
    const name = auth?.user?.name?.split(' ')[0] ?? 'there';
    const recent = orders.slice(0, 4);
    const inProduction = orders.filter((order) => order.status === 'in_production').length;
    const ready = orders.filter((order) => order.status === 'ready').length;
    const spent = orders
        .filter((order) => order.status !== 'rejected')
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Hello, {name}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Here is what is happening with your orders.</p>
                </div>
                <button
                    onClick={() => router.visit('/catalog')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={16} /> Place New Order
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: String(orders.length), icon: <ShoppingCart size={18} /> },
                    { label: 'In Production', value: String(inProduction), icon: <Activity size={18} /> },
                    { label: 'Ready to Collect', value: String(ready), icon: <Package size={18} /> },
                    { label: 'Total Spent', value: `RM${spent.toLocaleString()}`, icon: <DollarSign size={18} /> },
                ].map((card) => (
                    <button key={card.label} onClick={() => router.visit('/my-orders')} className="bg-card border border-border rounded-lg p-4 text-left hover:border-indigo-200">
                        <div className="flex items-center justify-between text-muted-foreground">{card.icon}</div>
                        <p className="text-xs text-muted-foreground mt-3">{card.label}</p>
                        <p className="text-lg font-semibold text-foreground">{card.value}</p>
                    </button>
                ))}
            </div>

            <div className="bg-card border border-border rounded-lg">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
                    <button onClick={() => router.visit('/my-orders')} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
                        View all <ChevronRight size={12} />
                    </button>
                </div>
                <div className="divide-y divide-border">
                    {recent.length === 0 && <p className="px-5 py-6 text-sm text-muted-foreground">No orders yet.</p>}
                    {recent.map((order) => (
                        <button
                            key={order.id}
                            onClick={() => router.visit(`/order-tracking/${order.id}`)}
                            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <Scissors size={15} className="text-indigo-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{orderTitle(order)}</p>
                                    <p className="text-xs text-muted-foreground">{orderNumber(order)} · {order.quantity} pcs · {order.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-sm font-semibold text-foreground">RM{order.total}</p>
                                <span className="text-xs text-muted-foreground">{STATUS_LABEL[order.status]}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: <ShoppingBag size={20} />, label: 'Browse Catalog', sub: 'Choose a product', path: '/catalog' },
                    { icon: <Package size={20} />, label: 'My Orders', sub: 'Track every order', path: '/my-orders' },
                    { icon: <Bell size={20} />, label: 'Notifications', sub: 'Status updates', path: '/notifications' },
                ].map((item) => (
                    <button key={item.path} onClick={() => router.visit(item.path)} className="bg-card border border-border rounded-lg p-4 text-left hover:border-indigo-200">
                        <div className="flex items-start justify-between mb-3">
                            {item.icon}
                            <ArrowRight size={14} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
