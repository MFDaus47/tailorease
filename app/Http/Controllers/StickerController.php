<?php

namespace App\Http\Controllers;

use App\Models\Sticker;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StickerController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        Sticker::create($this->validated($request));

        return redirect()
            ->route('manage-catalog')
            ->with('success', 'Sticker added.');
    }

    public function update(Request $request, Sticker $sticker): RedirectResponse
    {
        $sticker->update($this->validated($request, $sticker));

        return redirect()
            ->route('manage-catalog')
            ->with('success', 'Sticker updated.');
    }

    public function active(Sticker $sticker): RedirectResponse
    {
        $sticker->update(['active' => ! $sticker->active]);

        return back()->with('success', 'Sticker visibility updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Sticker $sticker = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100', Rule::unique('stickers', 'slug')->ignore($sticker?->id)],
            'category' => ['required', 'string', 'max:100'],
            'tags' => ['nullable', 'string', 'max:500'],
            'svg' => ['required', 'string', 'max:20000'],
            'active' => ['required', 'boolean'],
        ]);

        $svg = trim($data['svg']);

        if (! str_contains(strtolower($svg), '<svg') || str_contains(strtolower($svg), '<script')) {
            abort(422, 'Sticker must be an SVG without scripts.');
        }

        $tags = collect(explode(',', (string) ($data['tags'] ?? '')))
            ->map(fn ($tag) => trim($tag))
            ->filter()
            ->values()
            ->all();

        return [
            'name' => $data['name'],
            'slug' => ($data['slug'] ?? null) ?: Str::slug($data['name']),
            'category' => $data['category'],
            'tags' => $tags,
            'svg' => $svg,
            'active' => (bool) $data['active'],
        ];
    }
}
