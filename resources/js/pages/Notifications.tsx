import { Package, CreditCard, MessageSquare } from "lucide-react";
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { View } from '@/types';
import { dummyNotifications  } from '../../mockdata.ts';


export default function CustomerNotifications() {

    const [notifs, setNotifs] = useState(dummyNotifications);

    return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl text-black font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{notifs.filter(n => !n.read).length} unread notifications</p>
        </div>
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
