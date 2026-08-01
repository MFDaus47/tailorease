import { useRef } from "react";
import type { ShapeType } from "../../types/designer";

const SHIRT_COLORS = [
  { hex: "#1a1a2e", label: "Midnight Navy" },
  { hex: "#ffffff", label: "White" },
  { hex: "#c0392b", label: "Red" },
  { hex: "#2980b9", label: "Blue" },
  { hex: "#27ae60", label: "Green" },
  { hex: "#8e44ad", label: "Purple" },
  { hex: "#e67e22", label: "Orange" },
  { hex: "#2c3e50", label: "Charcoal" },
  { hex: "#f39c12", label: "Yellow" },
  { hex: "#16a085", label: "Teal" },
  { hex: "#d35400", label: "Burnt Orange" },
  { hex: "#7f8c8d", label: "Gray" },
];

const STICKERS = [
  "⭐", "🔥", "✦", "◆", "🎯", "💎", "🏆", "✌️",
  "🎨", "⚡", "❤️", "🎪", "🌟", "🎭", "🦋", "🚀",
];

const FONTS = ["Inter", "Poppins", "Montserrat", "Oswald", "Playfair Display", "Bebas Neue"];

interface LeftSidebarProps {
  shirtColor: string;
  onColorChange: (color: string) => void;
  onAddText: () => void;
  onAddShape: (shape: ShapeType) => void;
  onAddSticker: (emoji: string) => void;
  onAddImage: (src: string, name: string) => void;
}

export default function LeftSidebar({
  shirtColor,
  onColorChange,
  onAddText,
  onAddShape,
  onAddSticker,
  onAddImage,
}: LeftSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      onAddImage(src, file.name);
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  return (
    <aside className="designer-sidebar-left">
      {/* Add elements */}
      <section className="sidebar-section">
        <p className="sidebar-label">Add element</p>
        <div className="tool-grid">
          <button className="tool-btn" onClick={onAddText} title="Add text">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
            </svg>
            Text
          </button>
          <button className="tool-btn" onClick={() => fileInputRef.current?.click()} title="Upload image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            Image
          </button>
          <button className="tool-btn" onClick={() => onAddShape("rect")} title="Add rectangle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            Shape
          </button>
          <button className="tool-btn" onClick={() => onAddShape("circle")} title="Add circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
            </svg>
            Circle
          </button>
          <button className="tool-btn" onClick={() => onAddShape("star")} title="Add star">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Star
          </button>
          <button className="tool-btn" onClick={() => onAddShape("triangle")} title="Add triangle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="12 2 22 21 2 21"/>
            </svg>
            Triangle
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload image file"
        />
      </section>

      {/* Shirt color */}
      <section className="sidebar-section">
        <p className="sidebar-label">Shirt color</p>
        <div className="color-grid">
          {SHIRT_COLORS.map((c) => (
            <button
              key={c.hex}
              className={`swatch-btn ${shirtColor === c.hex ? "swatch-active" : ""}`}
              style={{ background: c.hex, border: c.hex === "#ffffff" ? "1px solid #ccc" : undefined }}
              title={c.label}
              onClick={() => onColorChange(c.hex)}
              aria-label={`Set shirt color to ${c.label}`}
              aria-pressed={shirtColor === c.hex}
            />
          ))}
        </div>
        <div className="custom-color-row">
          <label className="sidebar-sublabel" htmlFor="custom-shirt-color">Custom</label>
          <input
            id="custom-shirt-color"
            type="color"
            value={shirtColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="color-picker-input"
            title="Pick a custom color"
          />
        </div>
      </section>

      {/* Stickers */}
      <section className="sidebar-section sidebar-section--grow">
        <p className="sidebar-label">Stickers</p>
        <div className="sticker-grid">
          {STICKERS.map((emoji) => (
            <button
              key={emoji}
              className="sticker-btn"
              onClick={() => onAddSticker(emoji)}
              title={`Add ${emoji}`}
              aria-label={`Add sticker ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
