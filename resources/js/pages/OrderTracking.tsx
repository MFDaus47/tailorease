import { router, usePage } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, CreditCard, Package, Scissors,
    Check, Clock, CheckCircle, Star, MessageSquare,
    Send, Download, XCircle, ChevronLeft, Image as ImageIcon,
    Plus, ChevronRight, AlertTriangle
} from 'lucide-react';
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
    items?: OrderItem[] | null;
    remaining_balance?: number | null;
    due_date?: string | null;
    design_file_path?: string | null;
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

function getActiveSizes(sizes: Record<string, number>) {
    return Object.entries(sizes)
        .filter(([, qty]) => (qty || 0) > 0)
        .map(([size, qty]) => ({ size, qty: qty || 0 }));
}

function getOrderItems(order: Order): OrderItem[] {
    if (order.items && order.items.length > 0) {
        return order.items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            sizes: typeof item.sizes === 'object' ? item.sizes : {},
            total_quantity: item.total_quantity,
            base_price: item.base_price,
            subtotal: item.subtotal,
        }));
    }

    const sizes = (typeof order.size === 'string' && order.size !== 'N/A')
        ? Object.fromEntries(order.size.split(', ').map(s => {
            const match = s.match(/^(.+?)(?: ×(\d+))?$/);
            if (!match) return [s, 1];
            return [match[1], match[2] ? parseInt(match[2]) : 1];
        }))
        : {};

    const qty = order.quantity || Object.values(sizes).reduce((a, b) => a + b, 0);
    const basePrice = qty > 0 ? order.total / qty : 0;

    return [{
        product_id: undefined,
        product_name: order.product,
        sizes,
        total_quantity: qty,
        base_price: basePrice,
        subtotal: order.total,
    }];
}

function getRemainingBalance(order: Order & { remaining?: number | null; remaining_balance?: number | null }) {
    if (typeof order.remaining === 'number') return order.remaining;
    if (typeof order.remaining_balance === 'number') return order.remaining_balance;
    return order.total - order.deposit;
}

function getDesignFileName(path: string | null | undefined) {
    if (path) return path.split(/[\\/]/).pop() || path;
    return 'design_reference.png';
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

function getDummyMessages(): Message[] {
    return [
        { id: 'm1', sender: 'tailor', text: 'Your order has been accepted! We\'ll begin production shortly.', time: 'May 29, 09:15' },
        { id: 'm2', sender: 'customer', text: 'Thank you! Can I confirm the fabric choice?', time: 'May 29, 14:30' },
        { id: 'm3', sender: 'tailor', text: 'Blue Egyptian cotton confirmed. Production starts Monday.', time: 'May 30, 10:00' },
    ];
}

function CheckoutPage({ onNavigate }: { onNavigate?: (v: View) => void }) {
    return (
        <div className="max-w-lg mx-auto space-y-5">
            <div className="flex items-center gap-3">
                <button onClick={() => onNavigate?.('order-tracking')} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><ChevronLeft size={18} /></button>
                <h1 className="text-xl font-bold text-foreground">Checkout</h1>
            </div>
            <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Order Summary</h3>
                <div className="flex gap-4 pb-4 border-b border-border">
                    <img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=280&fit=crop&auto=format" alt="Product" className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">Bespoke Dress Shirt</p>
                        <p className="text-xs text-muted-foreground">Size M · ×1 · Order ORD-2420</p>
                    </div>
                </div>
                <div className="space-y-2 mt-4 text-sm">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>RM85.00</span></div>
                    <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2"><span>Deposit Due Now</span><span className="text-indigo-600">RM42.50</span></div>
                </div>
            </Card>
            <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Payment Method</h3>
                <div className="space-y-3">
                    {["Credit / Debit Card", "GCash", "PayMaya"].map((m, i) => (
                        <label key={m} className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${i === 0 ? "border-primary bg-accent" : "border-border hover:border-indigo-200"}`}>
                            <input type="radio" name="method" defaultChecked={i === 0} className="accent-indigo-600" />
                            <span className="text-sm font-medium text-foreground">{m}</span>
                        </label>
                    ))}
                </div>
                <div className="mt-4 space-y-3">
                    <input type="text" placeholder="Card number" className="w-full px-3.5 py-2.5 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all placeholder:text-muted-foreground" />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="MM / YY" className="w-full px-3.5 py-2.5 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all placeholder:text-muted-foreground" />
                        <input type="text" placeholder="CVV" className="w-full px-3.5 py-2.5 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all placeholder:text-muted-foreground" />
                    </div>
                </div>
            </Card>
            <div className="flex gap-3">
                <button onClick={() => onNavigate?.('order-tracking')} className="flex-1 py-2.5 border border-border text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted transition-colors">Cancel</button>
                <button onClick={() => onNavigate?.('payment-success')} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <CreditCard size={15} /> Pay RM42.50
                </button>
            </div>
        </div>
    );
}

function PaymentSuccessPage({ onNavigate }: { onNavigate?: (v: View) => void }) {
    return (
        <div className="max-w-md mx-auto text-center py-12">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Your deposit of <strong>RM42.50</strong> has been received. Your order <strong>ORD-2420</strong> is now confirmed and the tailor will review it shortly.</p>
            <div className="bg-card rounded-xl border border-border p-5 text-left space-y-2 mb-6">
                {[["Order ID", "ORD-2420"], ["Product", "Bespoke Dress Shirt"], ["Amount Paid", "RM42.50"], ["Date", new Date().toLocaleDateString()]].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium text-foreground">{v}</span>
                    </div>
                ))}
            </div>
            <div className="flex gap-3 justify-center">
                <button onClick={() => onNavigate?.('order-tracking')} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                    Track Order
                </button>
                <button onClick={() => onNavigate?.('dashboard')} className="px-5 py-2.5 border border-border text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors">
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}

function PaymentFailedPage({ onNavigate }: { onNavigate?: (v: View) => void }) {
    return (
        <div className="max-w-md mx-auto text-center py-12">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <XCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">We couldn't process your payment. Please check your card details and try again. Your order has not been placed.</p>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-700">Possible reasons:</p>
                        <ul className="text-xs text-red-500 mt-1 space-y-0.5 list-disc list-inside">
                            <li>Insufficient funds</li>
                            <li>Card details entered incorrectly</li>
                            <li>Card not authorized for online payments</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="flex gap-3 justify-center">
                <button onClick={() => onNavigate?.('checkout')} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                    Try Again
                </button>
                <button onClick={() => onNavigate?.('order-tracking')} className="px-5 py-2.5 border border-border text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors">
                    Back to Order
                </button>
            </div>
        </div>
    );
}

export default function OrderTracking({ onNavigate }: { currentView?: View; onNavigate?: (view: View) => void }) {
    const { order, messages = [] } = usePage<{ order?: Order; messages?: Message[] }>().props;
    const [newMsg, setNewMsg] = useState('');

    const goBack = () => {
        router.visit('/my-orders');
    };

    if (!order) {
        return (
            <div className="space-y-5">
                <button onClick={goBack} className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    <ArrowLeft size={16} /> Back to orders
                </button>
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    No order data was provided.
                </div>
            </div>
        );
    }

    const currentStepIdx = STEP_ORDER.indexOf(order.status);

    const sendMsg = () => {
        if (!newMsg.trim()) return;
        router.post(`/orders/${order.id}/messages`, { body: newMsg }, {
            preserveScroll: true,
            onSuccess: () => setNewMsg(''),
        });
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <ChevronLeft size={18} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-foreground">Order {order.id}</h1>
                        <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">Placed on {order.date} · Expected {order.due_date ?? order.deliveryDate}</p>
                </div>
                {order.status === 'ready' && (
                    <button onClick={() => router.visit(`/orders/${order.id}/checkout`)} className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                        <CreditCard size={15} /> Pay Balance
                    </button>
                )}
                {order.status === 'accepted' && (
                    <button onClick={() => router.visit(`/orders/${order.id}/checkout`)} className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <CreditCard size={15} /> Pay Deposit
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-4">
                    {/* Timeline */}
                    <Card className="p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-5">Order Progress</h3>
                        {order.status === 'rejected' ? (
                            <div className="flex flex-col gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                                <div className="flex items-center gap-3">
                                    <XCircle size={20} className="text-red-500" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-700">Order Rejected</p>
                                        <p className="text-xs text-red-500 mt-0.5">Please review the notes below and resubmit.</p>
                                    </div>
                                </div>
                                <button onClick={() => router.visit(`/orders/${order.id}/edit`)} className="self-start px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition">
                                    Edit & Resubmit
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
                                <div className="space-y-4">
                                    {TIMELINE_STEPS.map((step, idx) => {
                                        const done = idx < currentStepIdx;
                                        const active = idx === currentStepIdx;
                                        return (
                                            <div key={step.key} className="flex items-center gap-4 relative">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all ${
                                                    done ? 'bg-indigo-600 border-indigo-600 text-white' :
                                                    active ? 'bg-white border-indigo-500 text-indigo-600 shadow-md shadow-indigo-100' :
                                                    'bg-white border-border text-muted-foreground'
                                                }`}>
                                                    {done ? <Check size={14} /> : step.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${active ? 'text-indigo-600' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {step.label}
                                                        {active && <span className="ml-2 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium border border-indigo-100">Current</span>}
                                                    </p>
                                                    {done && <p className="text-xs text-muted-foreground">Completed</p>}
                                                    {active && <p className="text-xs text-indigo-500">In progress...</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Chat */}
                    <Card className="flex flex-col" style={{ height: '380px' }}>
                        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border flex-shrink-0">
                            <MessageSquare size={16} className="text-indigo-500" />
                            <h3 className="text-sm font-semibold text-foreground">Conversation</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <MessageSquare size={28} className="text-muted-foreground/40 mb-2" />
                                    <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                                </div>
                            ) : messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 ${
                                        msg.sender === 'customer'
                                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                                            : 'bg-muted text-foreground rounded-bl-sm'
                                    }`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <p className={`text-xs mt-1 ${msg.sender === 'customer' ? 'text-indigo-200' : 'text-muted-foreground'}`}>{msg.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-4 pb-4 flex-shrink-0">
                            <div className="flex gap-2">
                                <input
                                    value={newMsg}
                                    onChange={e => setNewMsg(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMsg()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-3.5 py-2 text-sm bg-muted rounded-xl border border-border focus:border-indigo-300 focus:outline-none transition-all placeholder:text-muted-foreground"
                                />
                                <button onClick={sendMsg} className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-indigo-700 transition-colors">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Order Details */}
                <div className="space-y-4">
                    {(() => {
                        const items = getOrderItems(order);
                        const totalPieces = items.reduce((sum, item) => sum + item.total_quantity, 0);
                        const totalTypes = items.length;

                        return (
                            <Card className="p-4">
                                <h3 className="text-sm font-semibold text-foreground mb-3">Order Details</h3>
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Items</span>
                                        <span className="font-medium text-foreground">{totalPieces} pcs · {totalTypes} type{totalTypes !== 1 ? 's' : ''}</span>
                                    </div>
                                    {items.map((item, idx) => {
                                        const activeSizes = getActiveSizes(item.sizes);
                                        return (
                                            <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-medium text-foreground leading-snug">{item.product_name}</p>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 flex-shrink-0">
                                                        {item.total_quantity}×
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{formatCurrency(item.subtotal)}</p>
                                                {activeSizes.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {activeSizes.map(({ size, qty }) => (
                                                            <span key={size} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background border border-border text-[11px] font-medium text-foreground">
                                                                <span className="text-muted-foreground">{size}</span>
                                                                <span className="text-indigo-600">×{qty}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-[11px] text-muted-foreground italic">No size breakdown</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        );
                    })()}

                    <Card className="p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Financial Summary</h3>
                        <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Amount</span>
                                <span className="font-medium text-foreground">{formatCurrency(order.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Deposit Paid</span>
                                <span className="font-medium text-foreground">{formatCurrency(order.deposit)}</span>
                            </div>
                            <div className="h-px bg-border my-1" />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground font-medium">Remaining Balance</span>
                                <span className="font-semibold text-foreground">{formatCurrency(getRemainingBalance(order))}</span>
                            </div>
                        </div>
                    </Card>

                    {order.hasDesign && (
                        <Card className="p-4">
                            <h3 className="text-sm font-semibold text-foreground mb-3">Design</h3>
                            {(order as Order & { designPreview?: string | null }).designPreview && (
                                <img src={(order as Order & { designPreview?: string }).designPreview} alt="Saved design" className="w-full rounded border border-border mb-3 bg-white" />
                            )}
                            <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <ImageIcon size={15} className="text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">{getDesignFileName(order.design_file_path)}</p>
                                    <p className="text-xs text-muted-foreground">Design file</p>
                                </div>
                                <button className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
                                    <Download size={14} />
                                </button>
                            </div>
                        </Card>
                    )}

                    {order.notes && (
                        <Card className="p-4">
                            <h3 className="text-sm font-semibold text-foreground mb-2">Special Instructions</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{order.notes}</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}