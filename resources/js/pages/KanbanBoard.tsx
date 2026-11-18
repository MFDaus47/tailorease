import { router, usePage } from '@inertiajs/react';
import { Archive, ChevronRight, Image } from 'lucide-react';
import { orderNumber, orderTitle } from '@/lib/order-label';

type OrderStatus = 'accepted' | 'deposit_paid' | 'in_production' | 'quality_check' | 'ready';

type Order = {
    id: string;
    number?: string | null;
    name?: string | null;
    customer: string;
    avatar: string;
    product: string;
    size: string;
    total: number;
    status: OrderStatus;
    hasDesign: boolean;
};

const COLUMNS: { key: OrderStatus; label: string; next: OrderStatus | 'completed' | null; action: string }[] = [
    { key: 'accepted', label: 'Accepted', next: 'deposit_paid', action: 'Deposit paid' },
    { key: 'deposit_paid', label: 'Deposit Paid', next: 'in_production', action: 'Start production' },
    { key: 'in_production', label: 'In Production', next: 'quality_check', action: 'Send to check' },
    { key: 'quality_check', label: 'Quality Check', next: 'ready', action: 'Mark ready' },
    { key: 'ready', label: 'Ready', next: 'completed', action: 'Complete' },
];

export default function KanbanBoard({ orders = [] }: { orders?: Order[] }) {
    const page = usePage<{ orders?: Order[] }>();
    const boardOrders = orders.length ? orders : (page.props.orders ?? []);

    const moveForward = (order: Order, next: OrderStatus | 'completed') => {
        router.post(`/all-orders/${encodeURIComponent(order.id)}/status`, { status: next }, { preserveScroll: true });
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-foreground">Production Board</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Move an order only to the next stage. Completed orders leave this board.</p>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {COLUMNS.map((column) => {
                    const columnOrders = boardOrders.filter((order) => order.status === column.key);
                    return (
                        <div key={column.key} className="min-w-0">
                            <div className="rounded-t-lg border border-border px-3 py-2.5 flex items-center justify-between bg-muted">
                                <span className="text-xs font-bold text-foreground">{column.label}</span>
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-card">{columnOrders.length}</span>
                            </div>
                            <div className="border-x border-b border-border rounded-b-lg bg-muted/30 p-2 space-y-2 min-h-80">
                                {columnOrders.map((order) => (
                                    <div key={order.id} className="bg-card rounded-lg border border-border p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <button onClick={() => router.visit(`/order-tracking/${order.id}`)} className="min-w-0 break-words text-left text-xs font-bold text-indigo-600">{orderTitle(order)}</button>
                                            {order.hasDesign && <Image size={11} className="text-muted-foreground" />}
                                        </div>
                                        <p className="mb-2 break-words text-xs text-muted-foreground">{orderNumber(order)} · {order.customer}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-foreground">RM{order.total}</span>
                                            <span className="text-xs text-muted-foreground">{order.size}</span>
                                        </div>
                                        {column.next && (
                                            <button
                                                onClick={() => moveForward(order, column.next as OrderStatus | 'completed')}
                                                className="mt-2 w-full text-xs py-1.5 border border-dashed border-border text-muted-foreground hover:border-indigo-300 hover:text-indigo-600 rounded-md flex items-center justify-center gap-1"
                                            >
                                                {column.action} <ChevronRight size={11} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {columnOrders.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Archive size={14} className="text-muted-foreground/50 mb-2" />
                                        <p className="text-xs text-muted-foreground">No orders</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
