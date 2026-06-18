import { router } from '@inertiajs/react';
import { ChevronLeft, RefreshCw, Layers, AlertTriangle, FileText, Upload, Calendar, ArrowRight, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { View } from '@/types';
import { dummyProducts } from '../../mockdata';
import ShirtViewer from '@/components/apparel/ShirtViewer';

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

function SizeStepper({ value, onChange, active }: { value: number; onChange: (v: number) => void; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 transition-all`}>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
        className={`w-7 h-7 rounded-md border flex items-center justify-center text-sm font-semibold transition-all select-none ${
          value === 0
            ? "border-border text-muted-foreground/40 cursor-not-allowed"
            : "border-border text-foreground hover:bg-muted active:scale-95"
        }`}
      >
        −
      </button>
      <span className={`w-8 text-center text-sm font-bold tabular-nums transition-colors ${active ? "text-indigo-600" : "text-foreground"}`}>
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

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card rounded-xl border border-border shadow-sm ${className}`}>
      {children}
    </div>
  );
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function urgencyMeta(dateStr: string | null): { label: string; color: string; bg: string; border: string } | null {
  if (!dateStr) {
return null;
}

  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dateStr); due.setHours(0,0,0,0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (days < 0)  {
return { label: "Overdue",        color: "text-red-700",    bg: "bg-red-50",    border: "border-red-300" };
}

  if (days <= 7) {
return { label: `${days}d left`,   color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200" };
}

  if (days <= 14){
return { label: `${days}d left`,   color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" };
}

  return          { label: `${days}d left`,          color: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-200" };
}

function CalendarPicker({ value, onChange, label = "Expected Due Date", minDaysFromNow = 3 }: {
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
    setStyle({ position: "fixed", top, left, zIndex: 9999, width: 272 });
    setOpen(true);
};

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
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
  const isSelected = (d: number) => {
    if (!selectedDate) {
return false;
}

    return selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === d;
  };
  const isDisabled = (d: number) => new Date(viewYear, viewMonth, d) < minDate;
  const isToday = (d: number) => {
    const t = new Date();

 return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === d;
  };

  const select = (d: number) => {
    const chosen = new Date(viewYear, viewMonth, d);
    onChange(chosen.toISOString().slice(0, 10));
    setOpen(false);
  };

  const displayValue = value ? new Date(value).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" }) : null;
  const urgency = urgencyMeta(value);

  return (
    <div>
      <label className="text-xs font-semibold text-foreground block mb-1.5">{label}</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? setOpen(false) : openPicker()}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm transition-all ${
          open ? "border-indigo-400 ring-2 ring-indigo-100" : "border-border hover:border-indigo-300"
        } bg-card`}
      >
        <span className={`flex items-center gap-2.5 ${displayValue ? "text-foreground" : "text-muted-foreground"}`}>
          <Calendar size={15} className={displayValue ? "text-indigo-500" : "text-muted-foreground"} />
          {displayValue || "Select a date..."}
        </span>
        {urgency && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${urgency.color} ${urgency.bg} ${urgency.border}`}>
            {urgency.label}
          </span>
        )}
        {!urgency && <ChevronDown size={14} className="text-muted-foreground" />}
      </button>

      {open && (
        <div
          ref={popoverRef}
          style={style}
          className="bg-card rounded-xl border border-border shadow-2xl overflow-hidden select-none"
        >
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-bold text-foreground">{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 px-3 pt-2 pb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
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
                    selected
                      ? "bg-indigo-600 text-white font-bold shadow-sm"
                      : disabled
                      ? "text-muted-foreground/30 cursor-not-allowed"
                      : tod
                      ? "border border-indigo-300 text-indigo-600 font-bold hover:bg-indigo-50"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Min date notice */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Earliest available: <span className="font-semibold text-foreground">{minDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderForm({ product, orderToEdit, onNavigate }: { product?: Product | null; orderToEdit?: any; onNavigate?: (v: View) => void }) {

    const [color, setColor] = useState("#ffffff");

    const [designFile, setDesignFile] = useState<File | null>(null);
    const [designUrl, setDesignUrl] = useState<String | null>(null);

    const handleFile = (f?: File) => {
        if (!f) {
            return;
        }

        setFileName(f.name);
        setDesignFile(f);

        const url = URL.createObjectURL(f);
        setDesignUrl(url);
    }

  // Resolve product from prop, URL, or fallback
  const getSelectedProduct = (): Product => {
    if (product) {
return product;
}

    // Try to get from URL query param
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');

    if (productId) {
      const found = dummyProducts.find((p: Product) => p.id === productId);

        if (found) {
            return found;
        }
    }

    // Fallback to first product
    return dummyProducts[0] as Product;
  };

  const prod = getSelectedProduct();
  const [quantities, setQuantities] = useState<Record<BulkSize, number>>(
    orderToEdit?.sizes || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
  );
  const [notes, setNotes] = useState(orderToEdit?.notes || "");
  const [dueDate, setDueDate] = useState<string | null>(
    orderToEdit?.due_date ? new Date(orderToEdit.due_date).toISOString().slice(0, 10) : null
  );
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(orderToEdit?.design_file_path || null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setQty = (size: BulkSize, val: number) => setQuantities(q => ({ ...q, [size]: val }));
  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);
  const subtotal = prod.basePrice * totalQty;
  const deposit = Math.round(subtotal * prod.depositRate);
  const remaining = subtotal - deposit;
  const remainingRounded = Math.max(0, Math.round(remaining));
  const activeLines = BULK_SIZES.filter(s => quantities[s] > 0);
  const canCheckout = totalQty > 0 && dueDate !== null;

  const clearAll = () => setQuantities({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });

  const submitOrder = () => {
    if (!canCheckout) {
return;
}

    setProcessing(true);

    const payload = {
      product_id: prod.id,
      product_name: prod.name,
      sizes: quantities,
      total_quantity: totalQty,
      total: subtotal,
      deposit: deposit,
      remaining_balance: remainingRounded,
      due_date: dueDate,
      notes: notes || null,
      has_design: !!fileName,
      design_file_path: fileName || null,
    };

    if (orderToEdit) {
      router.put(`/orders/${orderToEdit.id}`, payload, {
        onSuccess: () => {
          if (onNavigate) {
            onNavigate('my-orders');
          } else {
            router.visit('/my-orders');
          }
        },
        onFinish: () => setProcessing(false),
      });
    } else {
      router.post('/orders', payload, {
        onSuccess: () => {
          if (onNavigate) {
            onNavigate('my-orders');
          } else {
            router.visit('/my-orders');
          }
        },
        onFinish: () => setProcessing(false),
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => {
            if (onNavigate) {
                onNavigate('catalog');
            } else {
                router.visit('/catalog');
            }
        }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Bulk Order</h1>
          <p className="text-sm text-muted-foreground">Configure quantities per size for group or bulk apparel orders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">

          {/* Product Summary */}
          <Card className="p-4">
            <div className="flex gap-4">
              <img src={prod.image} alt={prod.name} className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">{prod.name}</p>
                    <span className="inline-block text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-0.5">{prod.category}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-foreground">RM{prod.basePrice}</p>
                    <p className="text-xs text-muted-foreground">per piece</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">{prod.description}</p>
              </div>
            </div>
          </Card>

          {/* ── Size Breakdown ── */}
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
              <div>
                <h3 className="text-sm font-bold text-foreground">Size Breakdown</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Enter quantities for each size you need.</p>
              </div>
              {totalQty > 0 && (
                <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted">
                  <RefreshCw size={11} /> Clear all
                </button>
              )}
            </div>

            {/* Size rows */}
            <div className="divide-y divide-border">
              {BULK_SIZES.map(size => {
                const qty = quantities[size];
                const active = qty > 0;
                const lineTotal = qty * prod.basePrice;

                return (
                  <div
                    key={size}
                    className={`flex items-center px-5 py-3.5 transition-colors ${active ? "bg-indigo-50/60" : "hover:bg-muted/20"}`}
                  >
                    {/* Size label */}
                    <div className="w-16 flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        active
                          ? "border-indigo-400 bg-indigo-500 text-white shadow-sm shadow-indigo-100"
                          : "border-border bg-background text-muted-foreground"
                      }`}>
                        {size}
                      </div>
                    </div>

                    {/* Description hint */}
                    <div className="flex-1 min-w-0 px-4 hidden sm:block">
                      <p className={`text-xs font-medium transition-colors ${active ? "text-indigo-700" : "text-muted-foreground"}`}>
                        {{
                          XS: "Extra Small — fits 28–30\" chest",
                          S:  "Small — fits 34–36\" chest",
                          M:  "Medium — fits 38–40\" chest",
                          L:  "Large — fits 42–44\" chest",
                          XL: "Extra Large — fits 46–48\" chest",
                          XXL:"Double XL — fits 50–52\" chest",
                        }[size]}
                      </p>
                      {active && (
                        <p className="text-xs text-indigo-500 font-medium mt-0.5">
                          RM{prod.basePrice} × {qty} = RM{lineTotal}
                        </p>
                      )}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-3">
                      <SizeStepper value={qty} onChange={v => setQty(size, v)} active={active} />
                      {active && (
                        <span className="text-xs font-semibold text-indigo-600 w-14 text-right tabular-nums">
                          RM{lineTotal}
                        </span>
                      )}
                      {!active && <span className="w-14" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer totals bar */}
            <div className={`flex items-center justify-between px-5 py-3.5 border-t-2 transition-colors ${totalQty > 0 ? "border-indigo-200 bg-indigo-50" : "border-border bg-muted/20"}`}>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 text-sm font-bold transition-colors ${totalQty > 0 ? "text-indigo-700" : "text-muted-foreground"}`}>
                  <Layers size={15} />
                  Total Quantity
                </div>
                {totalQty > 0 && (
                  <div className="flex items-center gap-1.5">
                    {activeLines.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {s}: {quantities[s]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className={`flex items-center gap-2 ${totalQty > 0 ? "text-indigo-700" : "text-muted-foreground"}`}>
                <span className="text-xl font-bold tabular-nums">{totalQty}</span>
                <span className="text-xs font-medium">pcs</span>
              </div>
            </div>

            {/* Empty nudge */}
            {totalQty === 0 && (
              <div className="px-5 py-4 flex items-center gap-2.5 bg-amber-50 border-t border-amber-100">
                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700">Add at least one size to continue. Use the + buttons above to set quantities.</p>
              </div>
            )}
          </Card>

          {/* Expected Due Date */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Expected Due Date <span className="text-red-500">*</span></h3>
                <p className="text-xs text-muted-foreground mt-0.5">When do you need your order ready for collection?</p>
              </div>
              {dueDate && (
                <button onClick={() => setDueDate(null)} className="text-xs text-muted-foreground hover:text-red-500 transition-colors">Clear</button>
              )}
            </div>
            <div className="mt-3">
              <CalendarPicker value={dueDate} onChange={setDueDate} label="" minDaysFromNow={5} />
            </div>
            {!dueDate && (
              <p className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
                <AlertTriangle size={12} /> A due date is required to proceed. The tailor uses this to plan production.
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
                    e.preventDefault();
                    setDragging(false);
                    const f = e.dataTransfer.files[0];
                    handleFile(f);

                if (f) {
                    setFileName(f.name);
                }
                }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${dragging ? "border-primary bg-accent scale-[1.01]" : "border-border hover:border-indigo-300 hover:bg-muted/30"}`}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={e => {
                    const f = e.target.files?.[0];
                    handleFile(f);

                    if (f) {
                    setFileName(f.name);
                    }
                    }} accept="image/*,.pdf,.ai"

                />
              {fileName ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FileText size={16} className="text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{fileName}</p>
                    <button onClick={e => {
 e.stopPropagation(); setFileName(null);
}} className="text-xs text-red-500 hover:underline mt-0.5">Remove</button>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={26} className={`mx-auto mb-2.5 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-sm font-semibold text-foreground">Drop your design file here</p>
                  <p className="text-xs text-muted-foreground mt-1">or <span className="text-indigo-600 font-medium">click to browse</span> · PNG, JPG, AI, PDF up to 20MB</p>
                </>
              )}
            </div>
          </Card>

          {/* 3D Viewer */}

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">3D Viewer <span className="text-muted-foreground font-normal">(Optional)</span></h3>
            <p className="text-xs text-muted-foreground mb-3">Fabric preferences, print placement, color codes, or any other production notes.</p>
            <label className="block mb-2">
              Shirt Color
            </label>

            <input
                type="color"
                value={color}
                onChange={(e) =>
                    setColor(e.target.value)
                }
            />

            <ShirtViewer color={color} designUrl={designUrl}/>
          </Card>

          {/* Special Instructions */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">Special Instructions <span className="text-muted-foreground font-normal">(Optional)</span></h3>
            <p className="text-xs text-muted-foreground mb-3">Fabric preferences, print placement, color codes, or any other production notes.</p>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Print on left chest only, Pantone 286 C for the logo, 100% cotton preferred, delivery needed by June 20..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none transition-all placeholder:text-muted-foreground"
            />
          </Card>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-4">
          <Card className="p-4 sticky top-4">
            <h3 className="text-sm font-bold text-foreground mb-4">Order Summary</h3>

            {/* Size breakdown lines */}
            {totalQty > 0 ? (
              <div className="space-y-0.5 mb-4">
                {/* Header Row */}
                <div className="flex justify-between text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] px-1 mb-2">
                  <span className="w-24">Size & Qty</span>
                  <span className="flex-1 text-center">Unit Price</span>
                  <span className="w-16 text-right">Total</span>
                </div>

                {activeLines.map(s => (
                  <div key={s} className="flex items-center justify-between text-xs py-2 px-1 border-b border-border/40 last:border-0">
                    <div className="flex items-center gap-2.5 w-24">
                      <span className="w-6 h-6 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 shadow-sm">{s}</span>
                      <span className="text-foreground font-medium">{quantities[s]} pcs</span>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-muted-foreground/60 text-[10px] font-medium mr-1.5">RM</span>
                      <span className="text-foreground font-semibold tracking-tight">{prod.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="w-16 text-right font-bold text-indigo-600 tabular-nums">
                      RM{(quantities[s] * prod.basePrice).toLocaleString()}
                    </div>
                  </div>
                ))}
                <div className="pt-2" />
              </div>
            ) : (
              <div className="mb-4 py-5 rounded-lg bg-muted/50 flex flex-col items-center text-center">
                <Layers size={22} className="text-muted-foreground/40 mb-1.5" />
                <p className="text-xs text-muted-foreground font-medium">No sizes selected yet</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">Use the size breakdown to add quantities.</p>
              </div>
            )}

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit price</span>
                <span className="font-medium text-foreground">RM{prod.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total pieces</span>
                <span className={`font-bold tabular-nums ${totalQty > 0 ? "text-indigo-600" : "text-muted-foreground"}`}>{totalQty} pcs</span>
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
                  <p className="text-xs text-indigo-300 mt-0.5">{prod.depositRate * 100}% of subtotal · paid after acceptance</p>
                </div>
                <div className="bg-indigo-50 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-medium">Balance on collection</span>
                  <span className="text-sm font-bold text-indigo-700 tabular-nums">RM{remainingRounded}</span>
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
                    {new Date(dueDate).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
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
                {totalQty === 0 ? "Add quantities to continue" : "Select a due date to continue"}
              </p>
            )}
            <button onClick={() => {
                if (onNavigate) {
                onNavigate('catalog');
                } else {
                router.visit('/catalog');
                }
                }} className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
                  <li>Tailor reviews & confirms</li>
                  <li>Pay deposit to start production</li>
                  <li>Collect & pay remaining balance</li>
                </ol>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
