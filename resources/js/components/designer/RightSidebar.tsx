import type {
  DesignElement,
  TextElement,
  ShapeElement,
  ImageElement,
  StickerElement,
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
  onUpdate: (id: string, attrs: Partial<DesignElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
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
        value={Math.round(value * 100) / 100}
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
  onUpdate,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onSelect,
}: RightSidebarProps) {
  const el = selectedElement;

  return (
    <aside className="designer-sidebar-right">
      {/* Properties panel */}
      <section className="sidebar-section">
        <p className="sidebar-label">
          {el ? `Properties — ${el.name}` : "Properties"}
        </p>

        {!el && (
          <p className="sidebar-empty-hint">Select an element on the canvas to edit its properties.</p>
        )}

        {el && (
          <>
            {/* Position & size */}
            <PropRow label="X">
              <NumInput value={el.x} onChange={(v) => onUpdate(el.id, { x: v } as any)} suffix="px" />
            </PropRow>
            <PropRow label="Y">
              <NumInput value={el.y} onChange={(v) => onUpdate(el.id, { y: v } as any)} suffix="px" />
            </PropRow>
            <PropRow label="Width">
              <NumInput value={el.width} min={10} onChange={(v) => onUpdate(el.id, { width: v } as any)} suffix="px" />
            </PropRow>
            {el.type !== "text" && (
              <PropRow label="Height">
                <NumInput value={el.height} min={10} onChange={(v) => onUpdate(el.id, { height: v } as any)} suffix="px" />
              </PropRow>
            )}
            <PropRow label="Rotation">
              <NumInput value={el.rotation} min={-180} max={180} onChange={(v) => onUpdate(el.id, { rotation: v } as any)} suffix="°" />
            </PropRow>
            <PropRow label="Opacity">
              <NumInput value={Math.round(el.opacity * 100)} min={0} max={100} onChange={(v) => onUpdate(el.id, { opacity: v / 100 } as any)} suffix="%" />
            </PropRow>

            <div className="prop-divider" />

            {/* Text-specific */}
            {el.type === "text" && (() => {
              const t = el as TextElement;

              return (
                <>
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
                  <PropRow label="Style">
                    <div className="style-btn-group">
                      <button
                        className={`style-btn ${t.fontWeight === "bold" ? "style-btn--active" : ""}`}
                        onClick={() => onUpdate(el.id, { fontWeight: t.fontWeight === "bold" ? "normal" : "bold" } as any)}
                        aria-pressed={t.fontWeight === "bold"}
                        title="Bold"
                      >
                        <b>B</b>
                      </button>
                      <button
                        className={`style-btn ${t.fontStyle === "italic" ? "style-btn--active" : ""}`}
                        onClick={() => onUpdate(el.id, { fontStyle: t.fontStyle === "italic" ? "normal" : "italic" } as any)}
                        aria-pressed={t.fontStyle === "italic"}
                        title="Italic"
                      >
                        <i>I</i>
                      </button>
                      <button
                        className={`style-btn ${t.textDecoration === "underline" ? "style-btn--active" : ""}`}
                        onClick={() => onUpdate(el.id, { textDecoration: t.textDecoration === "underline" ? "" : "underline" } as any)}
                        aria-pressed={t.textDecoration === "underline"}
                        title="Underline"
                      >
                        <u>U</u>
                      </button>
                    </div>
                  </PropRow>
                  <PropRow label="Align">
                    <div className="style-btn-group">
                      {(["left", "center", "right"] as const).map((a) => (
                        <button
                          key={a}
                          className={`style-btn ${t.align === a ? "style-btn--active" : ""}`}
                          onClick={() => onUpdate(el.id, { align: a } as any)}
                          aria-pressed={t.align === a}
                          title={`Align ${a}`}
                        >
                          {a === "left" ? "⫷" : a === "center" ? "≡" : "⫸"}
                        </button>
                      ))}
                    </div>
                  </PropRow>
                  <PropRow label="Spacing">
                    <NumInput value={t.letterSpacing} min={-5} max={20} onChange={(v) => onUpdate(el.id, { letterSpacing: v } as any)} suffix="px" />
                  </PropRow>
                </>
              );
            })()}

            {/* Shape-specific */}
            {el.type === "shape" && (() => {
              const s = el as ShapeElement;

              return (
                <>
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
                        value={s.stroke === "transparent" ? "#000000" : s.stroke}
                        onChange={(e) => onUpdate(el.id, { stroke: e.target.value } as any)}
                      />
                      <NumInput value={s.strokeWidth} min={0} max={20} onChange={(v) => onUpdate(el.id, { strokeWidth: v } as any)} suffix="px" />
                    </div>
                  </PropRow>
                </>
              );
            })()}

            {/* Element actions */}
            <div className="prop-divider" />
            <div className="element-actions">
              <button className="action-btn" onClick={() => onDuplicate(el.id)} title="Duplicate">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Duplicate
              </button>
              <button className="action-btn" onClick={() => onBringForward(el.id)} title="Bring forward">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="17 11 12 6 7 11"/><line x1="12" y1="18" x2="12" y2="6"/></svg>
                Forward
              </button>
              <button className="action-btn" onClick={() => onSendBackward(el.id)} title="Send backward">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="7 13 12 18 17 13"/><line x1="12" y1="6" x2="12" y2="18"/></svg>
                Backward
              </button>
              <button className="action-btn action-btn--danger" onClick={() => onDelete(el.id)} title="Delete element">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                Delete
              </button>
            </div>
          </>
        )}
      </section>

      {/* Layers panel */}
      <section className="sidebar-section sidebar-section--grow">
        <p className="sidebar-label">Layers ({elements.length})</p>
        {elements.length === 0 && (
          <p className="sidebar-empty-hint">No elements yet. Add text, shapes, or images.</p>
        )}
        <ul className="layers-list" role="listbox" aria-label="Design layers">
          {[...elements].reverse().map((layer, idx) => {
            const isActive = layer.id === selectedId;

            return (
              <li
                key={layer.id}
                className={`layer-item ${isActive ? "layer-item--active" : ""}`}
                onClick={() => onSelect(layer.id)}
                role="option"
                aria-selected={isActive}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(layer.id)}
              >
                <span className="layer-icon" aria-hidden="true">
                  {layer.type === "text" ? "T" : layer.type === "image" ? "🖼" : layer.type === "sticker" ? (layer as StickerElement).emoji : "◼"}
                </span>
                <span className="layer-name">{layer.name}</span>
                <span className="layer-type">{layer.type}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
