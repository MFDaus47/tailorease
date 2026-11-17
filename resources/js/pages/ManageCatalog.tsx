import { router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    Plus, Edit2, Trash2, X, Search, Package
} from 'lucide-react';
import { Card } from '@/components/ui/card';

type Products = {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    depositRate?: number;
    description: string;
    available: boolean;
    image: string;
    rating: number;
};

type StickerRow = {
    id: string;
    name: string;
    slug: string;
    category: string;
    tags: string[];
    svg: string;
    active: boolean;
};

type ProductFormData = {
    name: string;
    category: string;
    basePrice: number;
    depositRate: number;
    description: string;
    available: boolean;
    image: string;
    rating: number;
    orders: number;
};

const emptyForm: ProductFormData = {
    name: '',
    category: 'Shirts',
    basePrice: 0,
    depositRate: 50,
    description: '',
    available: true,
    image: '',
    rating: 0,
    orders: 0,
};

export default function ManageCatalog() {
    const { props } = usePage<{ products?: Products[]; stickers?: StickerRow[] }>();
    const products = props.products ?? [];
    const stickers = props.stickers ?? [];

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [editProd, setEditProd] = useState<Products | null>(null);
    const [form, setForm] = useState<ProductFormData>(emptyForm);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [stickerForm, setStickerForm] = useState({ name: '', category: 'Badges', tags: '', svg: '', active: true });

    const categories = useMemo(() => {
        const names = Array.from(new Set(products.map(p => p.category)));
        return ['All', ...names.sort()];
    }, [products]);

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const resetForm = () => {
        setForm(emptyForm);
        setEditProd(null);
        setImagePreview(null);
        setImageFile(null);
    };

    const openAdd = () => {
        resetForm();
        setShowForm(true);
    };

    const openEdit = (prod: Products) => {
        setEditProd(prod);
        setForm({
            name: prod.name,
            category: prod.category,
            basePrice: prod.basePrice,
            depositRate: (prod as any).depositRate ? (prod as any).depositRate * 100 : 50,
            description: prod.description,
            available: prod.available,
            image: prod.image,
            rating: prod.rating,
            orders: 0,
        });
        setImagePreview(prod.image || null);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        resetForm();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: form.name,
            category: form.category,
            base_price: form.basePrice,
            deposit_rate: form.depositRate / 100,
            description: form.description,
            available: form.available,
            rating: form.rating || 0,
            image_path: form.image,
            image: imageFile,
        };

        const options = { forceFormData: true, onSuccess: handleCloseForm };

        if (editProd) {
            router.post(`/products/${editProd.id}`, { ...payload, _method: 'put' }, options);
        } else {
            router.post('/products', payload, options);
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm('Remove this product from the catalog?')) {
            return;
        }
        router.delete(`/products/${id}`);
    };

    const toggleAvailability = (prod: Products) => {
        router.post(`/products/${prod.id}/availability`);
    };

    const saveSticker = (event: React.FormEvent) => {
        event.preventDefault();
        router.post('/stickers', stickerForm, {
            onSuccess: () => setStickerForm({ name: '', category: 'Badges', tags: '', svg: '', active: true }),
        });
    };

    const updateForm = (field: keyof ProductFormData, value: string | number | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Manage Catalog</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Add, edit, and manage your apparel offerings.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={16} /> Add Product
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-card rounded-lg border border-border focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>
                <div className="flex items-center gap-1.5 bg-card rounded-lg border border-border p-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${categoryFilter === cat ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(prod => (
                    <Card key={prod.id} className="overflow-hidden">
                        <div className="relative">
                            <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-36 object-cover bg-slate-100"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/products-images/placeholder.jpg';
                                }}
                            />
                            <div className={`absolute top-2.5 right-2.5 px-2 py-1 rounded-full text-xs font-semibold ${prod.available ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"}`}>
                                {prod.available ? "Available" : "Unavailable"}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{prod.name}</p>
                                    <p className="text-xs text-muted-foreground">{prod.category}</p>
                                </div>
                                <span className="text-sm font-bold text-foreground">RM{prod.basePrice}</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{prod.description}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleAvailability(prod)}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${prod.available ? "border-slate-200 text-slate-600 hover:bg-slate-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}`}
                                >
                                    {prod.available ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                    onClick={() => openEdit(prod)}
                                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(prod.id)}
                                    className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-16 text-center">
                    <Package size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No products found</p>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleCloseForm} />
                    <div className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
                            <h3 className="text-base font-semibold text-foreground">{editProd ? "Edit Product" : "Add New Product"}</h3>
                            <button onClick={handleCloseForm} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-3">
                            {[{ label: "Product Name", placeholder: "e.g. Classic Dress Shirt", field: 'name' as const, type: 'text' },
                              { label: "Category", placeholder: "e.g. Shirts", field: 'category' as const, type: 'select', options: Array.from(new Set(['Shirts', 'Collarless', 'Collared', 'V-Neck', 'Muslimah', 'Suits', ...products.map(p => p.category)])) },
                              { label: "Base Price (RM)", placeholder: "0.00", field: 'basePrice' as const, type: 'number' },
                              { label: "Deposit Rate (%)", placeholder: "50", field: 'depositRate' as const, type: 'number' },
                            ].map(f => (
                                <div key={f.field}>
                                    <label className="text-xs font-semibold text-foreground block mb-1">{f.label}</label>
                                    {f.type === 'select' ? (
                                        <select
                                            value={form[f.field] as string}
                                            onChange={e => updateForm(f.field, e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all text-foreground"
                                        >
                                            {f.options!.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={f.type}
                                            value={form[f.field] as string | number}
                                            onChange={e => updateForm(f.field, f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                            placeholder={f.placeholder}
                                            className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all"
                                        />
                                    )}
                                </div>
                            ))}
                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => updateForm('description', e.target.value)}
                                    placeholder="Product description..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none resize-none placeholder:text-muted-foreground"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1">Product Image URL</label>
                                <input
                                    type="text"
                                    value={form.image}
                                    onChange={e => {
                                        updateForm('image', e.target.value);
                                        setImagePreview(e.target.value);
                                    }}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:border-indigo-300 focus:outline-none transition-all"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] ?? null;
                                        setImageFile(file);
                                        if (file) setImagePreview(URL.createObjectURL(file));
                                    }}
                                    className="mt-2 text-xs text-muted-foreground"
                                />
                                {imagePreview && (
                                    <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-border bg-slate-100">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="available-toggle"
                                    type="checkbox"
                                    checked={form.available}
                                    onChange={e => updateForm('available', e.target.checked)}
                                    className="accent-indigo-600"
                                />
                                <label htmlFor="available-toggle" className="text-xs font-semibold text-foreground">Available for orders</label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={handleCloseForm} className="flex-1 py-2.5 border border-border text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                                    {editProd ? "Save Changes" : "Add Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Card className="p-5 space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">Stickers</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">SVG artwork used by the designer. Inactive stickers stay on old designs but leave the library.</p>
                </div>
                <form onSubmit={saveSticker} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={stickerForm.name} onChange={(event) => setStickerForm({ ...stickerForm, name: event.target.value })} placeholder="Name" className="px-3 py-2 text-sm bg-muted rounded-lg border border-border" required />
                    <input value={stickerForm.category} onChange={(event) => setStickerForm({ ...stickerForm, category: event.target.value })} placeholder="Category" className="px-3 py-2 text-sm bg-muted rounded-lg border border-border" required />
                    <input value={stickerForm.tags} onChange={(event) => setStickerForm({ ...stickerForm, tags: event.target.value })} placeholder="Tags, comma separated" className="px-3 py-2 text-sm bg-muted rounded-lg border border-border md:col-span-2" />
                    <textarea value={stickerForm.svg} onChange={(event) => setStickerForm({ ...stickerForm, svg: event.target.value })} placeholder="Paste SVG markup" className="px-3 py-2 text-sm bg-muted rounded-lg border border-border md:col-span-2 min-h-24" required />
                    <button type="submit" className="md:col-span-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg">Add sticker</button>
                </form>
                <div className="divide-y divide-border">
                    {stickers.map((sticker) => (
                        <div key={sticker.id} className="flex items-center gap-3 py-2">
                            <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sticker.svg)}`} alt="" className="w-8 h-8" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{sticker.name}</p>
                                <p className="text-xs text-muted-foreground">{sticker.category} · {sticker.active ? 'Active' : 'Hidden'}</p>
                            </div>
                            <button onClick={() => router.post(`/stickers/${sticker.id}/active`)} className="text-xs text-indigo-600">{sticker.active ? 'Hide' : 'Show'}</button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
