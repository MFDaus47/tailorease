<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sticker;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function catalog(): Response
    {
        $products = Product::query()
            ->available()
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product) => self::present($product))
            ->all();

        return Inertia::render('ApparelCatalog', [
            'products' => $products,
        ]);
    }

    public function manage(): Response
    {
        $products = Product::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product) => self::present($product))
            ->all();

        $stickers = Sticker::query()
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->map(fn (Sticker $sticker) => self::presentSticker($sticker))
            ->all();

        return Inertia::render('ManageCatalog', [
            'products' => $products,
            'stickers' => $stickers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $product = Product::create($this->validated($request));

        return redirect()
            ->route('manage-catalog')
            ->with('success', "{$product->name} added to the catalog.");
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $product->update($this->validated($request, $product));

        return redirect()
            ->route('manage-catalog')
            ->with('success', 'Product updated.');
    }

    public function availability(Product $product): RedirectResponse
    {
        $product->update(['available' => ! $product->available]);

        return back()->with('success', 'Availability updated.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect()
            ->route('manage-catalog')
            ->with('success', 'Product removed.');
    }

    /**
     * @return array<string, mixed>
     */
    public static function present(Product $product): array
    {
        return [
            'id' => (string) $product->id,
            'name' => (string) $product->name,
            'description' => (string) ($product->description ?? ''),
            'category' => (string) $product->category,
            'image' => (string) ($product->image_path ?? ''),
            'basePrice' => (int) $product->base_price,
            'depositRate' => (float) ($product->deposit_rate ?? 0.5),
            'available' => (bool) $product->available,
            'rating' => (float) ($product->rating ?? 0),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function presentSticker(Sticker $sticker): array
    {
        return [
            'id' => (string) $sticker->id,
            'name' => (string) $sticker->name,
            'slug' => (string) $sticker->slug,
            'category' => (string) $sticker->category,
            'tags' => is_array($sticker->tags) ? array_values($sticker->tags) : [],
            'svg' => (string) $sticker->svg,
            'active' => (bool) $sticker->active,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Product $product = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'deposit_rate' => ['required', 'numeric', 'min:0', 'max:1'],
            'available' => ['required', 'boolean'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'image_path' => ['nullable', 'string', 'max:2048'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        $imagePath = $data['image_path'] ?? $product?->image_path;

        if ($request->hasFile('image')) {
            $stored = $request->file('image')->store('products', 'public');
            $imagePath = Storage::disk('public')->url($stored);
        }

        return [
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'category' => $data['category'],
            'base_price' => (int) round((float) $data['base_price']),
            'deposit_rate' => (float) $data['deposit_rate'],
            'available' => (bool) $data['available'],
            'rating' => (float) ($data['rating'] ?? $product?->rating ?? 0),
            'image_path' => $imagePath ?: '',
        ];
    }
}
