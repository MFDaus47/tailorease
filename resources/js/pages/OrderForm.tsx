import { router } from '@inertiajs/react';
import {
    ChevronLeft, RefreshCw, Layers, AlertTriangle, FileText, Upload,
    Calendar, ArrowRight, Info, ChevronDown, ChevronRight, Plus, Trash2, X, Package,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ShirtViewer from '@/components/apparel/ShirtViewer';
import OpenDesignerButton from '@/components/designer/OpenDesignerButton';
import type { View } from '@/types';
import { dummyProducts } from '../../mockdata';

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    depositRate: number;
    image: string;
    description: string;
    available: boolean;
    rating: number;
    orders: number;
};

type BulkSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
const BULK_SIZES: BulkSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

type OrderItem = {
    uid: string; // client-side unique id
    product: Product;
    sizes: Record<BulkSize, number>;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SizeStepper({ value, onChange, active }: { value: number; onChange: (v: number) => void; active: boolean }) {
    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={() => onChange(Math.max(0, value - 1))}
                disabled={value === 0}
                className={`w-7 h-7 rounded-md border flex items-center justify-center text-sm font-semibold transition-all select-none ${
                    value === 0
                        ? 'border-border text-muted-foreground/40 cursor-not-allowed'
                        : 'border-border text-foreground hover:bg-muted active:scale-95'
                }`}
            >
                −
            </button>
            <span className={`w-8 text-center text-sm font-bold tabular-nums transition-colors ${active ? 'text-indigo-600' : 'text-foreground'}`}>
                {value}
            </span>
            <button
                onClick={() => onChange(value + 1)}
                className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-sm font-semibold text-foreground hover:bg-muted active:scale-95 transition-all select-none"
            >
                +
            </button>
        </div>
    );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-card rounded-xl border border-border shadow-sm ${className}`}>{children}</div>;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function urgencyMeta(dateStr: string | null): { label: string; color: string; bg: string; border: string } | null {
    if (!dateStr) {
return null;
}

    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(dateStr); due.setHours(0,0,0,0);
    const days = Math.round((due.getTime() - today.getTime()) / 86400000);

    if (days < 0)  {
return { label: 'Overdue',        color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-300' };
}

    if (days <= 7) {
return { label: `${days}d left`,   color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' };
}

    if (days <= 14) {
return { label: `${days}d left`,  color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' };
}

    return                 { label: `${days}d left`,  color: 'text-emerald-700',bg: 'bg-emerald-50',border: 'border-emerald-200' };
}

function CalendarPicker({ value, onChange, label = 'Expected Due Date', minDaysFromNow = 3 }: {
    value: string | null;
    onChange: (iso: string) => void;
    label?: string;
    minDaysFromNow?: number;
}) {
    const [open, setOpen] = useState(false);
    const today = new Date(); today.setHours(0,0,0,0);
    const minDate = new Date(today); minDate.setDate(today.getDate() + minDaysFromNow);
    const initView = value ? new Date(value) : new Date(minDate);
    const [viewYear, setViewYear] = useState(initView.getFullYear());
    const [viewMonth, setViewMonth] = useState(initView.getMonth());
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});

    const openPicker = () => {
        if (!triggerRef.current) {
return;
}

        const r = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - r.bottom;
        const popH = 320;
        const top = spaceBelow >= popH + 8 ? r.bottom + 6 : r.top - popH - 6;
        const left = Math.min(r.left, window.innerWidth - 280 - 8);
        setStyle({ position: 'fixed', top, left, zIndex: 9999, width: 272 });
        setOpen(true);
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) {
setOpen(false);
}
        };
        document.addEventListener('mousedown', handler);

        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const prevMonth = () => {
 if (viewMonth === 0) {
 setViewMonth(11); setViewYear(y => y - 1); 
} else {
setViewMonth(m => m - 1);
} 
};
    const nextMonth = () => {
 if (viewMonth === 11) {
 setViewMonth(0); setViewYear(y => y + 1); 
} else {
setViewMonth(m => m + 1);
} 
};

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

    while (cells.length % 7 !== 0) {
cells.push(null);
}

    const selectedDate = value ? new Date(value) : null;
    const isSelected = (d: number) => selectedDate?.getFullYear() === viewYear && selectedDate?.getMonth() === viewMonth && selectedDate?.getDate() === d;
    const isDisabled = (d: number) => new Date(viewYear, viewMonth, d) < minDate;
    const isToday = (d: number) => {
 const t = new Date();

 return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === d; 
};
    const select = (d: number) => {
 const chosen = new Date(viewYear, viewMonth, d); onChange(chosen.toISOString().slice(0, 10)); setOpen(false); 
};
    const displayValue = value ? new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : null;
    const urgency = urgencyMeta(value);

    return (
        <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">{label}</label>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => open ? setOpen(false) : openPicker()}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm transition-all ${open ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-border hover:border-indigo-300'} bg-card`}
            >
                <span className={`flex items-center gap-2.5 ${displayValue ? 'text-foreground' : 'text-muted-foreground'}`}>
                    <Calendar size={15} className={displayValue ? 'text-indigo-500' : 'text-muted-foreground'} />
                    {displayValue || 'Select a date...'}
                </span>
                {urgency && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${urgency.color} ${urgency.bg} ${urgency.border}`}>{urgency.label}</span>}
                {!urgency && <ChevronDown size={14} className="text-muted-foreground" />}
            </button>
            {open && (
                <div ref={popoverRef} style={style} className="bg-card rounded-xl border border-border shadow-2xl overflow-hidden select-none">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                        <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft size={15} /></button>
                        <span className="text-sm font-bold text-foreground">{MONTHS[viewMonth]} {viewYear}</span>
                        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><ChevronRight size={15} /></button>
                    </div>
                    <div className="grid grid-cols-7 px-3 pt-2 pb-1">
                        {WEEKDAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
                        {cells.map((d, i) => {
                            if (!d) {
return <div key={i} />;
}

                            const disabled = isDisabled(d);
                            const selected = isSelected(d);
                            const tod = isToday(d);

                            return (
                                <button
                                    key={i}
                                    disabled={disabled}
                                    onClick={() => select(d)}
                                    className={`h-8 w-full rounded-lg text-xs font-medium transition-all ${
                                        selected ? 'bg-indigo-600 text-white font-bold shadow-sm'
                                        : disabled ? 'text-muted-foreground/30 cursor-not-allowed'
                                        : tod ? 'border border-indigo-300 text-indigo-600 font-bold hover:bg-indigo-50'
                                        : 'text-foreground hover:bg-muted'
                                    }`}
                                >{d}</button>
                            );
                        })}
                    </div>
                    <div className="px-4 py-2.5 border-t border-border bg-muted/20">
                        <p className="text-xs text-muted-foreground">Earliest available: <span className="font-semibold text-foreground">{minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Product Picker Modal ─────────────────────────────────────────────────────

function ProductPickerModal({ current, onSelect, onClose }: {
    current: string[];
    onSelect: (p: Product) => void;
    onClose: () => void;
}) {
    const [search, setSearch] = useState('');
    const available = dummyProducts.filter(
        p => p.available && (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                        <h2 className="text-sm font-bold text-foreground">Add a Product</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Select an apparel type to add to this order.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X size={16} /></button>
                </div>
                {/* Search */}
                <div className="px-5 py-3 border-b border-border">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                        autoFocus
                    />
                </div>
                {/* Product list */}
                <div className="overflow-y-auto flex-1 p-3 space-y-2">
                    {available.length === 0 && (
                        <div className="py-10 text-center text-sm text-muted-foreground">No products found.</div>
                    )}
                    {available.map(p => {
                        const alreadyAdded = current.includes(p.id);

                        return (
                            <button
                                key={p.id}
                                onClick={() => {
 if (!alreadyAdded) {
 onSelect(p); onClose(); 
} 
}}
                                disabled={alreadyAdded}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                    alreadyAdded
                                        ? 'border-indigo-200 bg-indigo-50/50 opacity-60 cursor-not-allowed'
                                        : 'border-border hover:border-indigo-300 hover:bg-muted/30 active:scale-[0.99]'
                                }`}
                            >
                                <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.category} · RM{p.basePrice}/pc</p>
                                </div>
                                {alreadyAdded
                                    ? <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full flex-shrink-0">Added</span>
                                    : <span className="text-xs text-muted-foreground flex-shrink-0">+ Add</span>
                                }
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Per-Item Size Card ───────────────────────────────────────────────────────

function OrderItemCard({
    item, index, isOnly, onSizeChange, onRemove,
}: {
    item: OrderItem;
    index: number;
    isOnly: boolean;
    onSizeChange: (uid: string, size: BulkSize, val: number) => void;
    onRemove: (uid: string) => void;
}) {
    const { product, sizes } = item;
    const totalQty = Object.values(sizes).reduce((a, b) => a + b, 0);
    const activeLines = BULK_SIZES.filter(s => sizes[s] > 0);

    return (
        <Card className="overflow-hidden">
            {/* Product header */}
            <div className={`flex items-center gap-3 px-5 py-3.5 border-b border-border ${index === 0 ? 'bg-indigo-50/40' : 'bg-muted/20'}`}>
                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category} · <span className="font-semibold text-foreground">RM{product.basePrice}</span>/pc</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {totalQty > 0 && (
                        <button
                            onClick={() => BULK_SIZES.forEach(s => onSizeChange(item.uid, s, 0))}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
                        >
                            <RefreshCw size={10} /> Clear
                        </button>
                    )}
                    {!isOnly && (
                        <button
                            onClick={() => onRemove(item.uid)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                            title="Remove this product"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Size rows */}
            <div className="divide-y divide-border">
                {BULK_SIZES.map(size => {
                    const qty = sizes[size];
                    const active = qty > 0;
                    const lineTotal = qty * product.basePrice;

                    return (
                        <div key={size} className={`flex items-center px-5 py-3 transition-colors ${active ? 'bg-indigo-50/60' : 'hover:bg-muted/20'}`}>
                            <div className="w-16 flex items-center">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border-2 transition-all ${active ? 'border-indigo-400 bg-indigo-500 text-white shadow-sm shadow-indigo-100' : 'border-border bg-background text-muted-foreground'}`}>
                                    {size}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 px-4 hidden sm:block">
                                <p className={`text-xs font-medium transition-colors ${active ? 'text-indigo-700' : 'text-muted-foreground'}`}>
                                    {{ XS: 'Extra Small — fits 28–30" chest', S: 'Small — fits 34–36" chest', M: 'Medium — fits 38–40" chest', L: 'Large — fits 42–44" chest', XL: 'Extra Large — fits 46–48" chest', XXL: 'Double XL — fits 50–52" chest' }[size]}
                                </p>
                                {active && <p className="text-xs text-indigo-500 font-medium mt-0.5">RM{product.basePrice} × {qty} = RM{lineTotal}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                                <SizeStepper value={qty} onChange={v => onSizeChange(item.uid, size, v)} active={active} />
                                {active ? <span className="text-xs font-semibold text-indigo-600 w-14 text-right tabular-nums">RM{lineTotal}</span> : <span className="w-14" />}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Item footer total */}
            <div className={`flex items-center justify-between px-5 py-3 border-t-2 transition-colors ${totalQty > 0 ? 'border-indigo-200 bg-indigo-50' : 'border-border bg-muted/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold ${totalQty > 0 ? 'text-indigo-700' : 'text-muted-foreground'}`}>
                    <Layers size={14} /> {totalQty > 0 ? `${totalQty} pcs` : 'No sizes selected'}
                </div>
                {totalQty > 0 && (
                    <div className="flex items-center gap-1.5">
                        {activeLines.map(s => (
                            <span key={s} className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                {s}: {sizes[s]}
                            </span>
                        ))}
                        <span className="text-sm font-bold text-indigo-700 ml-2 tabular-nums">RM{(totalQty * product.basePrice).toLocaleString()}</span>
                    </div>
                )}
            </div>

            {totalQty === 0 && (
                <div className="px-5 py-3 flex items-center gap-2.5 bg-amber-50 border-t border-amber-100">
                    <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-700">Add at least one size for this product, or remove it from the order.</p>
                </div>
            )}
        </Card>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyQtys = (): Record<BulkSize, number> => ({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
let uidCounter = 0;
const newUid = () => `item-${++uidCounter}`;

function buildInitialItems(product: Product, orderToEdit?: any): OrderItem[] {
    if (orderToEdit?.items && Array.isArray(orderToEdit.items) && orderToEdit.items.length > 0) {
        return orderToEdit.items.map((it: any) => {
            const prod = dummyProducts.find((p: any) => p.id === it.product_id) ?? dummyProducts[0] as Product;

            return { uid: newUid(), product: prod, sizes: it.sizes ?? emptyQtys() };
        });
    }

    // Legacy single-product or fresh start
    return [{ uid: newUid(), product, sizes: orderToEdit?.sizes ?? emptyQtys() }];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderForm({ product, orderToEdit, onNavigate }: { product?: Product | null; orderToEdit?: any; onNavigate?: (v: View) => void }) {
    const [color, setColor] = useState('#ffffff');
    const [designFile, setDesignFile] = useState<File | null>(null);
    const [designUrl, setDesignUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(orderToEdit?.design_file_path || null);
    const [notes, setNotes] = useState(orderToEdit?.notes || '');
    const [dueDate, setDueDate] = useState<string | null>(
        orderToEdit?.due_date ? new Date(orderToEdit.due_date).toISOString().slice(0, 10) : null
    );
    const [dragging, setDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // Resolve initial product
    const getInitialProduct = (): Product => {
        if (product) {
return product;
}

        const params = new URLSearchParams(window.location.search);
        const productId = params.get('product');

        if (productId) {
            const found = dummyProducts.find((p: any) => p.id === productId);

            if (found) {
return found as Product;
}
        }

        return dummyProducts[0] as Product;
    };

    const [orderItems, setOrderItems] = useState<OrderItem[]>(() => buildInitialItems(getInitialProduct(), orderToEdit));

    // ── Derived totals ──────────────────────────────────────────────────────
    const allItemTotals = orderItems.map(item => {
        const qty = Object.values(item.sizes).reduce((a, b) => a + b, 0);

        return { uid: item.uid, qty, subtotal: qty * item.product.basePrice };
    });
    const totalQty = allItemTotals.reduce((a, b) => a + b.qty, 0);
    const subtotal  = allItemTotals.reduce((a, b) => a + b.subtotal, 0);
    // Use first item's deposit rate as the order deposit rate (all products currently share 50%)
    const depositRate = orderItems[0]?.product.depositRate ?? 0.5;
    const deposit = Math.round(subtotal * depositRate);
    const remaining = Math.max(0, Math.round(subtotal - deposit));
    const canCheckout = totalQty > 0 && dueDate !== null && orderItems.every(it => Object.values(it.sizes).reduce((a,b) => a+b, 0) > 0);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleFile = (f?: File) => {
        if (!f) {
return;
}

        setFileName(f.name);
        setDesignFile(f);
        setDesignUrl(URL.createObjectURL(f));
    };

    const handleSizeChange = (uid: string, size: BulkSize, val: number) => {
        setOrderItems(prev => prev.map(it => it.uid === uid ? { ...it, sizes: { ...it.sizes, [size]: val } } : it));
    };

    const handleRemoveItem = (uid: string) => {
        setOrderItems(prev => prev.filter(it => it.uid !== uid));
    };

    const handleAddProduct = (p: Product) => {
        setOrderItems(prev => [...prev, { uid: newUid(), product: p, sizes: emptyQtys() }]);
    };

    const submitOrder = () => {
        if (!canCheckout) {
return;
}

        setProcessing(true);

        // Build items array
        const items = orderItems.map(it => {
            const qty = Object.values(it.sizes).reduce((a, b) => a + b, 0);

            return {
                product_id:     it.product.id,
                product_name:   it.product.name,
                sizes:          it.sizes,
                total_quantity: qty,
                base_price:     it.product.basePrice,
                subtotal:       qty * it.product.basePrice,
            };
        });

        // Top-level fields — use first item for backward compat
        const firstItem = items[0];
        const payload = {
            product_id:        firstItem.product_id,
            product_name:      items.length === 1 ? firstItem.product_name : `${items.length} Products`,
            sizes:             firstItem.sizes,
            total_quantity:    totalQty,
            total:             subtotal,
            deposit:           deposit,
            remaining_balance: remaining,
            due_date:          dueDate,
            notes:             notes || null,
            has_design:        !!fileName,
            design_file_path:  fileName || null,
            items,
        };

        const goBack = () => {
 if (onNavigate) {
onNavigate('my-orders');
} else {
router.visit('/my-orders');
} 
};

        if (orderToEdit) {
            router.put(`/orders/${orderToEdit.id}`, payload, { onSuccess: goBack, onFinish: () => setProcessing(false) });
        } else {
            router.post('/orders', payload, { onSuccess: goBack, onFinish: () => setProcessing(false) });
        }
    };

    const goToCatalog = () => {
 if (onNavigate) {
onNavigate('catalog');
} else {
router.visit('/catalog');
} 
};

    const alreadyAddedIds = orderItems.map(it => it.product.id);

    return (
        <div className="space-y-5">
            {showPicker && (
                <ProductPickerModal
                    current={alreadyAddedIds}
                    onSelect={handleAddProduct}
                    onClose={() => setShowPicker(false)}
                />
            )}

            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={goToCatalog} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <ChevronLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-foreground">Bulk Order</h1>
                    <p className="text-sm text-muted-foreground">Mix different apparel types in a single order — each with its own size breakdown.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* ── Left: Form ── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Per-product size cards */}
                    {orderItems.map((item, index) => (
                        <OrderItemCard
                            key={item.uid}
                            item={item}
                            index={index}
                            isOnly={orderItems.length === 1}
                            onSizeChange={handleSizeChange}
                            onRemove={handleRemoveItem}
                        />
                    ))}

                    {/* Add Another Product */}
                    <button
                        onClick={() => setShowPicker(true)}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 hover:border-indigo-400 transition-all group"
                    >
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                            <Plus size={13} />
                        </div>
                        Add Another Product Type
                    </button>

                    {/* Due Date */}
                    <Card className="p-4">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Expected Due Date <span className="text-red-500">*</span></h3>
                                <p className="text-xs text-muted-foreground mt-0.5">When do you need your order ready for collection?</p>
                            </div>
                            {dueDate && <button onClick={() => setDueDate(null)} className="text-xs text-muted-foreground hover:text-red-500 transition-colors">Clear</button>}
                        </div>
                        <div className="mt-3">
                            <CalendarPicker value={dueDate} onChange={setDueDate} label="" minDaysFromNow={5} />
                        </div>
                        {!dueDate && (
                            <p className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
                                <AlertTriangle size={12} /> A due date is required to proceed.
                            </p>
                        )}
                    </Card>

                    {/* Design Upload */}
                    <Card className="p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-1">Design File <span className="text-muted-foreground font-normal">(Optional)</span></h3>
                        <p className="text-xs text-muted-foreground mb-3">Upload artwork, print files, or embroidery references. Accepted: PNG, JPG, AI, PDF.</p>
                        <div
                            onDragOver={e => {
 e.preventDefault(); setDragging(true); 
}}
                            onDragLeave={() => setDragging(false)}
                            onDrop={e => {
 e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); 
}}
                            onClick={() => fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${dragging ? 'border-primary bg-accent scale-[1.01]' : 'border-border hover:border-indigo-300 hover:bg-muted/30'}`}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                className="hidden"
                                onChange={e => {
 const f = e.target.files?.[0]; handleFile(f); 
}}
                                accept="image/*,.pdf,.ai"
                            />
                            {fileName ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <FileText size={16} className="text-indigo-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-foreground">{fileName}</p>
                                        <button onClick={e => {
 e.stopPropagation(); setFileName(null); setDesignFile(null); setDesignUrl(null); 
}} className="text-xs text-red-500 hover:underline mt-0.5">Remove</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload size={26} className={`mx-auto mb-2.5 ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <p className="text-sm font-semibold text-foreground">Drop your design file here</p>
                                    <p className="text-xs text-muted-foreground mt-1">or <span className="text-indigo-600 font-medium">click to browse</span> · PNG, JPG, AI, PDF up to 20MB</p>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* 3D Viewer */}
                    <Card className="p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-1">3D Viewer <span className="text-muted-foreground font-normal">(Optional)</span></h3>
                        <p className="text-xs text-muted-foreground mb-3">Preview your shirt color and design placement.</p>
                        <OpenDesignerButton
                            campaignId={orderToEdit?.id}
                            campaignName={orderItems[0]?.product?.name ?? "Order Design"}
                            onDesignSaved={(url) => setDesignUrl(url)}
                        />
                        <div className="mt-3">
                            <ShirtViewer color={color} designUrl={designUrl} />
                        </div>
                    </Card>

                    {/* Special Instructions */}
                    <Card className="p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-1">Special Instructions <span className="text-muted-foreground font-normal">(Optional)</span></h3>
                        <p className="text-xs text-muted-foreground mb-3">Fabric preferences, print placement, color codes, or any other production notes.</p>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="e.g. Print on left chest only, Pantone 286 C for the logo, 100% cotton preferred..."
                            rows={4}
                            className="w-full px-3 py-2.5 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none transition-all placeholder:text-muted-foreground"
                        />
                    </Card>
                </div>

                {/* ── Right: Order Summary ── */}
                <div className="space-y-4">
                    <Card className="p-4 sticky top-4">
                        <h3 className="text-sm font-bold text-foreground mb-4">Order Summary</h3>

                        {/* Per-product breakdown */}
                        {totalQty > 0 ? (
                            <div className="space-y-3 mb-4">
                                {orderItems.map(item => {
                                    const qty = Object.values(item.sizes).reduce((a, b) => a + b, 0);

                                    if (qty === 0) {
return null;
}

                                    const itemSubtotal = qty * item.product.basePrice;
                                    const activeSizes = BULK_SIZES.filter(s => item.sizes[s] > 0);

                                    return (
                                        <div key={item.uid} className="rounded-lg border border-border/60 overflow-hidden">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/60">
                                                <Package size={11} className="text-indigo-500" />
                                                <span className="text-xs font-bold text-foreground truncate">{item.product.name}</span>
                                                <span className="ml-auto text-xs font-bold text-indigo-600 tabular-nums">RM{itemSubtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="px-3 py-2 space-y-0.5">
                                                {activeSizes.map(s => (
                                                    <div key={s} className="flex items-center justify-between text-xs py-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">{s}</span>
                                                            <span className="text-foreground font-medium">{item.sizes[s]} pcs</span>
                                                        </div>
                                                        <span className="text-muted-foreground/60 text-[10px]">RM{item.product.basePrice} each</span>
                                                        <span className="font-bold text-indigo-600 tabular-nums">RM{(item.sizes[s] * item.product.basePrice).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mb-4 py-5 rounded-lg bg-muted/50 flex flex-col items-center text-center">
                                <Layers size={22} className="text-muted-foreground/40 mb-1.5" />
                                <p className="text-xs text-muted-foreground font-medium">No sizes selected yet</p>
                                <p className="text-xs text-muted-foreground/70 mt-0.5">Add quantities to the size breakdowns.</p>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="space-y-2.5 text-sm border-t border-border pt-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Products</span>
                                <span className="font-medium text-foreground">{orderItems.length} type{orderItems.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total pieces</span>
                                <span className={`font-bold tabular-nums ${totalQty > 0 ? 'text-indigo-600' : 'text-muted-foreground'}`}>{totalQty} pcs</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2.5">
                                <span className="font-semibold text-foreground">Subtotal</span>
                                <span className="font-bold text-foreground text-base tabular-nums">RM{subtotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {totalQty > 0 && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-indigo-200">
                                <div className="bg-indigo-600 px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-indigo-100">Deposit required later</span>
                                        <span className="text-lg font-black text-white tabular-nums">RM{deposit.toFixed(0)}</span>
                                    </div>
                                    <p className="text-xs text-indigo-300 mt-0.5">{depositRate * 100}% of subtotal · paid after acceptance</p>
                                </div>
                                <div className="bg-indigo-50 px-4 py-2.5 flex items-center justify-between">
                                    <span className="text-xs text-indigo-600 font-medium">Balance on collection</span>
                                    <span className="text-sm font-bold text-indigo-700 tabular-nums">RM{remaining}</span>
                                </div>
                            </div>
                        )}

                        {/* Due date in summary */}
                        {dueDate ? (
                            <div className="mt-3 flex items-center gap-3 px-3.5 py-3 rounded-lg border border-border bg-muted/40">
                                <Calendar size={15} className="text-indigo-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground">Expected due date</p>
                                    <p className="text-xs font-bold text-foreground mt-0.5">
                                        {new Date(dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                {(() => {
 const u = urgencyMeta(dueDate);

 return u ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${u.color} ${u.bg} ${u.border}`}>{u.label}</span> : null; 
})()}
                            </div>
                        ) : (
                            <div className="mt-3 flex items-center gap-2 px-3.5 py-3 rounded-lg border border-dashed border-amber-300 bg-amber-50">
                                <Calendar size={14} className="text-amber-500 flex-shrink-0" />
                                <p className="text-xs text-amber-700 font-medium">No due date selected</p>
                            </div>
                        )}

                        <button
                            onClick={submitOrder}
                            disabled={!canCheckout || processing}
                            className="w-full mt-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            {processing ? 'Submitting...' : (orderToEdit ? 'Resubmit Order Request' : 'Submit Order Request')} <ArrowRight size={15} />
                        </button>
                        {!canCheckout && (
                            <p className="text-xs text-center text-muted-foreground mt-1.5">
                                {totalQty === 0 ? 'Add quantities to continue' : !dueDate ? 'Select a due date to continue' : 'All products need at least one size'}
                            </p>
                        )}
                        <button onClick={goToCatalog} className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Back to Catalog
                        </button>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-start gap-3">
                            <Info size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-foreground">How it works</p>
                                <ol className="text-xs text-muted-foreground mt-1.5 space-y-1 list-decimal list-inside">
                                    <li>Submit your order for review</li>
                                    <li>Tailor reviews &amp; confirms</li>
                                    <li>Pay deposit to start production</li>
                                    <li>Collect &amp; pay remaining balance</li>
                                </ol>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
