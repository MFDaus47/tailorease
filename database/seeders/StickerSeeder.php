<?php

namespace Database\Seeders;

use App\Models\Sticker;
use Illuminate\Database\Seeder;

class StickerSeeder extends Seeder
{
    public function run(): void
    {
        $stickers = [
            ['slug' => 'dragon', 'name' => 'Dragon', 'category' => 'Mascots', 'tags' => ['dragon', 'beast'], 'body' => '<path d="M8 40c8-16 14-18 22-10 2-8 10-14 18-10-4 6-2 12 2 16 6 2 10 8 8 14-8 2-14-2-18-8-6 6-14 8-22 4 2-2 4-6 2-8-4 2-8 2-12 2z"/>'],
            ['slug' => 'crown', 'name' => 'Crown', 'category' => 'Badges', 'tags' => ['crown', 'royal'], 'body' => '<path d="M8 44h48L50 18l-10 12L32 14 24 30 14 18z"/>'],
            ['slug' => 'trophy', 'name' => 'Trophy', 'category' => 'Sports', 'tags' => ['trophy', 'winner'], 'body' => '<path d="M18 10h28v16c0 8-6 14-14 14s-14-6-14-14zm6 30h16v6H24zm-4 8h24v4H20zM10 12h8v8c-4 0-8-2-8-8zm36 0h8c0 6-4 8-8 8z"/>'],
            ['slug' => 'flame', 'name' => 'Flame', 'category' => 'Badges', 'tags' => ['fire', 'hot'], 'body' => '<path d="M32 6c2 10-6 14-6 22 0 6 4 8 6 14 8-6 16-12 16-24 0-8-6-14-10-18-2 6-4 8-6 6z"/>'],
            ['slug' => 'target', 'name' => 'Target', 'category' => 'Sports', 'tags' => ['target', 'aim'], 'body' => '<circle cx="32" cy="32" r="22" fill="none" stroke="#111111" stroke-width="4"/><circle cx="32" cy="32" r="12" fill="none" stroke="#111111" stroke-width="4"/><circle cx="32" cy="32" r="4"/>'],
            ['slug' => 'star', 'name' => 'Star', 'category' => 'Badges', 'tags' => ['star', 'badge'], 'body' => '<path d="M32 6l6 16h16l-12 10 4 16-14-8-14 8 4-16L10 22h16z"/>'],
            ['slug' => 'bolt', 'name' => 'Bolt', 'category' => 'Badges', 'tags' => ['flash', 'power'], 'body' => '<path d="M36 4L14 36h14l-4 24 24-34H34z"/>'],
            ['slug' => 'shield', 'name' => 'Shield', 'category' => 'Badges', 'tags' => ['shield', 'defense'], 'body' => '<path d="M32 6l20 8v16c0 14-8 22-20 28C20 52 12 44 12 30V14z"/>'],
            ['slug' => 'guitar', 'name' => 'Guitar', 'category' => 'Streetwear', 'tags' => ['music', 'rock'], 'body' => '<path d="M40 6l6 6-8 8 4 4-10 10c-6 2-14 0-16-6s2-14 8-14l8-8z"/><circle cx="22" cy="44" r="4" fill="#ffffff"/>'],
            ['slug' => 'medal', 'name' => 'Medal', 'category' => 'Sports', 'tags' => ['medal', 'gold'], 'body' => '<path d="M24 6h6l2 14h-10zm10 0h6l-2 14H32z"/><circle cx="32" cy="40" r="14"/>'],
            ['slug' => 'mountain', 'name' => 'Mountain', 'category' => 'Nature', 'tags' => ['mountain', 'hike'], 'body' => '<path d="M4 50L24 16l10 16 6-8 20 26z"/>'],
            ['slug' => 'wave', 'name' => 'Wave', 'category' => 'Nature', 'tags' => ['surf', 'water'], 'body' => '<path d="M4 28c6 0 6 10 12 10s6-10 12-10 6 10 12 10 6-10 12-10 6 10 8 10v8H4z"/>'],
        ];

        foreach ($stickers as $sticker) {
            Sticker::updateOrCreate(
                ['slug' => $sticker['slug']],
                [
                    'name' => $sticker['name'],
                    'category' => $sticker['category'],
                    'tags' => $sticker['tags'],
                    'svg' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="#111111">'.$sticker['body'].'</svg>',
                    'active' => true,
                ],
            );
        }
    }
}
