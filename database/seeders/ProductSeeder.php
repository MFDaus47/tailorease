<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Collarless T-Shirt Short Sleeve',
                'description' => 'Hand-crafted dress shirt tailored to your exact measurements with premium Egyptian cotton.',
                'category' => 'Collarless',
                'image_path' => '/products-images/Collarless-shirt-short-sleeve.jpg',
                'base_price' => 35,
                'available' => 1,
                'rating' => 4.9,
            ],
            [
                'name' => 'Collared Retro',
                'description' => 'Single-breasted suit jacket with full canvas construction and hand-stitched lapels.',
                'category' => 'Shirts',
                'image_path' => '/products-images/Collared-retro.jpg',
                'base_price' => 45,
                'available' => 1,
                'rating' => 4.8,
            ],
            [
                'name' => 'V-Neck NFL',
                'description' => 'Perfectly fitted trousers with a clean silhouette, available in wool, cotton, and linen.',
                'category' => 'V-Neck',
                'image_path' => '/products-images/Vneck-nfl.jpg',
                'base_price' => 45,
                'available' => 1,
                'rating' => 4.7,
            ],
            [
                'name' => 'Collared Polo',
                'description' => 'Floor-length evening gown with custom embellishments and silhouette design.',
                'category' => 'Collared',
                'image_path' => '/products-images/Collar-polo.jpg',
                'base_price' => 35,
                'available' => 1,
                'rating' => 5.0,
            ],
            [
                'name' => 'Muslimah',
                'description' => 'Breathable linen kurta with hand-embroidered collar and cuff detailing.',
                'category' => 'Muslimah',
                'image_path' => '/products-images/Muslimah.jpg',
                'base_price' => 35,
                'available' => 1,
                'rating' => 4.6,
            ],
            [
                'name' => 'Tailored Blazer',
                'description' => 'Smart casual blazer with structured shoulders and clean lines for modern professionals.',
                'category' => 'Suits',
                'image_path' => 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=280&fit=crop&auto=format',
                'base_price' => 240,
                'available' => 0,
                'rating' => 4.7,
            ],
        ];

        foreach($products as $product) {
            Product::updateOrCreate(
                [
                    'name' => $product['name']
                ],
                $product
            );
        }
    }
}
