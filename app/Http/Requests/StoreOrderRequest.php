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
            'product_id' => 'nullable|string',
            'product_name' => 'required|string|max:255',
            'sizes' => 'required|array|min:1',
            'total_quantity' => 'required|integer|min:1',
            'total' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'remaining_balance' => 'nullable|numeric|min:0',
            'due_date' => 'required|date|after:today',
            'notes' => 'nullable|string',
            'has_design' => 'boolean',
            'design_file_path' => 'nullable|string',
        ];
    }
}