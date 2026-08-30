import { useState } from "react";
import AlignmentToolbar from "./AlignmentToolbar";
import TextEffectsPanel from "./TextEffectsPanel";
import { removeBackground, applyVintageDistress } from "../../utils/ImageFilterUtils";
import type {
  DesignElement,
  TextElement,
  ShapeElement,
  StickerElement,
  LineElement,
} from "../../types/designer";

const FONTS = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Oswald",
  "Playfair Display",
  "Bebas Neue",
  "Roboto",
  "Open Sans",
];

interface RightSidebarProps {
  elements: DesignElement[];
  selectedElement: DesignElement | null;
  selectedId: string | null;
  shirtColor: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onUpdate: (id: string, attrs: Partial<DesignElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onBringToFront?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  onFlipH?: (id: string) => void;
  onFlipV?: (id: string) => void;
  onAlign?: (id: string, alignment: "left" | "centerH" | "right" | "top" | "centerV" | "bottom") => void;
  onToggleLock?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onSelect: (id: string | null) => void;
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="prop-row">
      <span className="prop-label">{label}</span>
      <div className="prop-control">{children}</div>
    </div>
  );
}

function NumInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="num-input-wrap">
      <input
        type="number"
        className="prop-num-input"
        value={Math.round(value * 10) / 10}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
      {suffix && <span className="prop-suffix">{suffix}</span>}
    </div>
  );
}

export default function RightSidebar({
  elements,
  selectedElement,
  selectedId,
  shirtColor,
  isCollapsed = false,
  onToggleCollapse,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onFlipH,
  onFlipV,
  onAlign,
  onToggleLock,
  onToggleVisibility,
  onRename,
  onSelect,
}: RightSidebarProps) {
  const el = selectedElement;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const startRename = (layer: DesignElement) => {
    setEditingId(layer.id);
    setEditName(layer.name);
  };

  const saveRename = (id: string) => {
    if (editName.trim() && onRename) {
      onRename(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleRemoveBg = async () => {
    if (el && el.type === "image") {
      setIsProcessingImage(true);
      try {
        const cleanSrc = await removeBackground((el as ImageElement).src);
        onUpdate(el.id, { src: cleanSrc } as any);
      } catch (err) {
        console.error("Remove BG error", err);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleVintageDistress = async () => {
    if (el && el.type === "image") {
      setIsProcessingImage(true);
      try {
        const distressedSrc = await applyVintageDistress((el as ImageElement).src);
        onUpdate(el.id, { src: distressedSrc } as any);
      } catch (err) {
        console.error("Vintage filter error", err);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleAutoRecolor = () => {
    elements.forEach((item) => {
      if (item.type === "text") {
        const currentFill = (item as TextElement).fill;
        if (shirtColor === "#ffffff" && currentFill === "#ffffff") {
          onUpdate(item.id, { fill: "#1a1a2e" } as any);
        } else if (shirtColor !== "#ffffff" && currentFill === "#1a1a2e") {
          onUpdate(item.id, { fill: "#ffffff" } as any);
        }
      }
    });
  };

  // ── Collapsed Icon Strip Mode ──
  if (isCollapsed) {
    return (
      <aside className="designer-sidebar-right w-14 flex-shrink-0 flex flex-col items-center py-3 bg-slate-950 border-l border-slate-800 transition-all duration-300">
        <button
          onClick={onToggleCollapse}
          className="w-9 h-9 mb-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center border border-slate-800 transition-all"
          title="Expand Right Sidebar"
        >
          ◀
        </button>

        <div className="flex flex-col gap-2">
          <button
            onClick={onToggleCollapse}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base bg-slate-900 text-slate-400 hover:bg-slate-800 transition-all"
            title="Properties"
          >
            ⚙️
          </button>
          <button
            onClick={onToggleCollapse}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base bg-slate-900 text-slate-400 hover:bg-slate-800 transition-all"
            title={`Layers (${elements.length})`}
          >
            🥞
          </button>
        </div>
      </aside>
    );
  }

  // ── Full Expanded Sidebar ──
  return (
    <aside className="designer-sidebar-right w-72 flex-shrink-0 flex flex-col h-full bg-slate-950 border-l border-slate-800 transition-all duration-300">
      {/* ── Properties Panel Header & Collapse Toggle ── */}
      <section className="sidebar-section">
        <div style={{ padding: "10px 12px 6px" }}>
          <div className="flex items-center justify-between">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-7 h-7 mr-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center border border-slate-800 transition-all"
                title="Collapse Right Sidebar for extra space"
              >
                ▶
              </button>
            )}

            <p className="sidebar-label flex-1 truncate">
              {el ? `Properties — ${el.name}` : "Properties"}
            </p>

            {elements.length > 0 && (
              <button
                onClick={handleAutoRecolor}
                className="text-[9px] font-bold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 px-2 py-0.5 rounded border border-indigo-500/30 transition-all"
                title="Auto Swap Colors to Match Garment Shade"
              >
                ☯ Recolor
              </button>
            )}
          </div>
        </div>

        {!el ? (
          <div className="designer-empty-state">
            <svg className="designer-empty-state-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 4" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="designer-empty-state-title">No Element Selected</span>
            <p className="designer-empty-state-desc">Select an object on the canvas to customize position, colors, fonts, or effects.</p>
          </div>
        ) : (
          <div className="sidebar-section-content" style={{ paddingTop: 0 }}>
            {/* Quick Alignment Toolbar */}
            {onAlign && onFlipH && onFlipV && (
              <AlignmentToolbar
                elementId={el.id}
                onAlign={onAlign}
                onFlipH={onFlipH}
                onFlipV={onFlipV}
              />
            )}

            {/* Image Pro Processing Tools */}
            {el.type === "image" && (
              <div className="my-2 p-2 bg-slate-900 border border-slate-800 rounded-lg flex flex-col gap-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Image Filters
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={handleRemoveBg}
                    disabled={isProcessingImage}
                    className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded border border-slate-700 transition-all disabled:opacity-50"
                  >
                    ✂️ Remove BG
                  </button>
                  <button
                    onClick={handleVintageDistress}
                    disabled={isProcessingImage}
                    className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded border border-slate-700 transition-all disabled:opacity-50"
                  >
                    📜 Vintage Wash
                  </button>
                </div>
              </div>
            )}

            {/* Transform Controls */}
            <div style={{ marginTop: "8px" }}>
              <span className="sidebar-sublabel" style={{ display: "block", marginBottom: "6px" }}>Transform</span>
              <PropRow label="X">
                <NumInput value={el.x} onChange={(v) => onUpdate(el.id, { x: v } as any)} suffix="px" />
              </PropRow>
              <PropRow label="Y">
                <NumInput value={el.y} onChange={(v) => onUpdate(el.id, { y: v } as any)} suffix="px" />
              </PropRow>
              <PropRow label="Width">
                <NumInput value={el.width} min={10} onChange={(v) => onUpdate(el.id, { width: v } as any)} suffix="px" />
              </PropRow>

              {el.type !== "text" && el.type !== "line" && (
                <PropRow label="Height">
                  <NumInput value={el.height} min={10} onChange={(v) => onUpdate(el.id, { height: v } as any)} suffix="px" />
                </PropRow>
              )}

              <PropRow label="Rotation">
                <NumInput value={el.rotation} min={-180} max={180} onChange={(v) => onUpdate(el.id, { rotation: v } as any)} suffix="°" />
              </PropRow>

              <PropRow label="Opacity">
                <div className="prop-slider-row" style={{ width: "100%" }}>
                  <input
                    type="range"
                    className="prop-slider"
                    min="0"
                    max="1"
                    step="0.05"
                    value={el.opacity}
                    onChange={(e) => onUpdate(el.id, { opacity: parseFloat(e.target.value) } as any)}
                  />
                  <span className="prop-slider-value">{Math.round(el.opacity * 100)}%</span>
                </div>
              </PropRow>
            </div>

            <div className="prop-divider" />

            {/* Text Properties & FX */}
            {el.type === "text" && (() => {
              const t = el as TextElement;

              return (
                <>
                  <span className="sidebar-sublabel" style={{ display: "block", marginBottom: "6px" }}>Typography</span>
                  <PropRow label="Text">
                    <textarea
                      className="prop-textarea"
                      value={t.text}
                      rows={2}
                      onChange={(e) => onUpdate(el.id, { text: e.target.value } as any)}
                    />
                  </PropRow>
                  <PropRow label="Font">
                    <select
                      className="prop-select"
                      value={t.fontFamily}
                      onChange={(e) => onUpdate(el.id, { fontFamily: e.target.value } as any)}
                    >
                      {FONTS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </PropRow>
                  <PropRow label="Size">
                    <NumInput value={t.fontSize} min={8} max={200} onChange={(v) => onUpdate(el.id, { fontSize: v } as any)} suffix="px" />
                  </PropRow>
                  <PropRow label="Color">
                    <div className="color-input-row">
                      <input
                        type="color"
                        className="color-picker-input"
                        value={t.fill}
                        onChange={(e) => onUpdate(el.id, { fill: e.target.value } as any)}
                      />
                      <input
                        type="text"
                        className="prop-hex-input"
                        value={t.fill}
                        onChange={(e) => onUpdate(el.id, { fill: e.target.value } as any)}
                      />
                    </div>
                  </PropRow>

                  <div className="prop-divider" />
                  <TextEffectsPanel element={t} onUpdate={onUpdate} />
                </>
              );
            })()}

            {/* Shape Properties */}
            {el.type === "shape" && (() => {
              const s = el as ShapeElement;

              return (
                <>
                  <span className="sidebar-sublabel" style={{ display: "block", marginBottom: "6px" }}>Appearance</span>
                  <PropRow label="Fill">
                    <div className="color-input-row">
                      <input
                        type="color"
                        className="color-picker-input"
                        value={s.fill}
                        onChange={(e) => onUpdate(el.id, { fill: e.target.value } as any)}
                      />
                      <input
                        type="text"
                        className="prop-hex-input"
                        value={s.fill}
                        onChange={(e) => onUpdate(el.id, { fill: e.target.value } as any)}
                      />
                    </div>
                  </PropRow>
                  <PropRow label="Stroke">
                    <div className="color-input-row">
                      <input
                        type="color"
                        className="color-picker-input"
                        value={s.stroke === "transparent" ? "#ffffff" : s.stroke}
                        onChange={(e) => onUpdate(el.id, { stroke: e.target.value } as any)}
                      />
                      <NumInput value={s.strokeWidth} min={0} max={20} onChange={(v) => onUpdate(el.id, { strokeWidth: v } as any)} suffix="px" />
                    </div>
                  </PropRow>
                </>
              );
            })()}

            {/* Element Actions */}
            <div className="prop-divider" />
            <div className="element-actions">
              <button className="action-btn" onClick={() => onDuplicate(el.id)} title="Duplicate">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Duplicate
              </button>
              {onBringToFront ? (
                <button className="action-btn" onClick={() => onBringToFront(el.id)}>
                  To Front
                </button>
              ) : (
                <button className="action-btn" onClick={() => onBringForward(el.id)}>
                  Forward
                </button>
              )}
              {onSendToBack ? (
                <button className="action-btn" onClick={() => onSendToBack(el.id)}>
                  To Back
                </button>
              ) : (
                <button className="action-btn" onClick={() => onSendBackward(el.id)}>
                  Backward
                </button>
              )}
              <button className="action-btn action-btn--danger" onClick={() => onDelete(el.id)}>
                Delete
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Layers Panel ── */}
      <section className="sidebar-section sidebar-section--grow">
        <div style={{ padding: "10px 12px 6px" }}>
          <p className="sidebar-label">Layers ({elements.length})</p>
        </div>

        <div className="sidebar-section-content" style={{ paddingTop: 0 }}>
          {elements.length === 0 ? (
            <p className="sidebar-empty-hint">No elements added yet. Select tools or graphics on the left.</p>
          ) : (
            <ul className="layers-list" role="listbox" aria-label="Design layers">
              {[...elements].reverse().map((layer) => {
                const isActive = layer.id === selectedId;
                const isEditing = editingId === layer.id;

                return (
                  <li
                    key={layer.id}
                    className={`layer-item ${isActive ? "layer-item--active" : ""} ${!layer.visible ? "layer-item--hidden" : ""} ${layer.locked ? "layer-item--locked" : ""}`}
                    onClick={() => onSelect(layer.id)}
                    role="option"
                    aria-selected={isActive}
                  >
                    <span className="layer-icon">
                      {layer.type === "text" ? "T" : layer.type === "image" ? "🖼" : layer.type === "sticker" ? (layer as StickerElement).emoji : layer.type === "line" ? "─" : "◼"}
                    </span>

                    {isEditing ? (
                      <input
                        className="layer-name-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => saveRename(layer.id)}
                        onKeyDown={(e) => e.key === "Enter" && saveRename(layer.id)}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="layer-name"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startRename(layer);
                        }}
                      >
                        {layer.name}
                      </span>
                    )}

                    <span className="layer-type">{layer.type}</span>

                    <div className="layer-actions" onClick={(e) => e.stopPropagation()}>
                      {onToggleVisibility && (
                        <button
                          className={`layer-action-btn ${!layer.visible ? "layer-action-btn--active" : ""}`}
                          onClick={() => onToggleVisibility(layer.id)}
                        >
                          {layer.visible ? "👁" : "🙈"}
                        </button>
                      )}
                      {onToggleLock && (
                        <button
                          className={`layer-action-btn ${layer.locked ? "layer-action-btn--active" : ""}`}
                          onClick={() => onToggleLock(layer.id)}
                        >
                          {layer.locked ? "🔒" : "🔓"}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </aside>
  );
}
