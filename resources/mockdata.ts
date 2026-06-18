export type Notifications = {
    id: string;
    message: string;
    body: string;
    time: string;
    read: boolean;
    type: string;
}

export const dummyNotifications = [
  { id: "n1", title: "Order ORD-2412 received", body: "Rosa Garcia placed a new order for Linen Summer Kurta.", time: "2 min ago", read: false, type: "order" },
  { id: "n2", title: "Payment confirmed", body: "James Reyes paid the remaining balance for ORD-2398.", time: "1 hr ago", read: false, type: "payment" },
  { id: "n3", title: "Order ORD-2385 ready", body: "Ana Cruz's evening gown is ready for collection.", time: "3 hrs ago", read: true, type: "order" },
  { id: "n4", title: "New message", body: "Maria Santos sent a message regarding ORD-2401.", time: "Yesterday", read: true, type: "message" },
];
