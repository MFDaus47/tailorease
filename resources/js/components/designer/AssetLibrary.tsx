import { useState } from "react";

export type LibrarySticker = {
  id: string;
  name: string;
  slug: string;
  category: string;
  tags: string[];
  svg: string;
};

const PRO_TEMPLATES = [
  { id: "esports", name: "Esports Champions", desc: "Bold shield and crown", tag: "HOT" },
  { id: "varsity", name: "Varsity Athletic 98", desc: "Arched collegiate lettering", tag: "POPULAR" },
  { id: "cyberpunk", name: "Cyber City", desc: "Badge and glow text", tag: "NEW" },
  { id: "vintage", name: "Wild Explorer", desc: "Circular target emblem", tag: "CLASSIC" },
];

interface AssetLibraryProps {
  stickers: LibrarySticker[];
  onAddSticker: (sticker: { id: string; name: string; svg: string }) => void;
  onLoadTemplate: (templateKey: string) => void;
}

export default function AssetLibrary({ stickers, onAddSticker, onLoadTemplate }: AssetLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", ...Array.from(new Set(stickers.map((sticker) => sticker.category)))];

  const filteredAssets = stickers.filter((asset) => {
    const matchesCat = activeCategory === "All" || asset.category === activeCategory;
    const matchesQuery =
      searchQuery === "" ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="asset-library-wrapper flex flex-col gap-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search graphics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
      </div>

      <div>
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">
          Templates
        </span>
        <div className="grid grid-cols-2 gap-2">
          {PRO_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onLoadTemplate(tpl.id)}
              className="flex flex-col items-start p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all text-left group"
            >
              <div className="flex items-center justify-between w-full mb-1">
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

      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Stickers
        </span>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2 max-h-56 overflow-y-auto pr-1">
          {filteredAssets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onAddSticker(asset)}
              title={asset.name}
              className="aspect-square flex flex-col items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-indigo-500/40 transition-all"
            >
              <img
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(asset.svg)}`}
                alt={asset.name}
                className="w-8 h-8 object-contain"
              />
              <span className="text-[9px] font-medium text-slate-400 truncate w-full text-center mt-1">
                {asset.name}
              </span>
            </button>
          ))}
          {filteredAssets.length === 0 && (
            <p className="col-span-4 text-[11px] text-slate-500">No stickers in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
}
