interface KeyboardShortcutsPanelProps {
  onClose: () => void;
}

function ShortcutRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="shortcut-row">
      <span className="shortcut-label">{label}</span>
      <div className="shortcut-keys">
        {keys.map((key, i) => (
          <span key={i} className="shortcut-key">{key}</span>
        ))}
      </div>
    </div>
  );
}

export default function KeyboardShortcutsPanel({ onClose }: KeyboardShortcutsPanelProps) {
  return (
    <div className="shortcuts-overlay" onClick={onClose} role="dialog" aria-label="Keyboard shortcuts">
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-title">
          <h3>Keyboard Shortcuts</h3>
          <button className="shortcuts-close-btn" onClick={onClose} aria-label="Close shortcuts">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="shortcuts-grid">
          <div className="shortcuts-section">
            <h4>Selection</h4>
            <ShortcutRow label="Select all" keys={["Ctrl", "A"]} />
            <ShortcutRow label="Deselect" keys={["Esc"]} />
            <ShortcutRow label="Delete" keys={["Del"]} />
            <ShortcutRow label="Duplicate" keys={["Ctrl", "D"]} />
          </div>

          <div className="shortcuts-section">
            <h4>Transform</h4>
            <ShortcutRow label="Nudge 1px" keys={["↑", "↓", "←", "→"]} />
            <ShortcutRow label="Nudge 10px" keys={["Shift", "Arrow"]} />
            <ShortcutRow label="Flip horizontal" keys={["Shift", "H"]} />
            <ShortcutRow label="Flip vertical" keys={["Shift", "V"]} />
          </div>

          <div className="shortcuts-section">
            <h4>View</h4>
            <ShortcutRow label="Zoom in" keys={["+"]} />
            <ShortcutRow label="Zoom out" keys={["−"]} />
            <ShortcutRow label="Fit to canvas" keys={["Ctrl", "0"]} />
            <ShortcutRow label="Toggle grid" keys={["Ctrl", "G"]} />
          </div>

          <div className="shortcuts-section">
            <h4>History</h4>
            <ShortcutRow label="Undo" keys={["Ctrl", "Z"]} />
            <ShortcutRow label="Redo" keys={["Ctrl", "Shift", "Z"]} />
            <ShortcutRow label="Redo" keys={["Ctrl", "Y"]} />
            <ShortcutRow label="Save" keys={["Ctrl", "S"]} />
          </div>
        </div>
      </div>
    </div>
  );
}
