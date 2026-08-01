import type { ShirtView } from "../../types/designer";

interface TopbarProps {
  campaignName: string;
  activeView: ShirtView;
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
  onViewChange: (view: ShirtView) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onSave: () => void;
  isSaving: boolean;
}

function IconBtn({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`topbar-icon-btn ${disabled ? "topbar-icon-btn--disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

export default function Topbar({
  campaignName,
  activeView,
  canUndo,
  canRedo,
  onBack,
  onViewChange,
  onUndo,
  onRedo,
  onExport,
  onSave,
  isSaving,
}: TopbarProps) {
  return (
    <header className="designer-topbar" role="banner">
      {/* Left group */}
      <div className="topbar-group topbar-group--left">
        <button className="topbar-back-btn" onClick={onBack} aria-label="Back to order form">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to order
        </button>
        <div className="topbar-divider" aria-hidden="true" />
        <div className="topbar-campaign">
          <span className="topbar-campaign-label">Campaign</span>
          <span className="topbar-campaign-name">{campaignName}</span>
        </div>
      </div>

      {/* Center group — view toggle + undo/redo */}
      <div className="topbar-group topbar-group--center">
        <div className="view-toggle" role="group" aria-label="Shirt view">
          <button
            className={`view-toggle-btn ${activeView === "front" ? "view-toggle-btn--active" : ""}`}
            onClick={() => onViewChange("front")}
            aria-pressed={activeView === "front"}
          >
            Front
          </button>
          <button
            className={`view-toggle-btn ${activeView === "back" ? "view-toggle-btn--active" : ""}`}
            onClick={() => onViewChange("back")}
            aria-pressed={activeView === "back"}
          >
            Back
          </button>
        </div>

        <div className="topbar-divider" aria-hidden="true" />

        <IconBtn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
          </svg>
        </IconBtn>
        <IconBtn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
          </svg>
        </IconBtn>
      </div>

      {/* Right group */}
      <div className="topbar-group topbar-group--right">
        <button className="topbar-btn topbar-btn--outline" onClick={onExport} aria-label="Export design as JPEG">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export .jpg
        </button>
        <button
          className={`topbar-btn topbar-btn--primary ${isSaving ? "topbar-btn--loading" : ""}`}
          onClick={onSave}
          disabled={isSaving}
          aria-label="Save design and return to order form"
        >
          {isSaving ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Saving…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Save design
            </>
          )}
        </button>
      </div>
    </header>
  );
}
