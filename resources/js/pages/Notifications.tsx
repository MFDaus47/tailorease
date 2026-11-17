import { router, usePage } from '@inertiajs/react';
import { Package, CreditCard, MessageSquare } from 'lucide-react';

type Notice = {
    id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    time: string;
    orderId: string | null;
};

export default function Notifications({ notifications = [] }: { notifications?: Notice[] }) {
    const page = usePage<{ notifications?: Notice[] }>();
    const items = notifications.length ? notifications : (page.props.notifications ?? []);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Notifications</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{items.filter((item) => !item.read).length} unread</p>
                </div>
                <button onClick={() => router.post('/notifications/read-all')} className="text-xs text-indigo-600 font-medium">Mark all read</button>
            </div>
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
                {items.length === 0 && <p className="px-5 py-6 text-sm text-muted-foreground">No notifications yet.</p>}
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => router.post(`/notifications/${item.id}/read`)}
                        className={`w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-muted/30 ${!item.read ? 'bg-indigo-50/40' : ''}`}
                    >
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-muted text-foreground">
                            {item.type === 'payment' ? <CreditCard size={16} /> : item.type === 'message' ? <MessageSquare size={16} /> : <Package size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.body}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
