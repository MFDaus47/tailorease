interface AlignmentToolbarProps {
  elementId: string;
  onAlign: (id: string, alignment: "left" | "centerH" | "right" | "top" | "centerV" | "bottom") => void;
  onFlipH: (id: string) => void;
  onFlipV: (id: string) => void;
}

export default function AlignmentToolbar({ elementId, onAlign, onFlipH, onFlipV }: AlignmentToolbarProps) {
  return (
    <div className="alignment-toolbar" role="toolbar" aria-label="Alignment tools">
      {/* Align left */}
      <button className="align-btn" onClick={() => onAlign(elementId, "left")} title="Align left" aria-label="Align left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="3" x2="4" y2="21"/><rect x="4" y="5" width="14" height="4" rx="1"/><rect x="4" y="13" width="8" height="4" rx="1"/>
        </svg>
      </button>

      {/* Align center horizontal */}
      <button className="align-btn" onClick={() => onAlign(elementId, "centerH")} title="Center horizontally" aria-label="Center horizontally">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="3" x2="12" y2="21"/><rect x="5" y="5" width="14" height="4" rx="1"/><rect x="7" y="13" width="10" height="4" rx="1"/>
        </svg>
      </button>

      {/* Align right */}
      <button className="align-btn" onClick={() => onAlign(elementId, "right")} title="Align right" aria-label="Align right">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="20" y1="3" x2="20" y2="21"/><rect x="6" y="5" width="14" height="4" rx="1"/><rect x="12" y="13" width="8" height="4" rx="1"/>
        </svg>
      </button>

      <div className="align-separator" aria-hidden="true" />

      {/* Align top */}
      <button className="align-btn" onClick={() => onAlign(elementId, "top")} title="Align top" aria-label="Align top">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="4" x2="21" y2="4"/><rect x="5" y="4" width="4" height="14" rx="1"/><rect x="13" y="4" width="4" height="8" rx="1"/>
        </svg>
      </button>

      {/* Align center vertical */}
      <button className="align-btn" onClick={() => onAlign(elementId, "centerV")} title="Center vertically" aria-label="Center vertically">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="12" x2="21" y2="12"/><rect x="5" y="5" width="4" height="14" rx="1"/><rect x="13" y="7" width="4" height="10" rx="1"/>
        </svg>
      </button>

      {/* Align bottom */}
      <button className="align-btn" onClick={() => onAlign(elementId, "bottom")} title="Align bottom" aria-label="Align bottom">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="20" x2="21" y2="20"/><rect x="5" y="6" width="4" height="14" rx="1"/><rect x="13" y="12" width="4" height="8" rx="1"/>
        </svg>
      </button>

      <div className="align-separator" aria-hidden="true" />

      {/* Flip horizontal */}
      <button className="align-btn" onClick={() => onFlipH(elementId)} title="Flip horizontal (Shift+H)" aria-label="Flip horizontal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><line x1="12" y1="20" x2="12" y2="4"/>
        </svg>
      </button>

      {/* Flip vertical */}
      <button className="align-btn" onClick={() => onFlipV(elementId)} title="Flip vertical (Shift+V)" aria-label="Flip vertical">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"/><path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><line x1="4" y1="12" x2="20" y2="12"/>
        </svg>
      </button>
    </div>
  );
}
