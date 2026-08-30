import { Head, usePage } from '@inertiajs/react';
import { useEffect, useCallback, useState } from "react";
import DesignCanvas from "../components/designer/DesignCanvas";
import LeftSidebar from "../components/designer/LeftSidebar";
import RightSidebar from "../components/designer/RightSidebar";
import Topbar from "../components/designer/Topbar";
import ZoomToolbar from "../components/designer/ZoomToolbar";
import Studio3DLiveView from "../components/designer/Studio3DLiveView";
import StudioShowcaseModal from "../components/designer/StudioShowcaseModal";
import StudioRulers from "../components/designer/StudioRulers";
import MultiSidePreviewDock from "../components/designer/MultiSidePreviewDock";
import PreflightInspectorModal from "../components/designer/PreflightInspectorModal";
import KeyboardShortcutsPanel from "../components/designer/KeyboardShortcutsPanel";
import { useDesigner } from "../hooks/use-designer";
import type { DesignElement } from "../types/designer";
import "../../css/designer.css";

interface DesignerPageProps {
  /**
   * Called when the user saves the design.
   * Receives the flat JPEG/PNG data-URL to pass as `designUrl` to ShirtViewer.
   */
  onSave?: (dataUrl: string) => void;
}

export default function DesignerPage({ onSave }: DesignerPageProps) {
  const { url } = usePage();

  const searchParams = new URLSearchParams(
    url.includes("?") ? url.split("?")[1] : ""
  );

  const campaignId = searchParams.get("id");
  const campaignName = searchParams.get("campaign") ?? "Your Campaign";

  const storageKey = campaignId
    ? `tailorease_design_url_${campaignId}`
    : "tailorease_design_url";

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showShowcaseModal, setShowShowcaseModal] = useState(false);
  const [showPreflightModal, setShowPreflightModal] = useState(false);

  // Collapsible Sidebars State for extra workspace room
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const {
    state,
    stageRef,
    selectedElement,
    addText,
    addShape,
    addSticker,
    addImage,
    addLine,
    loadFullTemplate,
    updateElement,
    updateElementLive,
    deleteElement,
    selectElement,
    renameElement,
    setViewMode,
    setProductType,
    setShirtColor,
    setActiveView,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    duplicateElement,
    flipHorizontal,
    flipVertical,
    toggleLock,
    toggleVisibility,
    alignElement,
    nudgeElement,
    selectAll,
    setZoom,
    zoomIn,
    zoomOut,
    fitToCanvas,
    toggleGrid,
    toggleSnap,
    updateLive3dTexture,
    undo,
    redo,
    exportToDataURL,
    canUndo,
    canRedo,
  } = useDesigner();

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Sync 2D Canvas stage output to 3D texture buffer
  const sync3dTexture = useCallback(() => {
    const dataUrl = exportToDataURL("image/png");
    if (dataUrl) {
      updateLive3dTexture(dataUrl);
    }
  }, [exportToDataURL, updateLive3dTexture]);

  useEffect(() => {
    const timer = setTimeout(() => {
      sync3dTexture();
    }, 150);
    return () => clearTimeout(timer);
  }, [state.elements, state.shirtColor, state.activeView, sync3dTexture]);

  // ── Template loader ──────────────────────────────────────────────────────
  const handleLoadTemplate = useCallback(
    (templateType: string) => {
      loadFullTemplate(templateType);
      showToast(`Loaded ${templateType.toUpperCase()} Pro Template!`, "success");
    },
    [loadFullTemplate, showToast]
  );

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        toggleGrid();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault();
        fitToCanvas();
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a" && !isInput) {
        e.preventDefault();
        selectAll();
      }

      if (!isInput && (e.key === "Delete" || e.key === "Backspace") && state.selectedId) {
        e.preventDefault();
        deleteElement(state.selectedId);
      }

      if (!isInput && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d" && state.selectedId) {
        e.preventDefault();
        duplicateElement(state.selectedId);
      }

      if (!isInput && e.shiftKey && e.key.toUpperCase() === "H" && state.selectedId) {
        e.preventDefault();
        flipHorizontal(state.selectedId);
      }

      if (!isInput && e.shiftKey && e.key.toUpperCase() === "V" && state.selectedId) {
        e.preventDefault();
        flipVertical(state.selectedId);
      }

      if (!isInput && state.selectedId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        nudgeElement(state.selectedId, dx, dy);
      }

      if (!isInput && e.key === "Escape") {
        selectElement(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    undo,
    redo,
    toggleGrid,
    fitToCanvas,
    selectAll,
    deleteElement,
    duplicateElement,
    flipHorizontal,
    flipVertical,
    nudgeElement,
    selectElement,
    state.selectedId,
  ]);

  // ── Export design ────────────────────────────────────────────────────────
  const handleExport = useCallback(
    (format: "jpeg" | "png") => {
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const dataUrl = exportToDataURL(mime);

      if (!dataUrl) {
        showToast("Nothing to export yet.", "error");
        return;
      }

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `tailorease-design-${Date.now()}.${format}`;
      a.click();
      showToast(`Design exported as ${format.toUpperCase()}.`, "success");
    },
    [exportToDataURL, showToast]
  );

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  // ── Save design ──────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const dataUrl = exportToDataURL("image/jpeg");

    if (!dataUrl) {
      showToast("Add some elements before saving.", "error");
      return;
    }

    setIsSaving(true);

    try {
      sessionStorage.setItem(storageKey, dataUrl);

      if (onSave) {
        onSave(dataUrl);
        showToast("Design saved successfully!", "success");
        return;
      }

      handleBack();
    } catch (error) {
      console.error("Unable to save design: ", error);
      showToast("Something went wrong while saving. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  }, [exportToDataURL, storageKey, onSave, handleBack, showToast]);

  const handleUpdateCommit = useCallback(
    (id: string, attrs: Partial<DesignElement>) => {
      updateElement(id, attrs);
      sync3dTexture();
    },
    [updateElement, sync3dTexture]
  );

  return (
    <>
      <Head title={`${campaignName} - TailorEase Studio Pro`} />

      {/* Full Bleed Viewport Container (fixed inset-0 z-50 bg-slate-950) */}
      <div className="designer-root fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden">
        <h1 className="sr-only">TailorEase Studio Pro Designer</h1>

        {/* Master Topbar */}
        <Topbar
          campaignName={campaignName}
          activeView={state.activeView}
          viewMode={state.viewMode}
          productType={state.productType}
          elementCount={state.elements.length}
          canUndo={canUndo}
          canRedo={canRedo}
          zoom={state.zoom}
          showGrid={state.showGrid}
          snapEnabled={state.snapEnabled}
          onBack={handleBack}
          onViewChange={setActiveView}
          onViewModeChange={setViewMode}
          onProductTypeChange={setProductType}
          onUndo={undo}
          onRedo={redo}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitToCanvas={fitToCanvas}
          onToggleGrid={toggleGrid}
          onToggleSnap={toggleSnap}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
          onOpenShowcase={() => setShowShowcaseModal(true)}
          onOpenPreflight={() => setShowPreflightModal(true)}
          onExport={handleExport}
          onSave={handleSave}
          isSaving={isSaving}
        />

        <div className="designer-workspace flex-1 flex overflow-hidden relative">
          {/* Left Sidebar Tools & Graphics */}
          <LeftSidebar
            shirtColor={state.shirtColor}
            isCollapsed={leftCollapsed}
            onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
            onColorChange={setShirtColor}
            onAddText={addText}
            onAddShape={addShape}
            onAddSticker={addSticker}
            onAddImage={addImage}
            onAddLine={addLine}
            onLoadTemplate={handleLoadTemplate}
          />

          {/* Main Canvas Viewport Area */}
          <main className="designer-canvas-area flex-1 relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden" role="main" aria-label="Design canvas">
            
            {/* Metric Studio Rulers */}
            {state.viewMode !== "3d" && (
              <StudioRulers width={400} height={420} zoom={state.zoom} />
            )}

            {/* Mode 1: Pure 2D Canvas */}
            {state.viewMode === "2d" && (
              <DesignCanvas
                stageRef={stageRef}
                elements={state.elements}
                selectedId={state.selectedId}
                shirtColor={state.shirtColor}
                activeView={state.activeView}
                zoom={state.zoom}
                panX={state.panX}
                panY={state.panY}
                showGrid={state.showGrid}
                snapEnabled={state.snapEnabled}
                onSelect={selectElement}
                onUpdateLive={updateElementLive}
                onUpdateCommit={handleUpdateCommit}
                onDrawFinish={sync3dTexture}
              />
            )}

            {/* Mode 2: Split View (2D Canvas + Live 3D Orbit Viewer) */}
            {state.viewMode === "split" && (
              <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-center pl-6 pt-5">
                <div className="w-full h-full flex items-center justify-center relative">
                  <DesignCanvas
                    stageRef={stageRef}
                    elements={state.elements}
                    selectedId={state.selectedId}
                    shirtColor={state.shirtColor}
                    activeView={state.activeView}
                    zoom={state.zoom}
                    panX={state.panX}
                    panY={state.panY}
                    showGrid={state.showGrid}
                    snapEnabled={state.snapEnabled}
                    onSelect={selectElement}
                    onUpdateLive={updateElementLive}
                    onUpdateCommit={handleUpdateCommit}
                    onDrawFinish={sync3dTexture}
                  />
                </div>

                <div className="w-full h-full flex items-center justify-center">
                  <Studio3DLiveView
                    color={state.shirtColor}
                    designUrl={state.live3dDataUrl}
                    productType={state.productType}
                  />
                </div>
              </div>
            )}

            {/* Mode 3: Fullscreen 3D Studio Viewer */}
            {state.viewMode === "3d" && (
              <div className="w-full h-full flex items-center justify-center">
                <Studio3DLiveView
                  color={state.shirtColor}
                  designUrl={state.live3dDataUrl}
                  productType={state.productType}
                />
              </div>
            )}

            {/* Floating Zoom Toolbar (visible in 2D or Split mode) */}
            {state.viewMode !== "3d" && (
              <ZoomToolbar
                zoom={state.zoom}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onFitToCanvas={fitToCanvas}
                onZoomChange={setZoom}
              />
            )}
          </main>

          {/* Right Sidebar Properties & Layers */}
          <RightSidebar
            elements={state.elements}
            selectedElement={selectedElement}
            selectedId={state.selectedId}
            shirtColor={state.shirtColor}
            isCollapsed={rightCollapsed}
            onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
            onUpdate={updateElement}
            onDelete={deleteElement}
            onDuplicate={duplicateElement}
            onBringForward={bringForward}
            onSendBackward={sendBackward}
            onBringToFront={bringToFront}
            onSendToBack={sendToBack}
            onFlipH={flipHorizontal}
            onFlipV={flipVertical}
            onAlign={alignElement}
            onToggleLock={toggleLock}
            onToggleVisibility={toggleVisibility}
            onRename={renameElement}
            onSelect={selectElement}
          />
        </div>

        {/* Multi-Side Floating Preview Dock */}
        <MultiSidePreviewDock
          activeView={state.activeView}
          viewMode={state.viewMode}
          shirtColor={state.shirtColor}
          live3dDataUrl={state.live3dDataUrl}
          onViewChange={setActiveView}
          onViewModeChange={setViewMode}
        />

        {/* Shortcuts modal */}
        {showShortcutsModal && (
          <KeyboardShortcutsPanel onClose={() => setShowShortcutsModal(false)} />
        )}

        {/* Studio Showcase Export modal */}
        {showShowcaseModal && (
          <StudioShowcaseModal
            campaignName={campaignName}
            shirtColor={state.shirtColor}
            designUrl={state.live3dDataUrl}
            productType={state.productType}
            onClose={() => setShowShowcaseModal(false)}
            onDownload={handleExport}
          />
        )}

        {/* Pre-Flight Quality Inspector modal */}
        {showPreflightModal && (
          <PreflightInspectorModal
            elements={state.elements}
            productType={state.productType}
            shirtColor={state.shirtColor}
            onClose={() => setShowPreflightModal(false)}
          />
        )}

        {/* Toast notification */}
        {toast && (
          <div className={`designer-toast designer-toast--${toast.type}`} role="status" aria-live="polite">
            <span className="designer-toast-icon">
              {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
            </span>
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}
