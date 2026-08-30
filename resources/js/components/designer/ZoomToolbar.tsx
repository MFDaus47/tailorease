interface ZoomToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToCanvas: () => void;
  onZoomChange: (zoom: number) => void;
}

export default function ZoomToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToCanvas,
  onZoomChange,
}: ZoomToolbarProps) {
  const percentage = Math.round(zoom * 100);

  return (
    <div className="zoom-toolbar" role="toolbar" aria-label="Zoom controls">
      {/* Zoom out */}
      <button
        className="zoom-toolbar-btn"
        onClick={onZoomOut}
        title="Zoom out (−)"
        aria-label="Zoom out"
        disabled={zoom <= 0.25}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* Zoom value */}
      <button
        className="zoom-toolbar-value"
        onClick={onFitToCanvas}
        title="Reset to 100%"
        aria-label={`Zoom ${percentage}%, click to reset`}
      >
        {percentage}%
      </button>

      {/* Zoom in */}
      <button
        className="zoom-toolbar-btn"
        onClick={onZoomIn}
        title="Zoom in (+)"
        aria-label="Zoom in"
        disabled={zoom >= 4}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <div className="zoom-toolbar-divider" aria-hidden="true" />

      {/* Fit to canvas */}
      <button
        className="zoom-toolbar-btn"
        onClick={onFitToCanvas}
        title="Fit to canvas (Ctrl+0)"
        aria-label="Fit to canvas"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
        </svg>
      </button>

      {/* Grid toggle via parent — not here */}
    </div>
  );
}
