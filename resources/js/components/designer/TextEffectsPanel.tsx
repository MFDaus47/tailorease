import type { TextElement } from "../../types/designer";

interface TextEffectsPanelProps {
  element: TextElement;
  onUpdate: (id: string, updates: Partial<TextElement>) => void;
}

const TYPOGRAPHY_PRESETS = [
  { name: "Varsity", font: "Oswald", weight: "bold", transform: "uppercase", stroke: "#000000", strokeWidth: 1.5 },
  { name: "Cyber Neon", font: "Montserrat", weight: "bold", fill: "#38bdf8", shadowColor: "#38bdf8", shadowBlur: 10 },
  { name: "Bold Impact", font: "Bebas Neue", weight: "bold", transform: "uppercase", letterSpacing: 2 },
  { name: "Serif Luxury", font: "Playfair Display", fontStyle: "italic", fill: "#fbbf24" },
];

export default function TextEffectsPanel({ element, onUpdate }: TextEffectsPanelProps) {
  const el = element;

  return (
    <div className="text-effects-panel flex flex-col gap-3">
      {/* ── Preset Typography Styles ── */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Typography Style Presets
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {TYPOGRAPHY_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() =>
                onUpdate(el.id, {
                  fontFamily: preset.font,
                  fontWeight: (preset.weight as any) || el.fontWeight,
                  fontStyle: (preset.fontStyle as any) || el.fontStyle,
                  fill: preset.fill || el.fill,
                  stroke: preset.stroke || el.stroke,
                  strokeWidth: preset.strokeWidth ?? el.strokeWidth,
                  letterSpacing: preset.letterSpacing ?? el.letterSpacing,
                  textTransform: (preset.transform as any) || el.textTransform,
                })
              }
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-left text-xs font-semibold text-slate-200 transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Text Transform & Alignment ── */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">Uppercase</span>
        <button
          onClick={() =>
            onUpdate(el.id, {
              textTransform: el.textTransform === "uppercase" ? "none" : "uppercase",
              text: el.textTransform === "uppercase" ? el.text.toLowerCase() : el.text.toUpperCase(),
            })
          }
          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
            el.textTransform === "uppercase"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-400 border border-slate-800"
          }`}
        >
          AA
        </button>
      </div>

      {/* ── Text Stroke ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Stroke Outline</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={el.stroke || "#000000"}
              onChange={(e) => onUpdate(el.id, { stroke: e.target.value })}
              className="w-5 h-5 rounded border border-slate-700 bg-slate-900 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-300 w-6 text-right">
              {el.strokeWidth || 0}px
            </span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={el.strokeWidth || 0}
          onChange={(e) => onUpdate(el.id, { strokeWidth: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>

      {/* ── Text Drop Shadow ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Drop Shadow Glow</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={el.shadowColor || "#000000"}
              onChange={(e) => onUpdate(el.id, { shadowColor: e.target.value })}
              className="w-5 h-5 rounded border border-slate-700 bg-slate-900 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-300 w-6 text-right">
              {el.shadowBlur || 0}
            </span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={el.shadowBlur || 0}
          onChange={(e) => onUpdate(el.id, { shadowBlur: parseInt(e.target.value) })}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
