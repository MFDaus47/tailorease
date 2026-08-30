import { useState, useRef } from "react";
import AssetLibrary from "./AssetLibrary";
import type { ShapeType } from "../../types/designer";

const SHIRT_COLOR_GROUPS = [
  {
    name: "Classic",
    colors: [
      { hex: "#1a1a2e", label: "Midnight Navy" },
      { hex: "#ffffff", label: "Pure White" },
      { hex: "#2c3e50", label: "Charcoal" },
      { hex: "#7f8c8d", label: "Heather Gray" },
    ],
  },
  {
    name: "Vibrant",
    colors: [
      { hex: "#c0392b", label: "Crimson Red" },
      { hex: "#2980b9", label: "Royal Blue" },
      { hex: "#27ae60", label: "Emerald Green" },
      { hex: "#8e44ad", label: "Deep Purple" },
    ],
  },
  {
    name: "Pastel & Warm",
    colors: [
      { hex: "#e67e22", label: "Sunset Orange" },
      { hex: "#f39c12", label: "Golden Yellow" },
      { hex: "#16a085", label: "Teal" },
      { hex: "#d35400", label: "Burnt Sienna" },
    ],
  },
];

interface LeftSidebarProps {
  shirtColor: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onColorChange: (color: string) => void;
  onAddText: (text?: string) => void;
  onAddShape: (shape: ShapeType) => void;
  onAddSticker: (emoji: string) => void;
  onAddImage: (src: string, name: string) => void;
  onAddLine?: () => void;
  onLoadTemplate?: (templateType: string) => void;
}

export default function LeftSidebar({
  shirtColor,
  isCollapsed = false,
  onToggleCollapse,
  onColorChange,
  onAddText,
  onAddShape,
  onAddSticker,
  onAddImage,
  onAddLine,
  onLoadTemplate,
}: LeftSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeNavTab, setActiveNavTab] = useState<"tools" | "assets" | "color">("assets");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      onAddImage(src, file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Collapsed Icon Strip Mode ──
  if (isCollapsed) {
    return (
      <aside className="designer-sidebar-left w-14 flex-shrink-0 flex flex-col items-center py-3 bg-slate-950 border-r border-slate-800 transition-all duration-300">
        <button
          onClick={onToggleCollapse}
          className="w-9 h-9 mb-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center border border-slate-800 transition-all"
          title="Expand Left Sidebar"
        >
          ▶
        </button>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onToggleCollapse?.();
              setActiveNavTab("assets");
            }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all ${
              activeNavTab === "assets" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
            title="Graphics & Assets"
          >
            🎨
          </button>

          <button
            onClick={() => {
              onToggleCollapse?.();
              setActiveNavTab("tools");
            }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all ${
              activeNavTab === "tools" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
            title="Basic Tools"
          >
            🛠️
          </button>

          <button
            onClick={() => {
              onToggleCollapse?.();
              setActiveNavTab("color");
            }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all ${
              activeNavTab === "color" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
            title="Shirt Colors"
          >
            👕
          </button>
        </div>
      </aside>
    );
  }

  // ── Full Expanded Sidebar ──
  return (
    <aside className="designer-sidebar-left w-72 flex-shrink-0 flex flex-col h-full bg-slate-950 border-r border-slate-800 transition-all duration-300">
      {/* ── Top Navigation Mode Tabs & Collapse Toggle ── */}
      <div className="flex items-center justify-between border-b border-slate-800 p-2 bg-slate-900/50 gap-1">
        <div className="flex flex-1 gap-1">
          <button
            onClick={() => setActiveNavTab("assets")}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              activeNavTab === "assets"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            🎨 Graphics
          </button>
          <button
            onClick={() => setActiveNavTab("tools")}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              activeNavTab === "tools"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            🛠️ Tools
          </button>
          <button
            onClick={() => setActiveNavTab("color")}
            className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              activeNavTab === "color"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
            title="Shirt Color"
          >
            👕
          </button>
        </div>

        {/* Collapse button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center border border-slate-800 transition-all"
            title="Collapse Sidebar for extra space"
          >
            ◀
          </button>
        )}
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeNavTab === "assets" && (
          <AssetLibrary
            onAddSticker={onAddSticker}
            onLoadTemplate={(key) => onLoadTemplate?.(key)}
          />
        )}

        {activeNavTab === "tools" && (
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Add Elements
              </span>
              <div className="tool-grid">
                <button className="tool-btn" onClick={() => onAddText()} title="Add text element">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
                  </svg>
                  <span>Text</span>
                </button>

                <button className="tool-btn" onClick={() => fileInputRef.current?.click()} title="Upload custom image">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Image</span>
                </button>

                <button className="tool-btn" onClick={() => onAddShape("rect")} title="Add rectangle shape">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                  </svg>
                  <span>Rectangle</span>
                </button>

                <button className="tool-btn" onClick={() => onAddShape("circle")} title="Add circle shape">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="9"/>
                  </svg>
                  <span>Circle</span>
                </button>

                <button className="tool-btn" onClick={() => onAddShape("star")} title="Add star shape">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span>Star</span>
                </button>

                <button className="tool-btn" onClick={() => onAddShape("triangle")} title="Add triangle shape">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polygon points="12 3 22 20 2 20"/>
                  </svg>
                  <span>Triangle</span>
                </button>

                {onAddLine && (
                  <button className="tool-btn" onClick={onAddLine} title="Add line">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <line x1="4" y1="12" x2="20" y2="12"/>
                    </svg>
                    <span>Line</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload image file"
              />
            </div>
          </div>
        )}

        {activeNavTab === "color" && (
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Apparel Base Color
            </span>

            {SHIRT_COLOR_GROUPS.map((group) => (
              <div key={group.name} className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-slate-400">{group.name}</span>
                <div className="color-grid">
                  {group.colors.map((c) => (
                    <button
                      key={c.hex}
                      className={`swatch-btn ${shirtColor === c.hex ? "swatch-active" : ""}`}
                      style={{ background: c.hex }}
                      title={c.label}
                      onClick={() => onColorChange(c.hex)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="custom-color-row pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300" htmlFor="custom-shirt-color">
                Custom Color Picker
              </label>
              <input
                id="custom-shirt-color"
                type="color"
                value={shirtColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="color-picker-input"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
