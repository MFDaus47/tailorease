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

export type Categories = {
    categoryName: string;
}

export const dummyCategories = [
    {categoryName: "All"},
    {categoryName: "Collarless"},
    {categoryName: "Collared"},
    {categoryName: "V-Neck"},
    {categoryName: "Muslimah"},
    {categoryName: "Traditional"},
];

export type Products = {
    id: number | string;
    name: string;
    category: string;
    image: string;
    available: boolean;
    rating: number;
    description: string;
    basePrice: number;
    orders: number;
}

export const dummyProducts = [
    { id: "p1", name: "Collarless T-Shirt Short Sleeve", category: "Collarless", basePrice: 35, depositRate: 0.5, image: "/products-images/Collarless-shirt-short-sleeve.jpg", description: "Hand-crafted dress shirt tailored to your exact measurements with premium Egyptian cotton.", available: true, rating: 4.9, orders: 247 },
    { id: "p2", name: "Collared Retro", category: "Shirts", basePrice: 45, depositRate: 0.5, image: "/products-images/Collared-retro.jpg", description: "Single-breasted suit jacket with full canvas construction and hand-stitched lapels.", available: true, rating: 4.8, orders: 183 },
    { id: "p3", name: "V-Neck NFL", category: "V-Neck", basePrice: 45, depositRate: 0.5, image: "/products-images/Vneck-nfl.jpg", description: "Perfectly fitted trousers with a clean silhouette, available in wool, cotton, and linen.", available: true, rating: 4.7, orders: 312 },
    { id: "p4", name: "Collared Polo", category: "Collared", basePrice: 35, depositRate: 0.5, image: "/products-images/Collar-polo.jpg", description: "Floor-length evening gown with custom embellishments and silhouette design.", available: true, rating: 5.0, orders: 94 },
    { id: "p5", name: "Muslimah", category: "Muslimah", basePrice: 35, depositRate: 0.5, image: "/products-images/Muslimah.jpg", description: "Breathable linen kurta with hand-embroidered collar and cuff detailing.", available: true, rating: 4.6, orders: 156 },
    { id: "p6", name: "Tailored Blazer", category: "Suits", basePrice: 240, depositRate: 0.5, image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=280&fit=crop&auto=format", description: "Smart casual blazer with structured shoulders and clean lines for modern professionals.", available: false, rating: 4.7, orders: 88 },
];

type OrderStatus =
  | "pending" | "accepted" | "deposit_paid" | "in_production"
  | "quality_check" | "ready" | "completed" | "rejected";

export const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending:       { label: "Pending Review",       color: "text-amber-700",   bg: "bg-amber-50 border border-amber-200",   dot: "bg-amber-500" },
  accepted:      { label: "Accepted",             color: "text-blue-700",    bg: "bg-blue-50 border border-blue-200",     dot: "bg-blue-500" },
  deposit_paid:  { label: "Deposit Paid",         color: "text-indigo-700",  bg: "bg-indigo-50 border border-indigo-200", dot: "bg-indigo-500" },
  in_production: { label: "In Production",        color: "text-violet-700",  bg: "bg-violet-50 border border-violet-200", dot: "bg-violet-500" },
  quality_check: { label: "Quality Check",        color: "text-cyan-700",    bg: "bg-cyan-50 border border-cyan-200",     dot: "bg-cyan-500" },
  ready:         { label: "Ready for Collection", color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200", dot: "bg-emerald-500" },
  completed:     { label: "Completed",            color: "text-slate-700",   bg: "bg-slate-100 border border-slate-200",  dot: "bg-slate-500" },
  rejected:      { label: "Rejected",             color: "text-red-700",     bg: "bg-red-50 border border-red-200",       dot: "bg-red-500" },
};

export interface Message { id: string; sender: "customer" | "tailor"; text: string; time: string; }

export interface Order {
  id: string; customer: string; customerEmail: string; avatar: string;
  product: string; productId: string; size: string; quantity: number;
  total: number; deposit: number; status: OrderStatus;
  date: string; deliveryDate: string; notes: string;
  hasDesign: boolean; messages: Message[];
}


export const MOCK_ORDERS: Order[] = [
  { id: "ORD-2401", customer: "Maria Santos", customerEmail: "maria@example.com", avatar: "MS", product: "Bespoke Dress Shirt", productId: "p1", size: "M", quantity: 2, total: 170, deposit: 85, status: "in_production", date: "2026-05-28", deliveryDate: "2026-06-28", notes: "Please use the blue fabric sample. No breast pocket.", hasDesign: true, messages: [{ id: "m1", sender: "tailor", text: "Your order has been accepted! We'll begin production shortly.", time: "May 29, 09:15" }, { id: "m2", sender: "customer", text: "Thank you! Can I confirm the fabric choice?", time: "May 29, 14:30" }, { id: "m3", sender: "tailor", text: "Blue Egyptian cotton confirmed. Production starts Monday.", time: "May 30, 10:00" }] },
  { id: "ORD-2398", customer: "James Reyes", customerEmail: "james@example.com", avatar: "JR", product: "Classic Suit Jacket", productId: "p2", size: "L", quantity: 1, total: 320, deposit: 160, status: "quality_check", date: "2026-05-20", deliveryDate: "2026-06-20", notes: "Two-button, slim fit. Charcoal grey preferred.", hasDesign: false, messages: [{ id: "m1", sender: "tailor", text: "Production complete. Moving to quality check now.", time: "Jun 2, 11:00" }] },
  { id: "ORD-2385", customer: "Ana Cruz", customerEmail: "ana@example.com", avatar: "AC", product: "Formal Evening Gown", productId: "p4", size: "S", quantity: 1, total: 480, deposit: 288, status: "ready", date: "2026-05-10", deliveryDate: "2026-07-05", notes: "For a wedding. Navy blue with floral embroidery.", hasDesign: true, messages: [] },
  { id: "ORD-2370", customer: "Carlos Tan", customerEmail: "carlos@example.com", avatar: "CT", product: "Tailored Trousers", productId: "p3", size: "32x30", quantity: 3, total: 435, deposit: 218, status: "completed", date: "2026-04-25", deliveryDate: "2026-05-15", notes: "Wool blend for office wear.", hasDesign: false, messages: [] },
  { id: "ORD-2412", customer: "Rosa Garcia", customerEmail: "rosa@example.com", avatar: "RG", product: "Linen Summer Kurta", productId: "p5", size: "XL", quantity: 1, total: 95, deposit: 38, status: "pending", date: "2026-06-10", deliveryDate: "2026-06-22", notes: "White linen, mandarin collar.", hasDesign: false, messages: [] },
  { id: "ORD-2415", customer: "Paulo Dela Cruz", customerEmail: "paulo@example.com", avatar: "PD", product: "Bespoke Dress Shirt", productId: "p1", size: "XL", quantity: 1, total: 85, deposit: 43, status: "accepted", date: "2026-06-12", deliveryDate: "2026-07-10", notes: "White with French cuffs.", hasDesign: false, messages: [] },
  { id: "ORD-2416", customer: "Luisa Ramos", customerEmail: "luisa@example.com", avatar: "LR", product: "Formal Evening Gown", productId: "p4", size: "M", quantity: 1, total: 480, deposit: 288, status: "pending", date: "2026-06-13", deliveryDate: "2026-06-18", notes: "Pearl white, A-line silhouette.", hasDesign: true, messages: [] },
];
