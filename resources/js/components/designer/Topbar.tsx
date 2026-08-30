import { useState, useRef, useEffect } from "react";
import type { ShirtView, ViewMode, ProductType } from "../../types/designer";

interface TopbarProps {
  campaignName: string;
  activeView: ShirtView;
  viewMode: ViewMode;
  productType: ProductType;
  elementCount: number;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  showGrid: boolean;
  snapEnabled: boolean;
  onBack: () => void;
  onViewChange: (view: ShirtView) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onProductTypeChange: (product: ProductType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToCanvas: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onOpenShortcuts: () => void;
  onOpenShowcase: () => void;
  onOpenPreflight: () => void;
  onExport: (format: "jpeg" | "png") => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function Topbar({
  campaignName,
  activeView,
  viewMode,
  productType,
  elementCount,
  canUndo,
  canRedo,
  zoom,
  showGrid,
  snapEnabled,
  onBack,
  onViewChange,
  onViewModeChange,
  onProductTypeChange,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitToCanvas,
  onToggleGrid,
  onToggleSnap,
  onOpenShortcuts,
  onOpenShowcase,
  onOpenPreflight,
  onExport,
  onSave,
  isSaving,
}: TopbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const basePrices: Record<ProductType, number> = {
    tshirt: 25,
    hoodie: 65,
    polo: 38,
    jersey: 45,
  };
  const estimatedCost = (basePrices[productType] || 25) + Math.min(20, elementCount * 3.5);

  return (
    <header className="designer-topbar bg-slate-950 border-b border-slate-800 px-3 py-2" role="banner">
      {/* Left group */}
      <div className="topbar-group topbar-group--left flex items-center gap-3">
        <button className="topbar-back-btn" onClick={onBack} aria-label="Back to order form">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <div className="topbar-divider" aria-hidden="true" />

        <div className="topbar-campaign flex items-center gap-2">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Studio Pro
          </span>
          <span className="topbar-campaign-name text-xs font-bold text-slate-200">{campaignName}</span>
        </div>

        {/* Live Estimated Unit Cost Badge */}
        <div
          onClick={onOpenPreflight}
          className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
          title="Click to view Pre-Flight Cost Breakdown"
        >
          <span className="text-[10px] font-semibold text-slate-400">Est. Price:</span>
          <span className="text-xs font-extrabold text-emerald-400">RM {estimatedCost.toFixed(2)}/pc</span>
        </div>
      </div>

      {/* Center group — 2D/3D Mode Selector & Product Selector */}
      <div className="topbar-group topbar-group--center flex items-center gap-3">
        {/* Workspace View Mode Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => onViewModeChange("2d")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              viewMode === "2d"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            2D Canvas
          </button>
          <button
            onClick={() => onViewModeChange("split")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === "split"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live 3D Split
          </button>
          <button
            onClick={() => onViewModeChange("3d")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              viewMode === "3d"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            3D Studio
          </button>
        </div>

        {/* Product Type Switcher */}
        <select
          value={productType}
          onChange={(e: any) => onProductTypeChange(e.target.value)}
          className="bg-slate-900 text-xs font-bold text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-indigo-500/40"
        >
          <option value="tshirt">👕 Crewneck T-Shirt</option>
          <option value="hoodie">🧥 Premium Hoodie</option>
          <option value="polo">👔 Polo Shirt</option>
          <option value="jersey">🎽 Athletic Jersey</option>
        </select>

        <div className="topbar-divider" aria-hidden="true" />

        {/* Shirt View Toggle (Front / Back) */}
        {viewMode !== "3d" && (
          <div className="view-toggle" role="group" aria-label="Shirt view">
            <button
              className={`view-toggle-btn ${activeView === "front" ? "view-toggle-btn--active" : ""}`}
              onClick={() => onViewChange("front")}
            >
              Front
            </button>
            <button
              className={`view-toggle-btn ${activeView === "back" ? "view-toggle-btn--active" : ""}`}
              onClick={() => onViewChange("back")}
            >
              Back
            </button>
          </div>
        )}

        {/* Undo / Redo */}
        <button
          className={`topbar-icon-btn ${!canUndo ? "topbar-icon-btn--disabled" : ""}`}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
          </svg>
        </button>

        <button
          className={`topbar-icon-btn ${!canRedo ? "topbar-icon-btn--disabled" : ""}`}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
          </svg>
        </button>
      </div>

      {/* Right group */}
      <div className="topbar-group topbar-group--right flex items-center gap-2">
        {/* Pre-Flight Inspector Launcher */}
        <button
          onClick={onOpenPreflight}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all flex items-center gap-1"
          title="Production Quality Pre-Flight Inspector"
        >
          <span>🏁</span> Inspector
        </button>

        {/* Studio Showcase button */}
        <button
          onClick={onOpenShowcase}
          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          title="View Studio Showcase Package"
        >
          <span>✨</span> Showcase Pro
        </button>

        {/* Shortcuts button */}
        <button className="topbar-icon-btn" onClick={onOpenShortcuts} title="Keyboard Shortcuts">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M7 16h10"/>
          </svg>
        </button>

        {/* Export dropdown */}
        <div className="export-dropdown-wrapper" ref={exportRef}>
          <button
            className="topbar-btn topbar-btn--outline"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>

          {showExportMenu && (
            <div className="export-dropdown">
              <button
                className="export-dropdown-item"
                onClick={() => {
                  onExport("jpeg");
                  setShowExportMenu(false);
                }}
              >
                Export as JPEG <span>.jpg</span>
              </button>
              <button
                className="export-dropdown-item"
                onClick={() => {
                  onExport("png");
                  setShowExportMenu(false);
                }}
              >
                Export as PNG <span>.png</span>
              </button>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          className={`topbar-btn topbar-btn--primary ${isSaving ? "topbar-btn--loading" : ""}`}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Saving…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Save Design
            </>
          )}
        </button>
      </div>
    </header>
  );
}
