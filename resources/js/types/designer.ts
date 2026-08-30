export type ElementType = "text" | "image" | "shape" | "sticker" | "line";

export type ShapeType = "rect" | "circle" | "triangle" | "star" | "diamond" | "hexagon";

export type ViewMode = "2d" | "split" | "3d";

export type ProductType = "tshirt" | "hoodie" | "polo" | "jersey";

export type PrintZone = "front" | "back" | "left_chest" | "sleeve_left" | "sleeve_right";

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
  scaleX: number;
  scaleY: number;
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
  lineHeight?: number;
  curvature?: number; // -100 to 100
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  textTransform?: "none" | "uppercase" | "lowercase";
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
  cornerRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
}

export interface StickerElement extends BaseElement {
  type: "sticker";
  emoji: string;
}

export interface LineElement extends BaseElement {
  type: "line";
  points: number[];
  stroke: string;
  strokeWidth: number;
  lineCap: "butt" | "round" | "square";
  lineJoin: "miter" | "round" | "bevel";
  dash: number[];
}

export type DesignElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | StickerElement
  | LineElement;

export interface DesignZone {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export type ShirtView = "front" | "back";

export interface AlignmentGuide {
  orientation: "horizontal" | "vertical";
  position: number;
  type: "center" | "edge" | "element";
}

export interface DesignerState {
  elements: DesignElement[];
  selectedId: string | null;
  shirtColor: string;
  activeView: ShirtView;
  viewMode: ViewMode;
  productType: ProductType;
  printZone: PrintZone;
  history: DesignElement[][];
  historyIndex: number;
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  snapEnabled: boolean;
  live3dDataUrl: string | null;
}
