import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import {
    DollarSign, ShoppingCart, CheckCircle,
    Download, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

type MonthRow = { key: string; month: string; year: number; revenue: number; orders: number; completed: number; rejected: number };
type ProductMonth = { key: string; name: string; orders: number; revenue: number };

const PIE_COLORS = ["#4F46E5", "#7C3AED", "#06B6D4", "#22C55E", "#F59E0B"];

const RANGE_LABELS: Record<string, string> = {
    "1m": "Last 1 Month",
    "3m": "Last 3 Months",
    "6m": "Last 6 Months",
    "1y": "Last 12 Months",
};

function formatCurrency(value: number) {
    return `RM${value.toLocaleString()}`;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-card rounded-xl border border-border shadow-sm ${className}`}>
            {children}
        </div>
    );
}

function KpiCard({ label, value, delta, icon, color = "indigo", trend }: { label: string; value: string; delta?: string; icon: React.ReactNode; color?: string; trend?: "up" | "down" }) {
    const colors: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600",
        green: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        violet: "bg-violet-50 text-violet-600",
    };

    return (
        <Card className="p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1.5 leading-tight">{value}</p>
                    {delta && (
                        <p className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${trend === "down" ? "text-red-600" : "text-emerald-600"}`}>
                            {trend === "down" ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}
                            {delta}
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

export default function Reports({ months = [], productMonths = [] }: { months?: MonthRow[]; productMonths?: ProductMonth[] }) {
    const [range, setRange] = useState("6m");
    const span = range === "1m" ? 1 : range === "3m" ? 3 : range === "1y" ? 12 : 6;
    const data = months.slice(-span);
    const keys = new Set(data.map((row) => row.key));
    const productTotals = new Map<string, { name: string; orders: number; revenue: number }>();
    productMonths.filter((row) => keys.has(row.key)).forEach((row) => {
        const current = productTotals.get(row.name) ?? { name: row.name, orders: 0, revenue: 0 };
        current.orders += row.orders;
        current.revenue += row.revenue;
        productTotals.set(row.name, current);
    });
    const topProducts = [...productTotals.values()].sort((a, b) => b.orders - a.orders).slice(0, 5);

    const totalRevenue = data.reduce((s, r) => s + r.revenue, 0);
    const totalOrders = data.reduce((s, r) => s + r.orders, 0);
    const totalCompleted = data.reduce((s, r) => s + r.completed, 0);
    const completionRate = totalOrders > 0 ? ((totalCompleted / totalOrders) * 100).toFixed(1) : "0.0";
    const totalRejected = data.reduce((s, r) => s + r.rejected, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {RANGE_LABELS[range] || "All time"} · {data.length} month{data.length !== 1 ? "s" : ""} of data
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-card border border-border rounded-lg p-0.5 text-xs font-medium">
                        {Object.keys(RANGE_LABELS).map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-3 py-1.5 rounded-md transition-all ${range === r ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-3.5 py-2 border border-border text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors">
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <KpiCard
                    label="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    icon={<DollarSign size={18} />}
                    color="green"
                />
                <KpiCard
                    label="Total Orders"
                    value={String(totalOrders)}
                    icon={<ShoppingCart size={18} />}
                    color="indigo"
                />
                <KpiCard
                    label="Fulfillment Rate"
                    value={`${completionRate}%`}
                    delta={totalRejected > 0 ? `${totalRejected} rejected` : undefined}
                    icon={<CheckCircle size={18} />}
                    color="amber"
                    trend={parseFloat(completionRate) >= 94 ? "up" : "down"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card className="lg:col-span-2 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Monthly Revenue</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {formatCurrency(totalRevenue)} total across {totalOrders} orders
                            </p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#64748B" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={v => `RM${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                            />
                            <Tooltip
                                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)" }}
                                formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
                            />
                            <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-1">Top Performing Products</h3>
                    <p className="text-xs text-muted-foreground mb-4">By order volume — {RANGE_LABELS[range] || "all time"}</p>
                    <div className="space-y-4">
                        {topProducts.map((p, i) => {
                            const maxOrders = topProducts[0]?.orders || 1;
                            return (
                                <div key={p.name}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-medium text-foreground">{p.name}</span>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold text-foreground">{p.orders} orders</span>
                                            <span className="text-[10px] text-muted-foreground ml-1.5">{formatCurrency(p.revenue)}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(p.orders / maxOrders) * 100}%`,
                                                background: PIE_COLORS[i % PIE_COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Monthly Breakdown</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {RANGE_LABELS[range] || "All time"} · {totalCompleted} completed, {totalRejected} rejected
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                {["Month", "Revenue", "Orders", "Completed", "Rejected", "Completion %"].map(h => (
                                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.map(row => {
                                const rate = row.orders > 0 ? ((row.completed / row.orders) * 100).toFixed(1) : "0.0";
                                return (
                                    <tr key={row.month} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-3 font-semibold text-foreground whitespace-nowrap">{row.month} {row.year}</td>
                                        <td className="py-3 font-semibold text-foreground whitespace-nowrap">{formatCurrency(row.revenue)}</td>
                                        <td className="py-3 text-foreground">{row.orders}</td>
                                        <td className="py-3"><span className="text-emerald-600 font-medium">{row.completed}</span></td>
                                        <td className="py-3"><span className="text-red-500 font-medium">{row.rejected}</span></td>
                                        <td className="py-3"><span className="text-indigo-600 font-medium">{rate}%</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
