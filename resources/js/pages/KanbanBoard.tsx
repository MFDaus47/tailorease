import { router, usePage } from '@inertiajs/react';
import { Archive, ChevronRight, Image } from 'lucide-react';

type OrderStatus = 'accepted' | 'deposit_paid' | 'in_production' | 'quality_check' | 'ready' | 'completed';

type Order = {
    id: string;
    customer: string;
    avatar: string;
    product: string;
    size: string;
    total: number;
    status: OrderStatus;
    hasDesign: boolean;
};

const COLUMNS: { key: OrderStatus; label: string; next: OrderStatus | null }[] = [
    { key: 'accepted', label: 'Accepted', next: 'deposit_paid' },
    { key: 'deposit_paid', label: 'Deposit Paid', next: 'in_production' },
    { key: 'in_production', label: 'In Production', next: 'quality_check' },
    { key: 'quality_check', label: 'Quality Check', next: 'ready' },
    { key: 'ready', label: 'Ready', next: 'completed' },
    { key: 'completed', label: 'Completed', next: null },
];

export default function KanbanBoard({ orders = [] }: { orders?: Order[] }) {
    const page = usePage<{ orders?: Order[] }>();
    const boardOrders = orders.length ? orders : (page.props.orders ?? []);

    const moveForward = (order: Order, next: OrderStatus) => {
        router.post(`/all-orders/${encodeURIComponent(order.id)}/status`, { status: next }, { preserveScroll: true });
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-foreground">Production Board</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Move an order only to the next stage.</p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
                {COLUMNS.map((column) => {
                    const columnOrders = boardOrders.filter((order) => order.status === column.key);
                    return (
                        <div key={column.key} className="flex-shrink-0 w-56">
                            <div className="rounded-t-lg border border-border px-3 py-2.5 flex items-center justify-between bg-muted">
                                <span className="text-xs font-bold text-foreground">{column.label}</span>
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-card">{columnOrders.length}</span>
                            </div>
                            <div className="border-x border-b border-border rounded-b-lg bg-muted/30 p-2 space-y-2 min-h-80">
                                {columnOrders.map((order) => (
                                    <div key={order.id} className="bg-card rounded-lg border border-border p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <button onClick={() => router.visit(`/order-tracking/${order.id}`)} className="text-xs font-bold text-indigo-600">{order.product}</button>
                                            {order.hasDesign && <Image size={11} className="text-muted-foreground" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">{order.avatar} {order.customer}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-foreground">RM{order.total}</span>
                                            <span className="text-xs text-muted-foreground">{order.size}</span>
                                        </div>
                                        {column.next && (
                                            <button
                                                onClick={() => moveForward(order, column.next as OrderStatus)}
                                                className="mt-2 w-full text-xs py-1.5 border border-dashed border-border text-muted-foreground hover:border-indigo-300 hover:text-indigo-600 rounded-md flex items-center justify-center gap-1"
                                            >
                                                Move forward <ChevronRight size={11} />
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
