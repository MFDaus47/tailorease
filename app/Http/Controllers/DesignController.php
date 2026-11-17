<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Sticker;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DesignController extends Controller
{
    public function editor(Request $request): Response
    {
        $design = $this->findReadable($request, $request->query('design'));

        $stickers = Sticker::query()
            ->where('active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->map(fn (Sticker $sticker) => ProductController::presentSticker($sticker))
            ->all();

        return Inertia::render('DesignerPage', [
            'stickers' => $stickers,
            'design' => $design ? self::present($design) : null,
            'returnTo' => $this->safeReturn($request->query('return')),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'id' => ['nullable', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'product_type' => ['required', 'string', 'max:50'],
            'shirt_color' => ['required', 'string', 'max:20'],
            'elements' => ['required', 'array'],
            'preview' => ['required', 'string'],
            'order_id' => ['nullable', 'string'],
            'return' => ['nullable', 'string'],
        ]);

        $previewPath = $this->storePreview($data['preview']);
        $userId = (string) $request->user()->id;
        $design = null;

        if (! empty($data['id'])) {
            $design = Design::query()->find($data['id']);

            if ($design && (string) $design->user_id !== $userId && $request->user()->getAttribute('role') !== 'tailor') {
                abort(403);
            }
        }

        $payload = [
            'user_id' => $design?->user_id ?: $userId,
            'order_id' => $data['order_id'] ?? $design?->order_id,
            'name' => $data['name'],
            'product_type' => $data['product_type'],
            'shirt_color' => $data['shirt_color'],
            'elements' => $data['elements'],
            'preview_path' => $previewPath,
        ];

        if ($design) {
            $design->update($payload);
        } else {
            $design = Design::create($payload);
        }

        $return = $this->safeReturn($data['return'] ?? null);
        $separator = str_contains($return, '?') ? '&' : '?';

        return redirect($return.$separator.'design='.$design->id)
            ->with('success', 'Design saved.');
    }

    /**
     * @return array<string, mixed>
     */
    public static function present(Design $design): array
    {
        return [
            'id' => (string) $design->id,
            'name' => (string) $design->name,
            'productType' => (string) $design->product_type,
            'shirtColor' => (string) $design->shirt_color,
            'elements' => $design->elements ?? [],
            'preview' => (string) $design->preview_path,
            'orderId' => $design->order_id ? (string) $design->order_id : null,
        ];
    }

    private function findReadable(Request $request, mixed $id): ?Design
    {
        if (! is_string($id) || $id === '') {
            return null;
        }

        $design = Design::query()->find($id);

        if (! $design) {
            return null;
        }

        $owns = (string) $design->user_id === (string) $request->user()->id;
        $tailor = $request->user()->getAttribute('role') === 'tailor';

        abort_unless($owns || $tailor, 403);

        return $design;
    }

    private function storePreview(string $dataUrl): string
    {
        if (! preg_match('#^data:image/(png|jpeg|jpg);base64,#', $dataUrl, $matches)) {
            abort(422, 'Preview must be a PNG or JPEG.');
        }

        $raw = base64_decode(substr($dataUrl, (int) strpos($dataUrl, ',') + 1), true);

        if ($raw === false) {
            abort(422, 'Preview could not be read.');
        }

        $extension = $matches[1] === 'png' ? 'png' : 'jpg';
        $path = 'designs/'.Str::uuid().'.'.$extension;
        Storage::disk('public')->put($path, $raw);

        return Storage::disk('public')->url($path);
    }

    private function safeReturn(mixed $return): string
    {
        if (! is_string($return) || ! str_starts_with($return, '/') || str_starts_with($return, '//')) {
            return '/order-form';
        }

        $path = parse_url($return, PHP_URL_PATH) ?: '/order-form';
        $query = parse_url($return, PHP_URL_QUERY);
        parse_str(is_string($query) ? $query : '', $params);
        unset($params['design']);

        $rebuilt = $path;

        if ($params !== []) {
            $rebuilt .= '?'.http_build_query($params);
        }

        return $rebuilt;
    }
}
