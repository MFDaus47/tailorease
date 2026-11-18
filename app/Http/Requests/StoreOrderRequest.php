<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Top-level summary fields (derived from items for backward compat)
            'product_id' => 'nullable|string',
            'product_name' => 'required|string|max:255',
            'order_name' => 'nullable|string|max:80',
            'sizes' => 'required|array|min:1',
            'total_quantity' => 'required|integer|min:1',
            'total' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'remaining_balance' => 'nullable|numeric|min:0',
            'due_date' => 'required|date|after:today',
            'notes' => 'nullable|string',
            'has_design' => 'boolean',
            'design_id' => 'nullable|string',
            'design_file' => 'nullable|file|max:10240',
            'design_file_path' => 'nullable|string',

            // Multi-product items array
            'items' => 'nullable|array',
            'items.*.product_id' => 'nullable|string',
            'items.*.product_name' => 'required_with:items|string|max:255',
            'items.*.sizes' => 'required_with:items|array|min:1',
            'items.*.total_quantity' => 'required_with:items|integer|min:1',
            'items.*.base_price' => 'required_with:items|numeric|min:0',
            'items.*.subtotal' => 'required_with:items|numeric|min:0',
        ];
    }
}
