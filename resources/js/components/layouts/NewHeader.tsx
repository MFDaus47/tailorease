import { usePage } from '@inertiajs/react';
import { Search, Moon, Sun, Bell, ChevronDown, User } from 'lucide-react';
import { useState } from 'react';
import { getInitials } from '@/components/layouts/NewSidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { dummyNotifications  } from '../../../mockdata.ts';


export default function Header({}) {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const { appearance, updateAppearance } = useAppearance();

    const [notifs, setNotifs] = useState(dummyNotifications);
    const unread = notifs.filter(n => !n.read).length;


    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    return(
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
            {/* Dark Mode Switcher */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs font-medium mr-2">
            <button
                onClick={() => updateAppearance('light')}
                className={`px-3 py-1.5 rounded-md transition-all ${appearance === "light" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
                <Sun size={14}/>
            </button>
            <button
                onClick={() => updateAppearance('dark')}
                className={`px-3 py-1.5 rounded-md transition-all ${appearance === "dark" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
                <Moon size={14}/>
            </button>
            </div>

            {/* Notifications */}
            <div className="relative">
            <button
                onClick={() => {
                    setNotifOpen(!notifOpen); setProfileOpen(false);
                }}
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
                    {notifs.map(n => (
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
                {getInitials(user?.name)}
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">{user?.name}</span>
                <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {profileOpen && (
                <div className="absolute right-0 top-10 w-48 bg-card rounded-xl border border-border shadow-xl z-50 py-1.5">
                <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
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
    )
}
