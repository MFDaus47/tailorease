import { Head, usePage } from '@inertiajs/react';
import { useEffect, useCallback, useState } from "react";
import DesignCanvas from "../components/designer/DesignCanvas";
import LeftSidebar from "../components/designer/LeftSidebar";
import RightSidebar from "../components/designer/RightSidebar";
import Topbar from "../components/designer/Topbar";
import { useDesigner } from "../hooks/use-designer";
import type { DesignElement } from "../types/designer";
import "../../css/designer.css";

interface DesignerPageProps {
  /**
   * Called when the user saves the design.
   * Receives the flat JPEG data-URL to pass as `designUrl` to ShirtViewer.
   */
  onSave?: (dataUrl: string) => void;
}

export default function DesignerPage({ onSave }: DesignerPageProps) {
    const { url } = usePage();

    const searchParams = new URLSearchParams(
        url.includes("?") ? url.split("?")[1] : "",
    );

    const campaignId = searchParams.get("id");
    const campaignName = searchParams.get("campaign") ?? "Your Campaign";

    const storageKey = campaignId
        ? `tailorease_design_url_${campaignId}`
        : "tailorease_design_url";

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    state,
    stageRef,
    selectedElement,
    addText,
    addShape,
    addSticker,
    addImage,
    updateElement,
    updateElementLive,
    deleteElement,
    selectElement,
    setShirtColor,
    setActiveView,
    bringForward,
    sendBackward,
    duplicateElement,
    undo,
    redo,
    exportToDataURL,
    canUndo,
    canRedo,
  } = useDesigner();

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();

        if (e.shiftKey) {
            redo();
        } else {
            undo()
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }

      if (!isInput && (e.key === "Delete" || e.key === "Backspace") && state.selectedId) {
        e.preventDefault();
        deleteElement(state.selectedId);
      }

      if (!isInput && (e.metaKey || e.ctrlKey) && e.key === "d" && state.selectedId) {
        e.preventDefault();
        duplicateElement(state.selectedId);
      }

      if (!isInput && e.key === "Escape") {
        selectElement(null);
      }
    };
    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, deleteElement, duplicateElement, selectElement, state.selectedId]);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Export as JPEG (download) ────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const dataUrl = exportToDataURL("image/jpeg");

    if (!dataUrl) {
      showToast("Nothing to export yet.");

      return;
    }

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `tailorease-design-${Date.now()}.jpg`;
    a.click();
    showToast("Design exported as JPEG.");
  }, [exportToDataURL, showToast]);

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  // ── Save design (pass back to order form) ────────────────────────────────
  const handleSave = useCallback(async () => {
    const dataUrl = exportToDataURL("image/jpeg");

    if (!dataUrl) {
      showToast("Add some elements before saving.");

      return;
    }

    setIsSaving(true);

    // In a real app: upload dataUrl to your server and get back a URL.
    // Here we store in sessionStorage and navigate back.
    try {
        sessionStorage.setItem(storageKey, dataUrl);

        // If a callback was passed (when used as a modal/embedded), call it.
        if (onSave) {
          onSave(dataUrl);
          showToast("Design saved!");

          return;
        }

        handleBack();
    } catch (error) {
        console.error("Unable to save design: ", error);
        showToast("Something went wrong while saving. Please try again.")
    } finally {
        setIsSaving(false);
    }

  }, [exportToDataURL, storageKey, onSave, handleBack, showToast]);

  // ── Commit element update (also pushes to history) ───────────────────────
  const handleUpdateCommit = useCallback(
    (id: string, attrs: Partial<DesignElement>) => {
      updateElement(id, attrs);
    },
    [updateElement]
  );

  return (
    <>
        <Head title={`${campaignName} - Apparel Designer`} />

        <div className="designer-root">
        <h1 className="sr-only">TailorEase Apparel Designer</h1>

        <Topbar
            campaignName={campaignName}
            activeView={state.activeView}
            canUndo={canUndo}
            canRedo={canRedo}
            onBack={handleBack}
            onViewChange={setActiveView}
            onUndo={undo}
            onRedo={redo}
            onExport={handleExport}
            onSave={handleSave}
            isSaving={isSaving}
        />

        <div className="designer-workspace">
            <LeftSidebar
            shirtColor={state.shirtColor}
            onColorChange={setShirtColor}
            onAddText={addText}
            onAddShape={addShape}
            onAddSticker={addSticker}
            onAddImage={addImage}
            />

            <main className="designer-canvas-area" role="main" aria-label="Design canvas">
            <DesignCanvas
                stageRef={stageRef}
                elements={state.elements}
                selectedId={state.selectedId}
                shirtColor={state.shirtColor}
                activeView={state.activeView}
                onSelect={selectElement}
                onUpdateLive={updateElementLive}
                onUpdateCommit={handleUpdateCommit}
                />

            {/* Keyboard shortcut hints */}
            <div className="canvas-hints" aria-hidden="true">
                <span>Del — delete</span>
                <span>Ctrl+D — duplicate</span>
                <span>Ctrl+Z — undo</span>
                <span>Esc — deselect</span>
            </div>
            </main>

            <RightSidebar
            elements={state.elements}
            selectedElement={selectedElement}
            selectedId={state.selectedId}
            onUpdate={updateElement}
            onDelete={deleteElement}
            onDuplicate={duplicateElement}
            onBringForward={bringForward}
            onSendBackward={sendBackward}
            onSelect={selectElement}
            />
        </div>

        {/* Toast notification */}
        {toast && (
            <div className="designer-toast" role="status" aria-live="polite">
            {toast}
            </div>
        )}
        </div>
    </>
  );
}
