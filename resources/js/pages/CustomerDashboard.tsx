import {
    LayoutDashboard, ShoppingBag, Package, Bell, LogOut,
    Search, Plus, ChevronDown, X, Upload, CheckCircle,
    Clock, TrendingUp, DollarSign, ShoppingCart, Activity,
    Eye, Edit2, Trash2, Download, ArrowRight, MessageSquare,
    Star, Inbox, BarChart2, FileText, MoreHorizontal, Tag,
    Scissors, Home, List, Check, AlertTriangle, Send,
  ChevronRight, ChevronLeft, RefreshCw, XCircle, Info,
  Filter, Grid, Layers, User, Settings, Image, Zap,
  Calendar, CreditCard, Archive, Move
} from "lucide-react";
import { useState, useRef } from "react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import Sidebar from "@/components/sidebar/NewSidebar";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
type Role = "customer" | "tailor";
type View =
  | "dashboard" | "catalog" | "my-orders" | "order-form"
  | "order-tracking" | "payment-success" | "payment-failed"
  | "incoming" | "all-orders" | "kanban" | "manage-catalog"
  | "reports" | "notifications" | "checkout";
type OrderStatus =
  | "pending" | "accepted" | "deposit_paid" | "in_production"
  | "quality_check" | "ready" | "completed" | "rejected";

interface Product {
  id: string; name: string; category: string;
  basePrice: number; depositRate: number; image: string;
  description: string; available: boolean; rating: number; orders: number;
}
interface Message { id: string; sender: "customer" | "tailor"; text: string; time: string; }
interface Order {
  id: string; customer: string; customerEmail: string; avatar: string;
  product: string; productId: string; size: string; quantity: number;
  total: number; deposit: number; status: OrderStatus;
  date: string; deliveryDate: string; notes: string;
  hasDesign: boolean; messages: Message[];
}

// ═══════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════
const PRODUCTS: Product[] = [
  { id: "p1", name: "Bespoke Dress Shirt", category: "Shirts", basePrice: 85, depositRate: 0.5, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=280&fit=crop&auto=format", description: "Hand-crafted dress shirt tailored to your exact measurements with premium Egyptian cotton.", available: true, rating: 4.9, orders: 247 },
  { id: "p2", name: "Classic Suit Jacket", category: "Suits", basePrice: 320, depositRate: 0.5, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=280&fit=crop&auto=format", description: "Single-breasted suit jacket with full canvas construction and hand-stitched lapels.", available: true, rating: 4.8, orders: 183 },
  { id: "p3", name: "Tailored Trousers", category: "Trousers", basePrice: 145, depositRate: 0.5, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=280&fit=crop&auto=format", description: "Perfectly fitted trousers with a clean silhouette, available in wool, cotton, and linen.", available: true, rating: 4.7, orders: 312 },
  { id: "p4", name: "Formal Evening Gown", category: "Dresses", basePrice: 480, depositRate: 0.6, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=280&fit=crop&auto=format", description: "Floor-length evening gown with custom embellishments and silhouette design.", available: true, rating: 5.0, orders: 94 },
  { id: "p5", name: "Linen Summer Kurta", category: "Traditional", basePrice: 95, depositRate: 0.4, image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=280&fit=crop&auto=format", description: "Breathable linen kurta with hand-embroidered collar and cuff detailing.", available: true, rating: 4.6, orders: 156 },
  { id: "p6", name: "Tailored Blazer", category: "Suits", basePrice: 240, depositRate: 0.5, image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=280&fit=crop&auto=format", description: "Smart casual blazer with structured shoulders and clean lines for modern professionals.", available: false, rating: 4.7, orders: 88 },
];

const MOCK_ORDERS: Order[] = [
  { id: "ORD-2401", customer: "Maria Santos", customerEmail: "maria@example.com", avatar: "MS", product: "Bespoke Dress Shirt", productId: "p1", size: "M", quantity: 2, total: 170, deposit: 85, status: "in_production", date: "2026-05-28", deliveryDate: "2026-06-28", notes: "Please use the blue fabric sample. No breast pocket.", hasDesign: true, messages: [{ id: "m1", sender: "tailor", text: "Your order has been accepted! We'll begin production shortly.", time: "May 29, 09:15" }, { id: "m2", sender: "customer", text: "Thank you! Can I confirm the fabric choice?", time: "May 29, 14:30" }, { id: "m3", sender: "tailor", text: "Blue Egyptian cotton confirmed. Production starts Monday.", time: "May 30, 10:00" }] },
  { id: "ORD-2398", customer: "James Reyes", customerEmail: "james@example.com", avatar: "JR", product: "Classic Suit Jacket", productId: "p2", size: "L", quantity: 1, total: 320, deposit: 160, status: "quality_check", date: "2026-05-20", deliveryDate: "2026-06-20", notes: "Two-button, slim fit. Charcoal grey preferred.", hasDesign: false, messages: [{ id: "m1", sender: "tailor", text: "Production complete. Moving to quality check now.", time: "Jun 2, 11:00" }] },
  { id: "ORD-2385", customer: "Ana Cruz", customerEmail: "ana@example.com", avatar: "AC", product: "Formal Evening Gown", productId: "p4", size: "S", quantity: 1, total: 480, deposit: 288, status: "ready", date: "2026-05-10", deliveryDate: "2026-07-05", notes: "For a wedding. Navy blue with floral embroidery.", hasDesign: true, messages: [] },
  { id: "ORD-2370", customer: "Carlos Tan", customerEmail: "carlos@example.com", avatar: "CT", product: "Tailored Trousers", productId: "p3", size: "32x30", quantity: 3, total: 435, deposit: 218, status: "completed", date: "2026-04-25", deliveryDate: "2026-05-15", notes: "Wool blend for office wear.", hasDesign: false, messages: [] },
  { id: "ORD-2412", customer: "Rosa Garcia", customerEmail: "rosa@example.com", avatar: "RG", product: "Linen Summer Kurta", productId: "p5", size: "XL", quantity: 1, total: 95, deposit: 38, status: "pending", date: "2026-06-10", deliveryDate: "2026-06-22", notes: "White linen, mandarin collar.", hasDesign: false, messages: [] },
  { id: "ORD-2415", customer: "Paulo Dela Cruz", customerEmail: "paulo@example.com", avatar: "PD", product: "Bespoke Dress Shirt", productId: "p1", size: "XL", quantity: 1, total: 85, deposit: 43, status: "accepted", date: "2026-06-12", deliveryDate: "2026-07-10", notes: "White with French cuffs.", hasDesign: false, messages: [] },
  { id: "ORD-2416", customer: "Luisa Ramos", customerEmail: "luisa@example.com", avatar: "LR", product: "Formal Evening Gown", productId: "p4", size: "M", quantity: 1, total: 480, deposit: 288, status: "pending", date: "2026-06-13", deliveryDate: "2026-06-18", notes: "Pearl white, A-line silhouette.", hasDesign: true, messages: [] },
];

const REVENUE_DATA = [
  { month: "Jan", revenue: 4200, orders: 38 },
  { month: "Feb", revenue: 5800, orders: 47 },
  { month: "Mar", revenue: 4900, orders: 42 },
  { month: "Apr", revenue: 7200, orders: 61 },
  { month: "May", revenue: 8100, orders: 69 },
  { month: "Jun", revenue: 6800, orders: 55 },
];

const PIE_DATA = [
  { name: "Shirts", value: 35 },
  { name: "Suits", value: 25 },
  { name: "Trousers", value: 22 },
  { name: "Dresses", value: 12 },
  { name: "Traditional", value: 6 },
];
const PIE_COLORS = ["#4F46E5", "#7C3AED", "#06B6D4", "#22C55E", "#F59E0B"];

const NOTIFICATIONS = [
  { id: "n1", title: "Order ORD-2412 received", body: "Rosa Garcia placed a new order for Linen Summer Kurta.", time: "2 min ago", read: false, type: "order" },
  { id: "n2", title: "Payment confirmed", body: "James Reyes paid the remaining balance for ORD-2398.", time: "1 hr ago", read: false, type: "payment" },
  { id: "n3", title: "Order ORD-2385 ready", body: "Ana Cruz's evening gown is ready for collection.", time: "3 hrs ago", read: true, type: "order" },
  { id: "n4", title: "New message", body: "Maria Santos sent a message regarding ORD-2401.", time: "Yesterday", read: true, type: "message" },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending:       { label: "Pending Review",       color: "text-amber-700",   bg: "bg-amber-50 border border-amber-200",   dot: "bg-amber-500" },
  accepted:      { label: "Accepted",             color: "text-blue-700",    bg: "bg-blue-50 border border-blue-200",     dot: "bg-blue-500" },
  deposit_paid:  { label: "Deposit Paid",         color: "text-indigo-700",  bg: "bg-indigo-50 border border-indigo-200", dot: "bg-indigo-500" },
  in_production: { label: "In Production",        color: "text-violet-700",  bg: "bg-violet-50 border border-violet-200", dot: "bg-violet-500" },
  quality_check: { label: "Quality Check",        color: "text-cyan-700",    bg: "bg-cyan-50 border border-cyan-200",     dot: "bg-cyan-500" },
  ready:         { label: "Ready for Collection", color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200", dot: "bg-emerald-500" },
  completed:     { label: "Completed",            color: "text-slate-700",   bg: "bg-slate-100 border border-slate-200",  dot: "bg-slate-500" },
  rejected:      { label: "Rejected",             color: "text-red-700",     bg: "bg-red-50 border border-red-200",       dot: "bg-red-500" },
};

const TIMELINE_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: "pending",       label: "Pending Review",       icon: <Clock size={14} /> },
  { key: "accepted",      label: "Accepted",             icon: <Check size={14} /> },
  { key: "deposit_paid",  label: "Deposit Paid",         icon: <CreditCard size={14} /> },
  { key: "in_production", label: "In Production",        icon: <Scissors size={14} /> },
  { key: "quality_check", label: "Quality Check",        icon: <CheckCircle size={14} /> },
  { key: "ready",         label: "Ready for Collection", icon: <Package size={14} /> },
  { key: "completed",     label: "Completed",            icon: <Star size={14} /> },
];

const STEP_ORDER: OrderStatus[] = ["pending","accepted","deposit_paid","in_production","quality_check","ready","completed"];

// ═══════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function AvatarBadge({ initials, color = "indigo" }: { initials: string; color?: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-700",
    violet: "bg-violet-100 text-violet-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${colors[color] || colors.indigo}`}>
      {initials}
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

function KpiCard({ label, value, delta, icon, color = "indigo", onClick }: { label: string; value: string; delta?: string; icon: React.ReactNode; color?: string; onClick?: () => void }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <Card
      className={`p-5 transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:border-indigo-200 group" : ""}`}
      onClick={onClick}
      >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium text-muted-foreground uppercase tracking-wide ${onClick ? "group-hover:text-indigo-600 transition-colors" : ""}`}>{label}</p>
          <p className="text-2xl font-700 text-foreground mt-1 leading-tight" style={{ fontWeight: 700 }}>{value}</p>
          {delta && (
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={11} /> {delta}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
      {onClick && (
        <p className="text-xs text-indigo-500 font-medium mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          View details <ChevronRight size={11} />
        </p>
      )}
    </Card>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) {
    return null
};

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

// ═══════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// CALENDAR PICKER — fixed-positioned, never clipped
// ═══════════════════════════════════════════════════════════
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function urgencyMeta(dateStr: string | null): { label: string; color: string; bg: string; border: string } | null {
  if (!dateStr) {
    return null
    }

  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dateStr); due.setHours(0,0,0,0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (days < 0)  return { label: "Overdue",        color: "text-red-700",    bg: "bg-red-50",    border: "border-red-300" };
  if (days <= 7) return { label: `${days}d left`,   color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200" };
  if (days <= 14)return { label: `${days}d left`,   color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" };
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
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const popH = 320;
    const top = spaceBelow >= popH + 8 ? r.bottom + 6 : r.top - popH - 6;
    // keep within viewport horizontally
    const left = Math.min(r.left, window.innerWidth - 280 - 8);
    setStyle({ position: "fixed", top, left, zIndex: 9999, width: 272 });
    setOpen(true);
};

  // Close on outside click
  useState(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  });

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDate = value ? new Date(value) : null;
  const isSelected = (d: number) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === d;
  };
  const isDisabled = (d: number) => new Date(viewYear, viewMonth, d) < minDate;
  const isToday = (d: number) => {
    const t = new Date(); return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === d;
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
              if (!d) return <div key={i} />;
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


// ═══════════════════════════════════════════════════════════
// TOP NAV
// ═══════════════════════════════════════════════════════════
function TopNav({ role, onRoleSwitch, onNavigate, notifOpen, setNotifOpen }: {
  role: Role; onRoleSwitch: (r: Role) => void;
  onNavigate: (v: View) => void;
  notifOpen: boolean; setNotifOpen: (v: boolean) => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0 z-10">
      {/* Search */}
      <div className="relative w-72">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search orders, products..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-lg border border-transparent focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Role Switcher */}
        <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs font-medium mr-2">
          <button
            onClick={() => onRoleSwitch("customer")}
            className={`px-3 py-1.5 rounded-md transition-all ${role === "customer" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Customer
          </button>
          <button
            onClick={() => onRoleSwitch("tailor")}
            className={`px-3 py-1.5 rounded-md transition-all ${role === "tailor" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Tailor
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-semibold" style={{ fontSize: "9px" }}>
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-card rounded-xl border border-border shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {NOTIFICATIONS.map(n => (
                  <div key={n.id} className={`px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors ${!n.read ? "bg-indigo-50/50" : ""}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? "bg-indigo-500" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                        <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border">
                <button onClick={() => { onNavigate("notifications"); setNotifOpen(false); }} className="text-xs text-indigo-600 font-medium hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
              {role === "customer" ? "MS" : "JT"}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">{role === "customer" ? "Maria Santos" : "Juan Tailor"}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-10 w-48 bg-card rounded-xl border border-border shadow-xl z-50 py-1.5">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-xs font-semibold text-foreground">{role === "customer" ? "Maria Santos" : "Juan Tailor"}</p>
                <p className="text-xs text-muted-foreground">{role === "customer" ? "maria@example.com" : "juan@tailorease.com"}</p>
              </div>
              {[{ icon: <User size={14} />, label: "Profile" }, { icon: <Settings size={14} />, label: "Settings" }, { icon: <LogOut size={14} />, label: "Sign out" }].map(item => (
                <button key={item.label} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-lg mx-1" style={{ width: "calc(100% - 8px)" }}>
                  <span className="text-muted-foreground">{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER DASHBOARD
// ═══════════════════════════════════════════════════════════
function CustomerDashboard({ onNavigate, onSelectOrder }: { onNavigate: (v: View) => void; onSelectOrder: (o: Order) => void }) {
  const myOrders = MOCK_ORDERS.slice(0, 4);
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Good morning, Maria 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening with your orders.</p>
        </div>
        <button
          onClick={() => onNavigate("catalog")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Place New Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Orders" value="12" icon={<ShoppingCart size={18} />} color="indigo" onClick={() => onNavigate("my-orders")} />
        <KpiCard label="In Production" value="3" icon={<Activity size={18} />} color="violet" onClick={() => onNavigate("my-orders")} />
        <KpiCard label="Ready to Collect" value="1" icon={<Package size={18} />} color="green" onClick={() => onNavigate("my-orders")} />
        <KpiCard label="Total Spent" value="$1,585" icon={<DollarSign size={18} />} color="amber" onClick={() => onNavigate("my-orders")} />
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
          <button onClick={() => onNavigate("my-orders")} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="divide-y divide-border">
          {myOrders.map(order => (
            <div
              key={order.id}
              onClick={() => { onSelectOrder(order); onNavigate("order-tracking"); }}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                  <Scissors size={15} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-indigo-600 transition-colors">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.product} · {order.quantity}×</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-foreground">${order.total}</p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
                <StatusBadge status={order.status} />
                <ChevronRight size={14} className="text-muted-foreground group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <ShoppingBag size={20} />, label: "Browse Catalog", sub: "Explore our apparel", view: "catalog" as View, color: "bg-indigo-50 text-indigo-600" },
          { icon: <Package size={20} />, label: "My Orders", sub: "Track all your orders", view: "my-orders" as View, color: "bg-violet-50 text-violet-600" },
          { icon: <Bell size={20} />, label: "Notifications", sub: "2 new alerts", view: "notifications" as View, color: "bg-amber-50 text-amber-600" },
        ].map(item => (
          <Card
            key={item.label}
            className="p-4 cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all group"
            onClick={() => onNavigate(item.view)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>{item.icon}</div>
              <ArrowRight size={14} className="text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all mt-1" />
            </div>
            <p className="text-sm font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APPAREL CATALOG
// ═══════════════════════════════════════════════════════════
function ApparelCatalog({ onNavigate, onSelectProduct }: { onNavigate: (v: View) => void; onSelectProduct: (p: Product) => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", "Shirts", "Suits", "Trousers", "Dresses", "Traditional"];
  const filtered = PRODUCTS.filter(p =>
    (category === "All" || p.category === category) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Apparel Catalog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Choose from our curated collection of custom apparel.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-card rounded-lg border border-border focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-card rounded-lg border border-border p-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${category === cat ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(product => (
          <Card key={product.id} className="overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer">
            <div className="relative overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300 bg-slate-100" />
              {!product.available && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white/90 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full">Currently Unavailable</span>
                </div>
              )}
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-slate-600 px-2.5 py-1 rounded-full border border-white/50">
                {product.category}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-semibold text-foreground leading-tight">{product.name}</h3>
                <div className="flex items-center gap-1 text-amber-500 flex-shrink-0 ml-2">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs font-medium text-muted-foreground">{product.rating}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-foreground">${product.basePrice}</span>
                  <span className="text-xs text-muted-foreground ml-1">base price</span>
                </div>
                <button
                  disabled={!product.available}
                  onClick={() => { onSelectProduct(product); onNavigate("order-form"); }}
                  className="px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Order Now
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{product.orders} orders completed</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ORDER FORM
// ═══════════════════════════════════════════════════════════
const BULK_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
type BulkSize = typeof BULK_SIZES[number];

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

function OrderForm({ product, onNavigate }: { product: Product | null; onNavigate: (v: View) => void }) {
  const prod = product || PRODUCTS[0];
  const [quantities, setQuantities] = useState<Record<BulkSize, number>>({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const setQty = (size: BulkSize, val: number) => setQuantities(q => ({ ...q, [size]: val }));
  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);
  const subtotal = prod.basePrice * totalQty;
  const deposit = subtotal * prod.depositRate;
  const remaining = subtotal - deposit;
  const activeLines = BULK_SIZES.filter(s => quantities[s] > 0);
  const canCheckout = totalQty > 0 && dueDate !== null;

  const clearAll = () => setQuantities({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate("catalog")} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
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
                    <p className="text-base font-bold text-foreground">${prod.basePrice}</p>
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
                          ${prod.basePrice} × {qty} = ${lineTotal}
                        </p>
                      )}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-3">
                      <SizeStepper value={qty} onChange={v => setQty(size, v)} active={active} />
                      {active && (
                        <span className="text-xs font-semibold text-indigo-600 w-14 text-right tabular-nums">
                          ${lineTotal}
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
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFileName(f.name); }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${dragging ? "border-primary bg-accent scale-[1.01]" : "border-border hover:border-indigo-300 hover:bg-muted/30"}`}
            >
              <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFileName(f.name); }} accept="image/*,.pdf,.ai" />
              {fileName ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FileText size={16} className="text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{fileName}</p>
                    <button onClick={e => { e.stopPropagation(); setFileName(null); }} className="text-xs text-red-500 hover:underline mt-0.5">Remove</button>
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
              <div className="space-y-1.5 mb-4">
                {activeLines.map(s => (
                  <div key={s} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-5 rounded bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">{s}</span>
                      <span className="text-muted-foreground">× {quantities[s]} pcs</span>
                    </div>
                    <span className="font-semibold text-foreground tabular-nums">${quantities[s] * prod.basePrice}</span>
                  </div>
                ))}
                <div className="border-t border-dashed border-border pt-1.5 mt-2" />
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
                <span className="font-medium text-foreground">${prod.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total pieces</span>
                <span className={`font-bold tabular-nums ${totalQty > 0 ? "text-indigo-600" : "text-muted-foreground"}`}>{totalQty} pcs</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5">
                <span className="font-semibold text-foreground">Subtotal</span>
                <span className="font-bold text-foreground text-base tabular-nums">${subtotal.toLocaleString()}</span>
              </div>
            </div>

            {totalQty > 0 && (
              <div className="mt-3 rounded-xl overflow-hidden border border-indigo-200">
                <div className="bg-indigo-600 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-100">Deposit to confirm</span>
                    <span className="text-lg font-black text-white tabular-nums">${deposit.toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-indigo-300 mt-0.5">{prod.depositRate * 100}% of subtotal · paid now</p>
                </div>
                <div className="bg-indigo-50 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-medium">Balance on collection</span>
                  <span className="text-sm font-bold text-indigo-700 tabular-nums">${remaining.toFixed(0)}</span>
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
                {(() => { const u = urgencyMeta(dueDate); return u ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${u.color} ${u.bg} ${u.border}`}>{u.label}</span> : null; })()}
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 px-3.5 py-3 rounded-lg border border-dashed border-amber-300 bg-amber-50">
                <Calendar size={14} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700 font-medium">No due date selected</p>
              </div>
            )}

            <button
              onClick={() => onNavigate("checkout")}
              disabled={!canCheckout}
              className="w-full mt-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={15} />
            </button>
            {!canCheckout && (
              <p className="text-xs text-center text-muted-foreground mt-1.5">
                {totalQty === 0 ? "Add quantities to continue" : "Select a due date to continue"}
              </p>
            )}
            <button onClick={() => onNavigate("catalog")} className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Catalog
            </button>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">How it works</p>
                <ol className="text-xs text-muted-foreground mt-1.5 space-y-1 list-decimal list-inside">
                  <li>Submit your order & pay deposit</li>
                  <li>Tailor reviews & confirms</li>
                  <li>Production begins</li>
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

// ═══════════════════════════════════════════════════════════
// ORDER TRACKING
// ═══════════════════════════════════════════════════════════
function OrderTracking({ order: selectedOrder, onNavigate }: { order: Order | null; onNavigate: (v: View) => void }) {
  const order = selectedOrder || MOCK_ORDERS[0];
  const [newMsg, setNewMsg] = useState("");
  const [messages, setMessages] = useState(order.messages);
  const currentStepIdx = STEP_ORDER.indexOf(order.status);

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    setMessages(m => [...m, { id: `m${m.length + 1}`, sender: "customer", text: newMsg, time: "Just now" }]);
    setNewMsg("");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate("my-orders")} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Order {order.id}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Placed on {order.date} · Expected {order.deliveryDate}</p>
        </div>
        {order.status === "ready" && (
          <button onClick={() => onNavigate("checkout")} className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
            <CreditCard size={15} /> Pay Balance
          </button>
        )}
        {order.status === "accepted" && (
          <button onClick={() => onNavigate("checkout")} className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <CreditCard size={15} /> Pay Deposit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Timeline */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-5">Order Progress</h3>
            {order.status === "rejected" ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                <XCircle size={20} className="text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Order Rejected</p>
                  <p className="text-xs text-red-500 mt-0.5">Please contact support or place a new order.</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
                <div className="space-y-4">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const done = idx < currentStepIdx;
                    const active = idx === currentStepIdx;
                    const future = idx > currentStepIdx;
                    return (
                      <div key={step.key} className="flex items-center gap-4 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all ${
                          done ? "bg-indigo-600 border-indigo-600 text-white" :
                          active ? "bg-white border-indigo-500 text-indigo-600 shadow-md shadow-indigo-100" :
                          "bg-white border-border text-muted-foreground"
                        }`}>
                          {done ? <Check size={14} /> : step.icon}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${active ? "text-indigo-600" : done ? "text-foreground" : "text-muted-foreground"}`}>
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
          <Card className="flex flex-col" style={{ height: "380px" }}>
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
                <div key={msg.id} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-2.5 ${
                    msg.sender === "customer"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "customer" ? "text-indigo-200" : "text-muted-foreground"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMsg()}
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
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Order Details</h3>
            <div className="space-y-2.5 text-sm">
              {[
                { label: "Product", value: order.product },
                { label: "Size", value: order.size },
                { label: "Quantity", value: `${order.quantity}×` },
                { label: "Total Amount", value: `$${order.total}` },
                { label: "Deposit Paid", value: `$${order.deposit}` },
                { label: "Remaining", value: `$${order.total - order.deposit}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {order.hasDesign && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Design File</h3>
              <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Image size={15} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">design_reference.png</p>
                  <p className="text-xs text-muted-foreground">2.4 MB</p>
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

// ═══════════════════════════════════════════════════════════
// MY ORDERS
// ═══════════════════════════════════════════════════════════
function MyOrders({ onNavigate, onSelectOrder }: { onNavigate: (v: View) => void; onSelectOrder: (o: Order) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const filtered = MOCK_ORDERS.filter(o =>
    (filter === "all" || o.status === filter) &&
    (search === "" || o.id.includes(search) || o.product.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and manage all your custom apparel orders.</p>
        </div>
        <button onClick={() => onNavigate("catalog")} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
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
              {["Order ID", "Product", "Size", "Total", "Date", "Status", ""].map(h => (
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
                <td className="px-5 py-3.5 font-semibold text-foreground">${order.total}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{order.date}</td>
                <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                <td className="px-5 py-3.5">
                  <button onClick={() => { onSelectOrder(order); onNavigate("order-tracking"); }} className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
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

// ═══════════════════════════════════════════════════════════
// CHECKOUT / PAYMENT PAGES
// ═══════════════════════════════════════════════════════════
function CheckoutPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate("order-form")} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><ChevronLeft size={18} /></button>
        <h1 className="text-xl font-bold text-foreground">Checkout</h1>
      </div>
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Order Summary</h3>
        <div className="flex gap-4 pb-4 border-b border-border">
          <img src={PRODUCTS[0].image} alt="Product" className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
          <div>
            <p className="text-sm font-semibold text-foreground">{PRODUCTS[0].name}</p>
            <p className="text-xs text-muted-foreground">Size M · ×1 · Order ORD-2420</p>
          </div>
        </div>
        <div className="space-y-2 mt-4 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>$85.00</span></div>
          <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2"><span>Deposit Due Now</span><span className="text-indigo-600">$42.50</span></div>
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
        {/* Card form */}
        <div className="mt-4 space-y-3">
          <input type="text" placeholder="Card number" className="w-full px-3.5 py-2.5 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all placeholder:text-muted-foreground" />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="MM / YY" className="w-full px-3.5 py-2.5 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all placeholder:text-muted-foreground" />
            <input type="text" placeholder="CVV" className="w-full px-3.5 py-2.5 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all placeholder:text-muted-foreground" />
          </div>
        </div>
      </Card>
      <div className="flex gap-3">
        <button onClick={() => onNavigate("payment-failed")} className="flex-1 py-2.5 border border-border text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted transition-colors">Cancel</button>
        <button onClick={() => onNavigate("payment-success")} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2">
          <CreditCard size={15} /> Pay $42.50
        </button>
      </div>
    </div>
  );
}

function PaymentSuccessPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle size={40} className="text-emerald-500" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Your deposit of <strong>$42.50</strong> has been received. Your order <strong>ORD-2420</strong> is now confirmed and the tailor will review it shortly.</p>
      <div className="bg-card rounded-xl border border-border p-5 text-left space-y-2 mb-6">
        {[["Order ID", "ORD-2420"], ["Product", "Bespoke Dress Shirt"], ["Amount Paid", "$42.50"], ["Date", new Date().toLocaleDateString()]].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium text-foreground">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => onNavigate("order-tracking")} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
          Track Order
        </button>
        <button onClick={() => onNavigate("dashboard")} className="px-5 py-2.5 border border-border text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

function PaymentFailedPage({ onNavigate }: { onNavigate: (v: View) => void }) {
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
        <button onClick={() => onNavigate("checkout")} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
          Try Again
        </button>
        <button onClick={() => onNavigate("dashboard")} className="px-5 py-2.5 border border-border text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAILOR DASHBOARD
// ═══════════════════════════════════════════════════════════
function TailorDashboard({ onNavigate, onSelectOrder }: { onNavigate: (v: View) => void; onSelectOrder: (o: Order) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, Juan. Here's your production overview.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border px-3 py-2 rounded-lg">
          <Calendar size={13} />
          <span>June 2024</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Orders" value="47" delta="+12% this month" icon={<ShoppingCart size={18} />} color="indigo" />
        <KpiCard label="Revenue (MTD)" value="$6,800" delta="+8% vs last month" icon={<DollarSign size={18} />} color="green" />
        <KpiCard label="In Production" value="8" icon={<Activity size={18} />} color="violet" />
        <KpiCard label="Pending Review" value="2" icon={<Clock size={18} />} color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Revenue Overview</h3>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Orders by Category</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(15,23,42,0.08)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {PIE_DATA.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
          <button onClick={() => onNavigate("all-orders")} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Order", "Customer", "Product", "Total", "Status", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_ORDERS.slice(0, 5).map(order => (
              <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-indigo-600">{order.id}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <AvatarBadge initials={order.avatar} />
                    <span className="font-medium text-foreground">{order.customer}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-foreground">{order.product}</td>
                <td className="px-5 py-3.5 font-semibold text-foreground">${order.total}</td>
                <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                <td className="px-5 py-3.5">
                  <button onClick={() => { onSelectOrder(order); onNavigate("all-orders"); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INCOMING ORDERS
// ═══════════════════════════════════════════════════════════
function IncomingOrders({ onNavigate, onSelectOrder }: { onNavigate: (v: View) => void; onSelectOrder: (o: Order) => void }) {
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<string>("");
  const [orders, setOrders] = useState(MOCK_ORDERS.filter(o => o.status === "pending"));

  const accept = (id: string) => setOrders(o => o.filter(x => x.id !== id));
  const openReject = (id: string) => { setRejectTarget(id); setRejectModal(true); };
  const confirmReject = () => { setOrders(o => o.filter(x => x.id !== rejectTarget)); setRejectModal(false); setRejectReason(""); };

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
                      <p className="text-lg font-bold text-foreground">${order.total}</p>
                      <p className="text-xs text-muted-foreground">Deposit: ${order.deposit}</p>
                    </div>
                  </div>

                  {/* Due date — critical decision factor */}
                  {(() => {
                    const u = urgencyMeta(order.deliveryDate);
                    const dueDisplay = new Date(order.deliveryDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
                    return (
                      <div className={`mt-3 flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${u ? `${u.border} ${u.bg}` : "border-border bg-muted/30"}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${u ? u.bg : "bg-muted"}`}>
                          <Calendar size={17} className={u ? u.color : "text-muted-foreground"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer Due Date</p>
                          <p className={`text-sm font-bold mt-0.5 ${u ? u.color : "text-foreground"}`}>{dueDisplay}</p>
                        </div>
                        {u && (
                          <div className={`flex-shrink-0 text-center px-3 py-1.5 rounded-lg border ${u.border} ${u.bg}`}>
                            <p className={`text-lg font-black leading-none ${u.color}`}>
                              {Math.max(0, Math.round((new Date(order.deliveryDate).getTime() - Date.now()) / 86400000))}
                            </p>
                            <p className={`text-xs font-semibold ${u.color}`}>days left</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[["Product", order.product], ["Size", order.size], ["Quantity", `×${order.quantity}`]].map(([k, v]) => (
                      <div key={k} className="bg-muted rounded-lg p-2.5">
                        <p className="text-xs text-muted-foreground">{k}</p>
                        <p className="text-xs font-semibold text-foreground mt-0.5">{v}</p>
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
                    <button onClick={() => { onSelectOrder(order); onNavigate("all-orders"); }} className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
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
            {["Unable to source required fabric", "Delivery date not feasible", "Design too complex for current capacity", "Other"].map(r => (
              <label key={r} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer mb-2 transition-all ${rejectReason === r ? "border-red-400 bg-red-50" : "border-border hover:border-red-200"}`}>
                <input type="radio" name="reason" value={r} checked={rejectReason === r} onChange={() => setRejectReason(r)} className="accent-red-500" />
                <span className="text-sm text-foreground">{r}</span>
              </label>
            ))}
          </div>
          <textarea placeholder="Additional notes (optional)..." rows={3} className="w-full px-3 py-2.5 text-sm bg-muted rounded-lg border border-border focus:border-red-300 focus:outline-none resize-none placeholder:text-muted-foreground" />
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

// ═══════════════════════════════════════════════════════════
// ALL ORDERS (TAILOR)
// ═══════════════════════════════════════════════════════════
function AllOrders({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = MOCK_ORDERS.filter(o =>
    (filter === "all" || o.status === filter) &&
    (search === "" || o.id.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase()) || o.product.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">All Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor all customer orders.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors">
          <Download size={14} /> Export
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order, customer, product..." className="w-full pl-9 pr-4 py-2 text-sm bg-card rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 text-sm bg-card rounded-lg border border-border focus:outline-none text-foreground">
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className={`${selected ? "lg:col-span-3" : "lg:col-span-5"}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Order", "Customer", "Product", "Total", "Order Date", "Due Date", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(order => {
                const u = urgencyMeta(order.deliveryDate);
                return (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className={`cursor-pointer transition-colors ${selected?.id === order.id ? "bg-indigo-50/60" : "hover:bg-muted/30"}`}
                >
                  <td className="px-5 py-3.5 font-semibold text-indigo-600">{order.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <AvatarBadge initials={order.avatar} />
                      <span className="font-medium text-foreground">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-foreground">{order.product}</td>
                  <td className="px-5 py-3.5 font-semibold">${order.total}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{order.date}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-foreground">
                        {new Date(order.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      {u && (
                        <span className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md ${u.color} ${u.bg}`}>
                          {u.label}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {selected && (
          <Card className="lg:col-span-2 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Order Details</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X size={14} /></button>
            </div>
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <AvatarBadge initials={selected.avatar} color="violet" />
              <div>
                <p className="text-sm font-semibold text-foreground">{selected.customer}</p>
                <p className="text-xs text-muted-foreground">{selected.customerEmail}</p>
              </div>
            </div>

            {/* Due date — prominent */}
            {(() => {
              const u = urgencyMeta(selected.deliveryDate);
              const dueDisplay = new Date(selected.deliveryDate).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
              const daysLeft = Math.round((new Date(selected.deliveryDate).getTime() - Date.now()) / 86400000);
              return (
                <div className={`rounded-xl border-2 overflow-hidden ${u ? u.border : "border-border"}`}>
                  <div className={`px-3.5 py-2.5 flex items-center gap-3 ${u ? u.bg : "bg-muted/30"}`}>
                    <Calendar size={16} className={u ? u.color : "text-muted-foreground"} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Due Date</p>
                      <p className={`text-sm font-bold mt-0.5 ${u ? u.color : "text-foreground"}`}>{dueDisplay}</p>
                    </div>
                    <div className={`text-center px-2.5 py-1.5 rounded-lg ${u ? `${u.bg} border ${u.border}` : ""}`}>
                      <p className={`text-xl font-black leading-none ${u ? u.color : "text-foreground"}`}>{Math.max(0, daysLeft)}</p>
                      <p className={`text-xs font-semibold ${u ? u.color : "text-muted-foreground"}`}>days</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2 text-sm">
              {[
                ["Order ID", selected.id], ["Product", selected.product],
                ["Size", selected.size], ["Quantity", `×${selected.quantity}`],
                ["Total", `$${selected.total}`], ["Deposit", `$${selected.deposit}`],
                ["Remaining", `$${selected.total - selected.deposit}`],
                ["Order Date", selected.date],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
            </div>
            <div><StatusBadge status={selected.status} /></div>
            {selected.notes && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs font-semibold text-foreground mb-1">Customer Notes</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{selected.notes}</p>
              </div>
            )}
            {selected.hasDesign && (
              <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center"><Image size={14} className="text-indigo-600" /></div>
                <div className="flex-1"><p className="text-xs font-medium text-foreground">design_file.png</p><p className="text-xs text-muted-foreground">2.4 MB</p></div>
                <button className="text-muted-foreground hover:text-foreground transition-colors"><Download size={14} /></button>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Internal Notes</p>
              <textarea placeholder="Add internal notes..." rows={3} className="w-full px-3 py-2.5 text-xs bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none resize-none placeholder:text-muted-foreground" />
            </div>
            <select className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none text-foreground">
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k} selected={selected.status === k}>{v.label}</option>)}
            </select>
            <button className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Update Status</button>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// KANBAN BOARD
// ═══════════════════════════════════════════════════════════
const KANBAN_COLS: { key: OrderStatus; label: string; color: string }[] = [
  { key: "pending",       label: "Pending Review",  color: "border-amber-300 bg-amber-50" },
  { key: "accepted",      label: "Accepted",         color: "border-blue-300 bg-blue-50" },
  { key: "in_production", label: "In Production",   color: "border-violet-300 bg-violet-50" },
  { key: "quality_check", label: "Quality Check",   color: "border-cyan-300 bg-cyan-50" },
  { key: "ready",         label: "Ready",           color: "border-emerald-300 bg-emerald-50" },
  { key: "completed",     label: "Completed",       color: "border-slate-300 bg-slate-50" },
];

function KanbanBoard() {
  const [orderMap, setOrderMap] = useState<Record<string, OrderStatus>>(() => {
    const m: Record<string, OrderStatus> = {};
    MOCK_ORDERS.forEach(o => { m[o.id] = o.status; });
    return m;
  });

  const moveForward = (orderId: string, currentStatus: OrderStatus) => {
    const idx = STEP_ORDER.indexOf(currentStatus);
    if (idx < STEP_ORDER.length - 1) {
      setOrderMap(m => ({ ...m, [orderId]: STEP_ORDER[idx + 1] }));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Production Board</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track and move orders through the production workflow.</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "500px" }}>
        {KANBAN_COLS.map(col => {
          const colOrders = MOCK_ORDERS.filter(o => orderMap[o.id] === col.key);
          return (
            <div key={col.key} className="flex-shrink-0 w-56">
              <div className={`rounded-t-lg border-t-2 border-x border-border px-3 py-2.5 flex items-center justify-between ${col.color}`}>
                <span className="text-xs font-bold text-foreground">{col.label}</span>
                <span className="text-xs bg-white/70 font-semibold px-1.5 py-0.5 rounded-full text-foreground">{colOrders.length}</span>
              </div>
              <div className="border-x border-b border-border rounded-b-lg bg-muted/30 p-2 space-y-2 min-h-80">
                {colOrders.map(order => (
                  <div key={order.id} className="bg-card rounded-lg border border-border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-600">{order.id}</span>
                      {order.hasDesign && <Image size={11} className="text-muted-foreground" />}
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-tight mb-1">{order.product}</p>
                    <div className="flex items-center gap-1.5 mb-2">
                      <AvatarBadge initials={order.avatar} />
                      <span className="text-xs text-muted-foreground truncate">{order.customer.split(" ")[0]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">${order.total}</span>
                      <span className="text-xs text-muted-foreground">{order.size}</span>
                    </div>
                    {col.key !== "completed" && (
                      <button
                        onClick={() => moveForward(order.id, col.key)}
                        className="mt-2 w-full text-xs py-1.5 border border-dashed border-border text-muted-foreground hover:border-indigo-300 hover:text-indigo-600 rounded-md transition-all flex items-center justify-center gap-1"
                      >
                        Move forward <ChevronRight size={11} />
                      </button>
                    )}
                  </div>
                ))}
                {colOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center mb-2">
                      <Archive size={14} className="text-muted-foreground/50" />
                    </div>
                    <p className="text-xs text-muted-foreground/60">No orders</p>
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

// ═══════════════════════════════════════════════════════════
// MANAGE CATALOG
// ═══════════════════════════════════════════════════════════
function ManageCatalog() {
  const [products, setProducts] = useState(PRODUCTS);
  const [showForm, setShowForm] = useState(false);
  const [editProd, setEditProd] = useState<Product | null>(null);

  const toggle = (id: string) => setProducts(p => p.map(x => x.id === id ? { ...x, available: !x.available } : x));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Manage Catalog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Add, edit, and manage your apparel offerings.</p>
        </div>
        <button onClick={() => { setEditProd(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map(prod => (
          <Card key={prod.id} className="overflow-hidden">
            <div className="relative">
              <img src={prod.image} alt={prod.name} className="w-full h-36 object-cover bg-slate-100" />
              <div className={`absolute top-2.5 right-2.5 px-2 py-1 rounded-full text-xs font-semibold ${prod.available ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"}`}>
                {prod.available ? "Available" : "Unavailable"}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{prod.name}</p>
                  <p className="text-xs text-muted-foreground">{prod.category} · {prod.orders} orders</p>
                </div>
                <span className="text-sm font-bold text-foreground">${prod.basePrice}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{prod.description}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(prod.id)} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${prod.available ? "border-slate-200 text-slate-600 hover:bg-slate-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}`}>
                  {prod.available ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => { setEditProd(prod); setShowForm(true); }} className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 size={14} />
                </button>
                <button className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editProd ? "Edit Product" : "Add New Product"}>
        <div className="space-y-3">
          {[{ label: "Product Name", placeholder: "e.g. Classic Dress Shirt" }, { label: "Category", placeholder: "e.g. Shirts" }, { label: "Base Price ($)", placeholder: "0.00" }, { label: "Deposit Rate (%)", placeholder: "50" }].map(f => (
            <div key={f.label}>
              <label className="text-xs font-semibold text-foreground block mb-1">{f.label}</label>
              <input defaultValue={editProd ? (f.label === "Product Name" ? editProd.name : f.label === "Category" ? editProd.category : f.label === "Base Price ($)" ? editProd.basePrice : editProd.depositRate * 100) : ""} placeholder={f.placeholder} className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
            <textarea defaultValue={editProd?.description} placeholder="Product description..." rows={3} className="w-full px-3 py-2.5 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none resize-none placeholder:text-muted-foreground" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Product Image</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-indigo-300 transition-colors">
              <Upload size={20} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Click to upload or drag & drop</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-border text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted transition-colors">Cancel</button>
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              {editProd ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════
function Reports() {
  const [range, setRange] = useState("6m");
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Revenue insights and business performance overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-card border border-border rounded-lg p-0.5 text-xs font-medium">
            {["1m","3m","6m","1y"].map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-md transition-all ${range === r ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{r}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3.5 py-2 border border-border text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value="$37,000" delta="+18% YTD" icon={<DollarSign size={18} />} color="green" />
        <KpiCard label="Total Orders" value="312" delta="+24% YTD" icon={<ShoppingCart size={18} />} color="indigo" />
        <KpiCard label="Avg Order Value" value="$118" delta="+6% YTD" icon={<TrendingUp size={18} />} color="violet" />
        <KpiCard label="Completion Rate" value="94.2%" delta="+2.1%" icon={<CheckCircle size={18} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Revenue & Orders</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rev" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)" }} />
              <Bar yAxisId="rev" dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Revenue ($)" />
              <Bar yAxisId="ord" dataKey="orders" fill="#C7D2FE" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Products</h3>
          <div className="space-y-4">
            {[
              { name: "Tailored Trousers", orders: 312, pct: 100 },
              { name: "Dress Shirt", orders: 247, pct: 79 },
              { name: "Suit Jacket", orders: 183, pct: 59 },
              { name: "Summer Kurta", orders: 156, pct: 50 },
              { name: "Evening Gown", orders: 94, pct: 30 },
            ].map((p, i) => (
              <div key={p.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.orders} orders</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Monthly Breakdown</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Month", "Orders", "Revenue", "Avg Order", "Completed", "Rejected"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {REVENUE_DATA.map(row => (
              <tr key={row.month} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 font-semibold text-foreground">{row.month} 2024</td>
                <td className="py-3 text-foreground">{row.orders}</td>
                <td className="py-3 font-semibold text-foreground">${row.revenue.toLocaleString()}</td>
                <td className="py-3 text-foreground">${Math.round(row.revenue / row.orders)}</td>
                <td className="py-3"><span className="text-emerald-600 font-medium">{row.orders - Math.floor(row.orders * 0.06)}</span></td>
                <td className="py-3"><span className="text-red-500 font-medium">{Math.floor(row.orders * 0.06)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS PAGE
// ═══════════════════════════════════════════════════════════
function NotificationsPage() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{notifs.filter(n => !n.read).length} unread notifications</p>
        </div>
        <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))} className="text-xs text-indigo-600 font-medium hover:underline">Mark all as read</button>
      </div>
      <Card className="divide-y divide-border">
        {notifs.map(n => (
          <div key={n.id} onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))} className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors ${!n.read ? "bg-indigo-50/40" : ""}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${n.type === "order" ? "bg-indigo-100 text-indigo-600" : n.type === "payment" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
              {n.type === "order" ? <Package size={16} /> : n.type === "payment" ? <CreditCard size={16} /> : <MessageSquare size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className={`text-sm font-semibold ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [role, setRole] = useState<Role>("customer");
  const [view, setView] = useState<View>("dashboard");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const switchRole = (r: Role) => {
    setRole(r);
    setView("dashboard");
    setNotifOpen(false);
  };

  const navigate = (v: View) => {
    setView(v);
    setNotifOpen(false);
  };

  const renderView = () => {
    if (role === "customer") {
      switch (view) {
        case "dashboard":     return <CustomerDashboard onNavigate={navigate} onSelectOrder={setSelectedOrder} />;
        case "catalog":       return <ApparelCatalog onNavigate={navigate} onSelectProduct={setSelectedProduct} />;
        case "my-orders":     return <MyOrders onNavigate={navigate} onSelectOrder={setSelectedOrder} />;
        case "order-form":    return <OrderForm product={selectedProduct} onNavigate={navigate} />;
        case "order-tracking":return <OrderTracking order={selectedOrder} onNavigate={navigate} />;
        case "checkout":      return <CheckoutPage onNavigate={navigate} />;
        case "payment-success":return <PaymentSuccessPage onNavigate={navigate} />;
        case "payment-failed": return <PaymentFailedPage onNavigate={navigate} />;
        case "notifications": return <NotificationsPage />;
        default:              return <CustomerDashboard onNavigate={navigate} onSelectOrder={setSelectedOrder} />;
      }
    } else {
      switch (view) {
        case "dashboard":     return <TailorDashboard onNavigate={navigate} onSelectOrder={setSelectedOrder} />;
        case "incoming":      return <IncomingOrders onNavigate={navigate} onSelectOrder={setSelectedOrder} />;
        case "all-orders":    return <AllOrders onNavigate={navigate} />;
        case "kanban":        return <KanbanBoard />;
        case "manage-catalog":return <ManageCatalog />;
        case "reports":       return <Reports />;
        case "notifications": return <NotificationsPage />;
        default:              return <TailorDashboard onNavigate={navigate} onSelectOrder={setSelectedOrder} />;
      }
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav
          role={role}
          onRoleSwitch={switchRole}
          onNavigate={navigate}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
        />
        <main className="flex-1 overflow-y-auto p-6" onClick={() => notifOpen && setNotifOpen(false)}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}
