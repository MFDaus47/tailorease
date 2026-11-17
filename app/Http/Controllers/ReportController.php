<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $start = now()->startOfMonth()->subMonths(11);
        $orders = Order::query()
            ->where('created_at', '>=', $start)
            ->get();

        $months = [];
        $products = [];

        for ($i = 0; $i < 12; $i++) {
            $month = (clone $start)->addMonths($i);
            $key = $month->format('Y-m');
            $months[$key] = [
                'key' => $key,
                'month' => $month->format('M'),
                'year' => (int) $month->format('Y'),
                'revenue' => 0.0,
                'orders' => 0,
                'completed' => 0,
                'rejected' => 0,
            ];
        }

        foreach ($orders as $order) {
            $created = $order->created_at instanceof Carbon ? $order->created_at : Carbon::parse($order->created_at);
            $key = $created->format('Y-m');

            if (! isset($months[$key])) {
                continue;
            }

            $months[$key]['orders']++;

            if ($order->status !== 'rejected') {
                $months[$key]['revenue'] += (float) $order->total;
            }

            if ($order->status === 'completed') {
                $months[$key]['completed']++;
            }

            if ($order->status === 'rejected') {
                $months[$key]['rejected']++;
            }

            $items = is_array($order->items) && count($order->items) > 0
                ? $order->items
                : [[
                    'product_name' => $order->product_name,
                    'total_quantity' => $order->total_quantity,
                    'subtotal' => $order->total,
                ]];

            foreach ($items as $item) {
                $name = (string) ($item['product_name'] ?? 'Unknown');
                $products[$key][$name]['name'] = $name;
                $products[$key][$name]['orders'] = ($products[$key][$name]['orders'] ?? 0) + (int) ($item['total_quantity'] ?? 1);
                $products[$key][$name]['revenue'] = ($products[$key][$name]['revenue'] ?? 0) + (float) ($item['subtotal'] ?? 0);
            }
        }

        $productMonths = [];

        foreach ($products as $key => $rows) {
            foreach ($rows as $row) {
                $productMonths[] = [
                    'key' => $key,
                    'name' => $row['name'],
                    'orders' => $row['orders'],
                    'revenue' => $row['revenue'],
                ];
            }
        }

        return Inertia::render('Reports', [
            'months' => array_values($months),
            'productMonths' => $productMonths,
        ]);
    }
}
