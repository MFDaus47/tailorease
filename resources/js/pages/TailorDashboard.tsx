import { router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { matchesOrderQuery, orderNumber } from "@/lib/order-label";
import {
    Calendar, ChevronRight, Eye, ShoppingCart, DollarSign,
    Activity, Clock, TrendingUp
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

type OrderStatus =
    | "pending" | "accepted" | "deposit_paid" | "in_production"
    | "quality_check" | "ready" | "completed" | "rejected";

interface Order {
    id: string;
    number?: string | null;
    name?: string | null;
    customer: string;
    customerEmail: string;
    avatar: string;
    product: string;
    productId: string;
    size: string;
    quantity: number;
    total: number;
    deposit: number;
    status: OrderStatus;
    date: string;
    due_date: string | null;
    deliveryDate: string;
    notes: string;
    hasDesign: boolean;
    createdAt?: string;
}

interface TailorDashboardProps {
    orders: Order[];
}

const PIE_COLORS = ["#4F46E5", "#7C3AED", "#06B6D4", "#22C55E", "#F59E0B"];

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

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-card rounded-xl border border-border shadow-sm ${className}`}>
            {children}
        </div>
    );
}

function KpiCard({ label, value, delta, icon, color = "indigo" }: { label: string; value: string; delta?: string; icon: React.ReactNode; color?: string }) {
    const colors: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600",
        green: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        violet: "bg-violet-50 text-violet-600",
    };

    return (
        <Card className="p-5 transition-all">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
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
        </Card>
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

export default function TailorDashboard({ orders = [] }: TailorDashboardProps) {
    const [search, setSearch] = useState('');
    const displayOrders = useMemo(() => {
        const matched = orders.filter((order) => matchesOrderQuery(order, search));

        return search.trim() ? matched : matched.slice(0, 5);
    }, [orders, search]);
    const revenueData = Object.values(orders.reduce<Record<string, { month: string; revenue: number }>>((months, order) => {
        const key = (order.createdAt || '').slice(0, 7) || 'unknown';
        const label = order.createdAt ? new Date(order.createdAt).toLocaleString('en', { month: 'short' }) : '—';
        months[key] = months[key] || { month: label, revenue: 0 };
        if (order.status !== 'rejected') months[key].revenue += Number(order.total || 0);
        return months;
    }, {})).slice(-6);
    const statusCounts = orders.reduce<Record<string, number>>((counts, order) => {
        counts[order.status] = (counts[order.status] || 0) + 1;
        return counts;
    }, {});
    const counted = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    const pieData = counted.length ? counted : [{ name: 'No orders', value: 1 }];
    const revenueTotal = orders.filter((order) => order.status !== 'rejected').reduce((sum, order) => sum + Number(order.total || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Welcome back, Juan. Here's your production overview.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border px-3 py-2 rounded-lg">
                    <Calendar size={13} />
                    <span>{new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Total Orders" value={String(orders.length)} icon={<ShoppingCart size={18} />} color="indigo" />
                <KpiCard label="Revenue" value={`RM${revenueTotal.toLocaleString()}`} icon={<DollarSign size={18} />} color="green" />
                <KpiCard label="In Production" value={String(statusCounts.in_production || 0)} icon={<Activity size={18} />} color="violet" />
                <KpiCard label="Pending Review" value={String(statusCounts.pending || 0)} icon={<Clock size={18} />} color="amber" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card className="lg:col-span-2 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-foreground">Revenue Overview</h3>
                        <span className="text-xs text-muted-foreground">Last 6 months</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={v => `RM${v / 1000}k`} />
                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)" }} formatter={(v) => [`RM${Number(v ?? 0).toLocaleString()}`, "Revenue"]} />
                            <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#revGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Orders by Status</h3>
                    <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(15,23,42,0.08)" }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                        {pieData.map((d, i) => (
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
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search number or name"
                        className="w-48 rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <button onClick={() => router.visit('/all-orders')} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                {["Order", "Customer", "Product", "Total", "Status", ""].map(h => (
                                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {displayOrders.map(order => (
                                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <p className="font-semibold text-indigo-600">{orderNumber(order)}</p>
                                        {order.name && <p className="text-xs text-muted-foreground">{order.name}</p>}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <AvatarBadge initials={order.avatar} />
                                            <span className="font-medium text-foreground">{order.customer}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-foreground">{order.product}</td>
                                    <td className="px-5 py-3.5 font-semibold text-foreground">RM{order.total}</td>
                                    <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                                    <td className="px-5 py-3.5">
                                        <button onClick={() => router.visit(`/order-tracking/${encodeURIComponent(order.id)}`)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                            <Eye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
