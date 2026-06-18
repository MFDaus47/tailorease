import { router } from '@inertiajs/react';
import { Search, Star } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { View } from '@/types';
// 2. Imported dummyCategories, dummyProducts, and Product type definition
import { dummyCategories, dummyProducts } from '../../mockdata';


export default function ApparelCatalog({}) {
    const [search, setSearch] = useState("");
    const categories = dummyCategories;
    const [selectedCategory, setSelectedCategory] = useState("All");

    // 3. Restored the filtering logic using dummyProducts and your updated state variable name
    const filtered = dummyProducts.filter(p =>
        (selectedCategory === "All" || p.category === selectedCategory) &&
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
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-card rounded-lg border border-border focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>
                <div className="flex items-center gap-1.5 bg-card rounded-lg border border-border p-1">
                    {categories.map((cat, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedCategory(cat.categoryName)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedCategory === cat.categoryName ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {cat.categoryName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(product => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer">
                        <div className="relative overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-90 object-top group-hover:scale-105 transition-transform duration-300 bg-slate-100" />
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
                                    <span className="text-lg font-bold text-foreground">RM{product.basePrice}</span>
                                    <span className="text-xs text-muted-foreground ml-1">base price</span>
                                </div>
                                <button
                                    disabled={!product.available}
                                    onClick={() => router.visit(`/order-form?product=${product.id}`)}
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
