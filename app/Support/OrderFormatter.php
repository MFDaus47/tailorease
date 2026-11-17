<?php

namespace App\Support;

use App\Models\Order;

class OrderFormatter
{
    public static function sizeLabel(mixed $sizes): string
    {
        if (! is_array($sizes) || count($sizes) === 0) {
            return 'N/A';
        }

        if (array_is_list($sizes)) {
            $label = implode(', ', array_filter($sizes));

            return $label !== '' ? $label : 'N/A';
        }

        $active = array_filter($sizes, fn ($quantity) => (int) $quantity > 0);
        $label = implode(', ', array_map(
            fn ($size, $quantity) => ((int) $quantity > 1) ? "{$size} ×{$quantity}" : (string) $size,
            array_keys($active),
            array_values($active),
        ));

        return $label !== '' ? $label : 'N/A';
    }

    public static function productSummary(Order $order): string
    {
        $items = $order->items;

        if (is_array($items) && count($items) > 1) {
            return implode(', ', array_map(
                fn ($item) => "{$item['product_name']} ({$item['total_quantity']} pcs)",
                $items,
            ));
        }

        return (string) $order->product_name;
    }

    public static function forCustomer(Order $order): array
    {
        $customer = $order->customer;

        return [
            'id' => (string) $order->id,
            'product' => self::productSummary($order),
            'customer_name' => $customer?->name ?? 'Unknown Customer',
            'customer_email' => $customer?->email ?? 'N/A',
            'quantity' => (int) $order->total_quantity,
            'size' => self::sizeLabel($order->sizes),
            'total' => (float) $order->total,
            'deposit' => (float) $order->deposit,
            'remaining' => (float) $order->remaining_balance,
            'due_date' => $order->due_date?->format('Y-m-d'),
            'deliveryDate' => $order->due_date?->format('M d, Y'),
            'date' => $order->created_at?->format('M d, Y') ?? '',
            'createdAt' => $order->created_at?->format('Y-m-d') ?? '',
            'status' => (string) $order->status,
            'notes' => $order->notes ?: null,
            'hasDesign' => (bool) $order->has_design,
            'designId' => $order->design_id ? (string) $order->design_id : null,
            'designPreview' => $order->design_file_path ?: null,
            'items' => $order->items ?? null,
        ];
    }

    public static function forTailor(Order $order): array
    {
        $customer = $order->customer;
        $nameParts = collect(explode(' ', trim((string) ($customer?->name ?? ''))))->filter()->values();
        $avatar = '??';

        if ($nameParts->count() === 1) {
            $avatar = strtoupper(substr((string) $nameParts->first(), 0, 2));
        } elseif ($nameParts->count() > 1) {
            $avatar = strtoupper(substr((string) $nameParts->get(0), 0, 1).substr((string) $nameParts->get(1), 0, 1));
        }

        return [
            'id' => (string) $order->id,
            'customer' => $customer?->name ?? 'Unknown Customer',
            'customerEmail' => $customer?->email ?? '',
            'avatar' => $avatar,
            'product' => self::productSummary($order),
            'productId' => (string) $order->product_id,
            'size' => self::sizeLabel($order->sizes),
            'quantity' => (int) $order->total_quantity,
            'total' => (float) $order->total,
            'deposit' => (float) $order->deposit,
            'remaining' => (float) $order->remaining_balance,
            'deliveryDate' => $order->due_date?->format('Y-m-d'),
            'date' => $order->created_at?->format('M d, Y') ?? '',
            'createdAt' => $order->created_at?->format('Y-m-d') ?? '',
            'status' => (string) $order->status,
            'notes' => $order->notes ?: null,
            'hasDesign' => (bool) $order->has_design,
            'designId' => $order->design_id ? (string) $order->design_id : null,
            'designPreview' => $order->design_file_path ?: null,
        ];
    }
}
