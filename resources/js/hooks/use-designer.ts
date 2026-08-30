import { useState, useCallback, useRef } from "react";
import type {
  DesignElement,
  DesignerState,
  TextElement,
  ImageElement,
  ShapeElement,
  StickerElement,
  LineElement,
  ShapeType,
  ShirtView,
  ViewMode,
  ProductType,
  PrintZone,
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
    viewMode: "split", // Default to split view so 3D shirt is visible immediately!
    productType: "tshirt",
    printZone: "front",
    history: [[]],
    historyIndex: 0,
    zoom: 1,
    panX: 0,
    panY: 0,
    showGrid: false,
    snapEnabled: true,
    live3dDataUrl: null,
  });

  // ── History ──────────────────────────────────────────────────────────────
  const pushHistory = useCallback(
    (elements: DesignElement[]) => {
      setState((prev) => {
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push([...elements]);

        return {
          ...prev,
          elements,
          history: newHistory.slice(-50),
          historyIndex: Math.min(newHistory.length - 1, 49),
        };
      });
    },
    []
  );

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex <= 0) return prev;

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

  // ── Add Elements ─────────────────────────────────────────────────────────
  const addText = useCallback((initialText = "YOUR TEXT HERE") => {
    const pos = clampToZone(150, 150, 140, 40);
    const el: TextElement = {
      id: generateId(),
      type: "text",
      name: "Text",
      x: pos.x,
      y: pos.y,
      width: 140,
      height: 40,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      scaleX: 1,
      scaleY: 1,
      text: initialText,
      fontSize: 22,
      fontFamily: "Inter",
      fontStyle: "normal",
      fontWeight: "bold",
      textDecoration: "",
      fill: "#ffffff",
      align: "center",
      letterSpacing: 1,
      curvature: 0,
      stroke: "",
      strokeWidth: 0,
      shadowColor: "rgba(0,0,0,0.5)",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      textTransform: "none",
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
        name: shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
        x: pos.x,
        y: pos.y,
        width: 90,
        height: 90,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        scaleX: 1,
        scaleY: 1,
        shapeType,
        fill: "#6366f1",
        stroke: "#ffffff",
        strokeWidth: 0,
        cornerRadius: shapeType === "rect" ? 8 : 0,
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
        scaleX: 1,
        scaleY: 1,
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
        const maxW = 150;
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
          scaleX: 1,
          scaleY: 1,
        };
        const next = [...state.elements, el];
        pushHistory(next);
        setState((prev) => ({ ...prev, selectedId: el.id }));
      };
      img.src = src;
    },
    [state.elements, pushHistory]
  );

  const addLine = useCallback(() => {
    const pos = clampToZone(150, 180, 100, 4);
    const el: LineElement = {
      id: generateId(),
      type: "line",
      name: "Line",
      x: pos.x,
      y: pos.y,
      width: 100,
      height: 4,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      scaleX: 1,
      scaleY: 1,
      points: [0, 0, 100, 0],
      stroke: "#6366f1",
      strokeWidth: 4,
      lineCap: "round",
      lineJoin: "round",
      dash: [],
    };
    const next = [...state.elements, el];
    pushHistory(next);
    setState((prev) => ({ ...prev, selectedId: el.id }));
  }, [state.elements, pushHistory]);

  // ── Load Preset Full Templates ───────────────────────────────────────────
  const loadFullTemplate = useCallback((templateKey: string) => {
    let templateElements: DesignElement[] = [];

    if (templateKey === "esports") {
      templateElements = [
        {
          id: generateId(),
          type: "shape",
          name: "Shield",
          shapeType: "triangle",
          x: 155,
          y: 110,
          width: 90,
          height: 90,
          rotation: 180,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
          fill: "#6366f1",
          stroke: "#ffffff",
          strokeWidth: 2,
        },
        {
          id: generateId(),
          type: "sticker",
          name: "Crown",
          emoji: "👑",
          x: 170,
          y: 115,
          width: 60,
          height: 60,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
        },
        {
          id: generateId(),
          type: "text",
          name: "Title",
          text: "ESPORTS CHAMPIONS",
          fontSize: 16,
          fontFamily: "Bebas Neue",
          fontStyle: "normal",
          fontWeight: "bold",
          textDecoration: "",
          fill: "#ffffff",
          align: "center",
          letterSpacing: 2,
          x: 120,
          y: 205,
          width: 160,
          height: 30,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
        },
        {
          id: generateId(),
          type: "text",
          name: "Year",
          text: "— 2025 SEASON —",
          fontSize: 10,
          fontFamily: "Inter",
          fontStyle: "normal",
          fontWeight: "bold",
          textDecoration: "",
          fill: "#818cf8",
          align: "center",
          letterSpacing: 1.5,
          x: 130,
          y: 235,
          width: 140,
          height: 20,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
        },
      ];
    } else if (templateKey === "varsity") {
      templateElements = [
        {
          id: generateId(),
          type: "text",
          name: "College Arc",
          text: "TAILOREASE ATHLETICS",
          fontSize: 18,
          fontFamily: "Oswald",
          fontStyle: "normal",
          fontWeight: "bold",
          textDecoration: "",
          fill: "#fbbf24",
          align: "center",
          letterSpacing: 2,
          x: 115,
          y: 110,
          width: 170,
          height: 40,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
          stroke: "#000000",
          strokeWidth: 1,
        },
        {
          id: generateId(),
          type: "sticker",
          name: "Trophy",
          emoji: "🏆",
          x: 170,
          y: 155,
          width: 60,
          height: 60,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
        },
        {
          id: generateId(),
          type: "text",
          name: "Number",
          text: "98",
          fontSize: 42,
          fontFamily: "Bebas Neue",
          fontStyle: "normal",
          fontWeight: "bold",
          textDecoration: "",
          fill: "#ffffff",
          align: "center",
          letterSpacing: 1,
          x: 150,
          y: 215,
          width: 100,
          height: 50,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
        },
      ];
    } else if (templateKey === "cyberpunk") {
      templateElements = [
        {
          id: generateId(),
          type: "shape",
          name: "Background Box",
          shapeType: "rect",
          fill: "#181825",
          stroke: "#f43f5e",
          strokeWidth: 2,
          x: 125,
          y: 120,
          width: 150,
          height: 120,
          rotation: 0,
          opacity: 0.9,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
          cornerRadius: 4,
        },
        {
          id: generateId(),
          type: "text",
          name: "Cyber Text",
          text: "CYBER CITY",
          fontSize: 22,
          fontFamily: "Montserrat",
          fontStyle: "normal",
          fontWeight: "bold",
          textDecoration: "",
          fill: "#38bdf8",
          align: "center",
          letterSpacing: 3,
          x: 130,
          y: 140,
          width: 140,
          height: 30,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
        },
        {
          id: generateId(),
          type: "sticker",
          name: "Fire",
          emoji: "🔥",
          x: 175,
          y: 170,
          width: 50,
          height: 50,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
        },
      ];
    } else if (templateKey === "vintage") {
      templateElements = [
        {
          id: generateId(),
          type: "shape",
          name: "Circle Frame",
          shapeType: "circle",
          fill: "transparent",
          stroke: "#fbbf24",
          strokeWidth: 3,
          x: 150,
          y: 120,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
        },
        {
          id: generateId(),
          type: "sticker",
          name: "Compass",
          emoji: "🎯",
          x: 170,
          y: 140,
          width: 60,
          height: 60,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
        },
        {
          id: generateId(),
          type: "text",
          name: "Explore Text",
          text: "WILD EXPLORER",
          fontSize: 15,
          fontFamily: "Playfair Display",
          fontStyle: "italic",
          fontWeight: "bold",
          textDecoration: "",
          fill: "#fef3c7",
          align: "center",
          letterSpacing: 2,
          x: 125,
          y: 230,
          width: 150,
          height: 30,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          scaleX: 1,
          scaleY: 1,
        },
      ];
    }

    if (templateElements.length > 0) {
      pushHistory(templateElements);
      setState((prev) => ({ ...prev, selectedId: templateElements[0]?.id ?? null }));
    }
  }, [pushHistory]);

  // ── Update Elements ──────────────────────────────────────────────────────
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

  // ── View Mode & Product Toggles ──────────────────────────────────────────
  const setViewMode = useCallback((mode: ViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const setProductType = useCallback((type: ProductType) => {
    setState((prev) => ({ ...prev, productType: type }));
  }, []);

  const setPrintZone = useCallback((zone: PrintZone) => {
    setState((prev) => ({ ...prev, printZone: zone }));
  }, []);

  const setShirtColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, shirtColor: color }));
  }, []);

  const setActiveView = useCallback((view: ShirtView) => {
    setState((prev) => ({ ...prev, selectedId: null, activeView: view }));
  }, []);

  // ── Layer ordering ───────────────────────────────────────────────────────
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

  const bringToFront = useCallback(
    (id: string) => {
      const idx = state.elements.findIndex((el) => el.id === id);
      if (idx === -1 || idx === state.elements.length - 1) return;

      const next = [...state.elements];
      const [el] = next.splice(idx, 1);
      next.push(el);
      pushHistory(next);
    },
    [state.elements, pushHistory]
  );

  const sendToBack = useCallback(
    (id: string) => {
      const idx = state.elements.findIndex((el) => el.id === id);
      if (idx === -1 || idx === 0) return;

      const next = [...state.elements];
      const [el] = next.splice(idx, 1);
      next.unshift(el);
      pushHistory(next);
    },
    [state.elements, pushHistory]
  );

  const reorderElements = useCallback(
    (newElements: DesignElement[]) => {
      pushHistory(newElements);
    },
    [pushHistory]
  );

  // ── Duplicate & Flips ─────────────────────────────────────────────────────
  const duplicateElement = useCallback(
    (id: string) => {
      const el = state.elements.find((e) => e.id === id);
      if (!el) return;

      const clone: DesignElement = {
        ...el,
        id: generateId(),
        x: el.x + 15,
        y: el.y + 15,
        name: el.name + " copy",
      };
      const next = [...state.elements, clone];
      pushHistory(next);
      setState((prev) => ({ ...prev, selectedId: clone.id }));
    },
    [state.elements, pushHistory]
  );

  const flipHorizontal = useCallback(
    (id: string) => {
      const el = state.elements.find((e) => e.id === id);
      if (!el) return;
      const next = state.elements.map((e) =>
        e.id === id ? ({ ...e, scaleX: (e.scaleX || 1) * -1 } as DesignElement) : e
      );
      pushHistory(next);
    },
    [state.elements, pushHistory]
  );

  const flipVertical = useCallback(
    (id: string) => {
      const el = state.elements.find((e) => e.id === id);
      if (!el) return;
      const next = state.elements.map((e) =>
        e.id === id ? ({ ...e, scaleY: (e.scaleY || 1) * -1 } as DesignElement) : e
      );
      pushHistory(next);
    },
    [state.elements, pushHistory]
  );

  const toggleLock = useCallback(
    (id: string) => {
      const next = state.elements.map((el) =>
        el.id === id ? ({ ...el, locked: !el.locked } as DesignElement) : el
      );
      pushHistory(next);
    },
    [state.elements, pushHistory]
  );

  const toggleVisibility = useCallback(
    (id: string) => {
      const next = state.elements.map((el) =>
        el.id === id ? ({ ...el, visible: !el.visible } as DesignElement) : el
      );
      pushHistory(next);
    },
    [state.elements, pushHistory]
  );

  const alignElement = useCallback(
    (id: string, alignment: "left" | "centerH" | "right" | "top" | "centerV" | "bottom") => {
      const zone = DEFAULT_ZONE;
      const next = state.elements.map((el) => {
        if (el.id !== id) return el;
        const updated = { ...el };
        switch (alignment) {
          case "left":
            updated.x = zone.x;
            break;
          case "centerH":
            updated.x = zone.x + (zone.width - el.width) / 2;
            break;
          case "right":
            updated.x = zone.x + zone.width - el.width;
            break;
          case "top":
            updated.y = zone.y;
            break;
          case "centerV":
            updated.y = zone.y + (zone.height - el.height) / 2;
            break;
          case "bottom":
            updated.y = zone.y + zone.height - el.height;
            break;
        }
        return updated as DesignElement;
      });
      pushHistory(next);
    },
    [state.elements, pushHistory]
  );

  const nudgeElement = useCallback(
    (id: string, dx: number, dy: number) => {
      const next = state.elements.map((el) =>
        el.id === id ? ({ ...el, x: el.x + dx, y: el.y + dy } as DesignElement) : el
      );
      pushHistory(next);
    },
    [state.elements, pushHistory]
  );

  const selectAll = useCallback(() => {
    if (state.elements.length > 0) {
      setState((prev) => ({ ...prev, selectedId: prev.elements[prev.elements.length - 1]?.id ?? null }));
    }
  }, [state.elements]);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoom: Math.max(0.25, Math.min(4, zoom)) }));
  }, []);

  const zoomIn = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: Math.min(4, prev.zoom + 0.15) }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: Math.max(0.25, prev.zoom - 0.15) }));
  }, []);

  const fitToCanvas = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: 1, panX: 0, panY: 0 }));
  }, []);

  const toggleGrid = useCallback(() => {
    setState((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const toggleSnap = useCallback(() => {
    setState((prev) => ({ ...prev, snapEnabled: !prev.snapEnabled }));
  }, []);

  const renameElement = useCallback(
    (id: string, name: string) => {
      const next = state.elements.map((el) =>
        el.id === id ? ({ ...el, name } as DesignElement) : el
      );
      setState((prev) => ({ ...prev, elements: next }));
    },
    [state.elements]
  );

  const updateLive3dTexture = useCallback((dataUrl: string) => {
    setState((prev) => ({ ...prev, live3dDataUrl: dataUrl }));
  }, []);

  const exportToDataURL = useCallback(
    (mimeType: "image/jpeg" | "image/png" = "image/jpeg"): string | null => {
      if (!stageRef.current) return null;

      const stage = stageRef.current;
      stage.find("Transformer").forEach((t: any) => t.hide());
      const dataUrl = stage.toDataURL({ mimeType, quality: 0.95 });
      stage.find("Transformer").forEach((t: any) => t.show());

      return dataUrl;
    },
    []
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
    addLine,
    loadFullTemplate,
    updateElement,
    updateElementLive,
    deleteElement,
    selectElement,
    renameElement,
    setViewMode,
    setProductType,
    setPrintZone,
    setShirtColor,
    setActiveView,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    reorderElements,
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
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
  };
}
