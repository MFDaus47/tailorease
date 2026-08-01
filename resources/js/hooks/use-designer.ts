import { useState, useCallback, useRef } from "react";
import type {
  DesignElement,
  DesignerState,
  TextElement,
  ImageElement,
  ShapeElement,
  StickerElement,
  ShapeType,
  ShirtView,
} from "../types/designer";

const DEFAULT_ZONE = { x: 110, y: 80, width: 180, height: 220 };

function generateId() {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function clampToZone(
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number } {
  const cx = Math.max(DEFAULT_ZONE.x, Math.min(x, DEFAULT_ZONE.x + DEFAULT_ZONE.width - width));
  const cy = Math.max(DEFAULT_ZONE.y, Math.min(y, DEFAULT_ZONE.y + DEFAULT_ZONE.height - height));

  return { x: cx, y: cy };
}

export function useDesigner() {
  const stageRef = useRef<any>(null);

  const [state, setState] = useState<DesignerState>({
    elements: [],
    selectedId: null,
    shirtColor: "#1a1a2e",
    activeView: "front",
    history: [[]],
    historyIndex: 0,
  });

  const pushHistory = useCallback(
    (elements: DesignElement[]) => {
      setState((prev) => {
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push([...elements]);

        return {
          ...prev,
          elements,
          history: newHistory.slice(-30), // keep last 30 states
          historyIndex: Math.min(newHistory.length - 1, 29),
        };
      });
    },
    []
  );

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex <= 0) {return prev};

      const newIndex = prev.historyIndex - 1;

      return {
        ...prev,
        elements: [...prev.history[newIndex]],
        historyIndex: newIndex,
        selectedId: null,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;

      const newIndex = prev.historyIndex + 1;

      return {
        ...prev,
        elements: [...prev.history[newIndex]],
        historyIndex: newIndex,
        selectedId: null,
      };
    });
  }, []);

  const addText = useCallback(() => {
    const pos = clampToZone(160, 150, 120, 40);
    const el: TextElement = {
      id: generateId(),
      type: "text",
      name: "Text",
      x: pos.x,
      y: pos.y,
      width: 120,
      height: 40,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      text: "Your text here",
      fontSize: 20,
      fontFamily: "Inter",
      fontStyle: "normal",
      fontWeight: "bold",
      textDecoration: "",
      fill: "#ffffff",
      align: "center",
      letterSpacing: 0,
    };
    const next = [...state.elements, el];
    pushHistory(next);
    setState((prev) => ({ ...prev, selectedId: el.id }));
  }, [state.elements, pushHistory]);

  const addShape = useCallback(
    (shapeType: ShapeType) => {
      const pos = clampToZone(155, 145, 90, 90);
      const el: ShapeElement = {
        id: generateId(),
        type: "shape",
        name: shapeType,
        x: pos.x,
        y: pos.y,
        width: 90,
        height: 90,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        shapeType,
        fill: "#ffffff",
        stroke: "transparent",
        strokeWidth: 0,
      };
      const next = [...state.elements, el];
      pushHistory(next);
      setState((prev) => ({ ...prev, selectedId: el.id }));
    },
    [state.elements, pushHistory]
  );

  const addSticker = useCallback(
    (emoji: string) => {
      const pos = clampToZone(160, 155, 60, 60);
      const el: StickerElement = {
        id: generateId(),
        type: "sticker",
        name: `Sticker ${emoji}`,
        x: pos.x,
        y: pos.y,
        width: 60,
        height: 60,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        emoji,
      };
      const next = [...state.elements, el];
      pushHistory(next);
      setState((prev) => ({ ...prev, selectedId: el.id }));
    },
    [state.elements, pushHistory]
  );

  const addImage = useCallback(
    (src: string, name: string) => {
      const img = new window.Image();
      img.onload = () => {
        const maxW = 160;
        const ratio = img.height / img.width;
        const w = Math.min(maxW, img.width);
        const h = w * ratio;
        const pos = clampToZone(130, 130, w, h);
        const el: ImageElement = {
          id: generateId(),
          type: "image",
          name,
          src,
          x: pos.x,
          y: pos.y,
          width: w,
          height: h,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
        };
        const next = [...state.elements, el];
        pushHistory(next);
        setState((prev) => ({ ...prev, selectedId: el.id }));
      };
      img.src = src;
    },
    [state.elements, pushHistory]
  );

  const updateElement = useCallback(
    (id: string, updates: Partial<DesignElement>) => {
      const next = state.elements.map((el) =>
        el.id === id ? ({ ...el, ...updates } as DesignElement) : el
      );
      pushHistory(next);
    },
    [state.elements, pushHistory]
  );

  const updateElementLive = useCallback((id: string, updates: Partial<DesignElement>) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? ({ ...el, ...updates } as DesignElement) : el
      ),
    }));
  }, []);

  const deleteElement = useCallback(
    (id: string) => {
      const next = state.elements.filter((el) => el.id !== id);
      pushHistory(next);
      setState((prev) => ({ ...prev, selectedId: null }));
    },
    [state.elements, pushHistory]
  );

  const selectElement = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedId: id }));
  }, []);

  const setShirtColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, shirtColor: color }));
  }, []);

  const setActiveView = useCallback((view: ShirtView) => {
    setState((prev) => ({ ...prev, selectedId: null, activeView: view }));
  }, []);

  const bringForward = useCallback(
    (id: string) => {
      const idx = state.elements.findIndex((el) => el.id === id);

      if (idx === state.elements.length - 1) return;

      const next = [...state.elements];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      pushHistory(next);
    },
    [state.elements, pushHistory]
  );

  const sendBackward = useCallback(
    (id: string) => {
      const idx = state.elements.findIndex((el) => el.id === id);

      if (idx === 0) return;

      const next = [...state.elements];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      pushHistory(next);
    },
    [state.elements, pushHistory]
  );

  const duplicateElement = useCallback(
    (id: string) => {
      const el = state.elements.find((e) => e.id === id);

      if (!el) return;

      const clone: DesignElement = {
        ...el,
        id: generateId(),
        x: el.x + 20,
        y: el.y + 20,
        name: el.name + " copy",
      };
      const next = [...state.elements, clone];
      pushHistory(next);
      setState((prev) => ({ ...prev, selectedId: clone.id }));
    },
    [state.elements, pushHistory]
  );

  const exportToDataURL = useCallback(
    (mimeType: "image/jpeg" | "image/png" = "image/jpeg"): string | null => {
      if (!stageRef.current) return null;

      const stage = stageRef.current;
      // Temporarily deselect to hide transformer
      const prevSelected = state.selectedId;
      stage.find("Transformer").forEach((t: any) => t.hide());
      const dataUrl = stage.toDataURL({ mimeType, quality: 0.92 });
      stage.find("Transformer").forEach((t: any) => t.show());

      return dataUrl;
    },
    [state.selectedId]
  );

  const selectedElement = state.elements.find((el) => el.id === state.selectedId) ?? null;

  return {
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
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
  };
}
