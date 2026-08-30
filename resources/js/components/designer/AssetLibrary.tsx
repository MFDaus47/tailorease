import { useState } from "react";

export interface GraphicAsset {
  id: string;
  name: string;
  category: string;
  icon: string;
  type: "emoji" | "svg";
  tags: string[];
}

const GRAPHIC_ASSETS: GraphicAsset[] = [
  // Mascots & Gaming
  { id: "g1", name: "Dragon Mascot", category: "Mascots", icon: "🐉", type: "emoji", tags: ["dragon", "beast", "esports"] },
  { id: "g2", name: "Tiger Power", category: "Mascots", icon: "🐅", type: "emoji", tags: ["tiger", "wild", "cat"] },
  { id: "g3", name: "Phoenix Fire", category: "Mascots", icon: "🦅", type: "emoji", tags: ["eagle", "bird", "wing"] },
  { id: "g4", name: "Skull Cyber", category: "Mascots", icon: "💀", type: "emoji", tags: ["skull", "gaming", "punk"] },
  { id: "g5", name: "Robot Mech", category: "Mascots", icon: "🤖", type: "emoji", tags: ["robot", "cyber", "future"] },
  { id: "g6", name: "Alien Tech", category: "Mascots", icon: "👾", type: "emoji", tags: ["space", "arcade", "retro"] },

  // Sports & Crests
  { id: "s1", name: "Gold Trophy", category: "Sports", icon: "🏆", type: "emoji", tags: ["trophy", "winner", "champion"] },
  { id: "s2", name: "Champion Medal", category: "Sports", icon: "🥇", type: "emoji", tags: ["medal", "gold", "first"] },
  { id: "s3", name: "Basketball", category: "Sports", icon: "🏀", type: "emoji", tags: ["ball", "hoops", "sports"] },
  { id: "s4", name: "Soccer Crest", category: "Sports", icon: "⚽", type: "emoji", tags: ["football", "soccer", "league"] },
  { id: "s5", name: "Boxing Glove", category: "Sports", icon: "🥊", type: "emoji", tags: ["boxing", "fight", "gym"] },
  { id: "s6", name: "Target Bullseye", category: "Sports", icon: "🎯", type: "emoji", tags: ["target", "dart", "aim"] },

  // Badges & Symbols
  { id: "b1", name: "Gold Star", category: "Badges", icon: "⭐", type: "emoji", tags: ["star", "badge", "rating"] },
  { id: "b2", name: "Royal Crown", category: "Badges", icon: "👑", type: "emoji", tags: ["king", "queen", "luxury"] },
  { id: "b3", name: "Diamond Sparkle", category: "Badges", icon: "💎", type: "emoji", tags: ["gem", "diamond", "shine"] },
  { id: "b4", name: "Fire Flame", category: "Badges", icon: "🔥", type: "emoji", tags: ["fire", "hot", "blaze"] },
  { id: "b5", name: "Lightning Bolt", category: "Badges", icon: "⚡", type: "emoji", tags: ["flash", "electric", "power"] },
  { id: "b6", name: "Shield Emblem", category: "Badges", icon: "🛡️", type: "emoji", tags: ["shield", "defense", "security"] },

  // Vintage & Streetwear
  { id: "v1", name: "Guitar Rock", category: "Streetwear", icon: "🎸", type: "emoji", tags: ["music", "rock", "band"] },
  { id: "v2", name: "Cassette Tape", category: "Streetwear", icon: "📼", type: "emoji", tags: ["retro", "80s", "90s"] },
  { id: "v3", name: "Skateboard", category: "Streetwear", icon: "🛹", type: "emoji", tags: ["skate", "street", "urban"] },
  { id: "v4", name: "Vinyl Record", category: "Streetwear", icon: "💿", type: "emoji", tags: ["music", "dj", "audio"] },
  { id: "v5", name: "Spray Paint", category: "Streetwear", icon: "🎨", type: "emoji", tags: ["art", "graffiti", "urban"] },
  { id: "v6", name: "Peace Hand", category: "Streetwear", icon: "✌️", type: "emoji", tags: ["peace", "vibe", "hand"] },

  // Nature & Outdoors
  { id: "n1", name: "Mountain Peak", category: "Nature", icon: "🏔️", type: "emoji", tags: ["mountain", "hiking", "adventure"] },
  { id: "n2", name: "Sun Burst", category: "Nature", icon: "☀️", type: "emoji", tags: ["sun", "summer", "bright"] },
  { id: "n3", name: "Palm Tree", category: "Nature", icon: "🌴", type: "emoji", tags: ["beach", "tropical", "summer"] },
  { id: "n4", name: "Ocean Wave", category: "Nature", icon: "🌊", type: "emoji", tags: ["surf", "water", "sea"] },
  { id: "n5", name: "Camping Tent", category: "Nature", icon: "⛺", type: "emoji", tags: ["camp", "outdoor", "wild"] },
  { id: "n6", name: "Compass Rose", category: "Nature", icon: "🧭", type: "emoji", tags: ["compass", "explore", "nav"] },
];

const PRO_TEMPLATES = [
  { id: "esports", name: "Esports Champions", desc: "Bold shield & crown mascot logo", preview: "🏆", tag: "HOT" },
  { id: "varsity", name: "Varsity Athletic 98", desc: "Classic arched collegiate lettering", preview: "🎓", tag: "POPULAR" },
  { id: "cyberpunk", name: "Cyberpunk 2077", desc: "Futuristic neon badge & glow text", preview: "⚡", tag: "NEW" },
  { id: "vintage", name: "Wild Explorer", desc: "Retro circular mountain emblem", preview: "🎯", tag: "CLASSIC" },
];

interface AssetLibraryProps {
  onAddSticker: (emoji: string) => void;
  onLoadTemplate: (templateKey: string) => void;
}

export default function AssetLibrary({ onAddSticker, onLoadTemplate }: AssetLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Mascots", "Sports", "Badges", "Streetwear", "Nature"];

  const filteredAssets = GRAPHIC_ASSETS.filter((asset) => {
    const matchesCat = activeCategory === "All" || asset.category === activeCategory;
    const matchesQuery =
      searchQuery === "" ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="asset-library-wrapper flex flex-col gap-4">
      {/* ── Search Bar ── */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search graphics & badges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Full Templates Section ── */}
      <div>
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">
          Pro 1-Click Templates
        </span>
        <div className="grid grid-cols-2 gap-2">
          {PRO_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onLoadTemplate(tpl.id)}
              className="flex flex-col items-start p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all text-left group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-lg">{tpl.preview}</span>
                <span className="text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  {tpl.tag}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                {tpl.name}
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{tpl.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Graphics Asset Library ── */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Vector Graphics & Art
        </span>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-4 gap-2 mt-2 max-h-56 overflow-y-auto pr-1">
          {filteredAssets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onAddSticker(asset.icon)}
              title={asset.name}
              className="aspect-square flex flex-col items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-indigo-500/40 hover:scale-105 active:scale-95 transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{asset.icon}</span>
              <span className="text-[9px] font-medium text-slate-400 truncate w-full text-center mt-1">
                {asset.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
