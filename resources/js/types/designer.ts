export type ElementType = "text" | "image" | "shape" | "sticker";

export type ShapeType = "rect" | "circle" | "triangle" | "star";

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  name: string;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: "normal" | "italic";
  fontWeight: "normal" | "bold";
  textDecoration: "" | "underline";
  fill: string;
  align: "left" | "center" | "right";
  letterSpacing: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface StickerElement extends BaseElement {
  type: "sticker";
  emoji: string;
}

export type DesignElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | StickerElement;

export interface DesignZone {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export type ShirtView = "front" | "back";

export interface DesignerState {
  elements: DesignElement[];
  selectedId: string | null;
  shirtColor: string;
  activeView: ShirtView;
  history: DesignElement[][];
  historyIndex: number;
}
