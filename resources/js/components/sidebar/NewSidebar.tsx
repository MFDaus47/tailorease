import { usePage, router } from '@inertiajs/react';
import { LayoutDashboard, ShoppingBag, Package, Bell, Inbox, List, Layers, Tag, BarChart2, Settings, Scissors } from "lucide-react";
import type { View } from '@/types';


const customerItems = [
    { view: "dashboard" as View, icon: <LayoutDashboard size={17} />, label: "Dashboard" },
    { view: "catalog" as View, icon: <ShoppingBag size={17} />, label: "Apparel Catalog" },
    { view: "my-orders" as View, icon: <Package size={17} />, label: "My Orders" },
    { view: "notifications" as View, icon: <Bell size={17} />, label: "Notifications", badge: 2 },
];

const tailorItems = [
    { view: "dashboard" as View, icon: <LayoutDashboard size={17} />, label: "Dashboard" },
    { view: "incoming" as View, icon: <Inbox size={17} />, label: "Incoming Orders", badge: 2 },
    { view: "all-orders" as View, icon: <List size={17} />, label: "All Orders" },
    { view: "kanban" as View, icon: <Layers size={17} />, label: "Production Board" },
    { view: "manage-catalog" as View, icon: <Tag size={17} />, label: "Manage Catalog" },
    { view: "reports" as View, icon: <BarChart2 size={17} />, label: "Reports" },
    { view: "notifications" as View, icon: <Bell size={17} />, label: "Notifications", badge: 3 },
];

type SidebarProps = {
    user: {
        name: string;
        role: "customer" | "tailor";
    };
};

export default function Sidebar({ user }: SidebarProps) {
    const { url } = usePage();

    if (!user) {
        return null;
    }


    const  isActive = (view: View) => url.includes(view);

    const role = user?.role ?? "customer";

    const items = role === "customer" ? customerItems : tailorItems;

    return (
        <aside className="w-60 flex-shrink-0 h-screen flex flex-col" style={{ background: "#1E1B4B" }}>
            <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(99,102,241,0.2)" }}>
                <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <Scissors size={16} className="text-white" />
                </div>
                <div>
                    <span className="text-white font-bold text-sm tracking-tight">Tailor-Ease</span>
                    <p className="text-indigo-300 text-xs" style={{ fontSize: "10px", marginTop: "-1px" }}>
                    {role === "customer" ? "Customer Portal" : "Tailor Dashboard"}
                    </p>
                </div>
                </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {items.map(item => (
                    <SidebarItem
                        key={item.view}
                        item={item}
                        active={isActive(item.view)}
                        onClick={() => router.visit(`/${item.view}`)}
                    />
                ))}
            </nav>

            <SidebarFooter
                user={user}
            />
        </aside>
    );
}

type SidebarItemProps = {
    item: {
        view: View;
        icon: React.ReactNode;
        label: string;
        badge?: number;
    };
    active: boolean;
    onClick: () => void;
};

function SidebarItem({ item, active, onClick }: SidebarItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active ? "bg-indigo-500/25 text-white"
                : "text-indigo-200 hover:bg-indigo-500/15 hover:text-white"
                }`}
        >
            <span className="flex items-center gap-3">
                <span className={active  ? "text-indigo-300" : "text-indigo-400 group-hover:text-indigo-300"}>
                    {item.icon}
                </span>
                {item.label}
            </span>
            {item.badge && (
                <span className="bg-indigo-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                </span>
            )}
        </button>
    );
}

function SidebarFooter({user}) {
    return (
      <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(99,102,241,0.2)" }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-indigo-500/10 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user.name}</p>
            <p className="text-indigo-400 text-xs truncate" style={{ fontSize: "10px" }}>{user.role}</p>
          </div>
          <Settings size={14} className="text-indigo-400 group-hover:text-indigo-200 flex-shrink-0" />
        </div>
      </div>
    )
}

function getInitials(name?: string) {
    if (!name) {
        return "?"
    }

  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .toUpperCase();
}
