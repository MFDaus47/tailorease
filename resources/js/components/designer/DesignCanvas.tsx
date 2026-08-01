import { useEffect, useRef, useCallback } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  RegularPolygon,
  Star,
  Text,
  Image as KonvaImage,
  Group,
  Line,
  Transformer,
} from "react-konva";
import useImage from "use-image";
import type {
  DesignElement,
  TextElement,
  ImageElement,
  ShapeElement,
  StickerElement,
  ShirtView,
} from "../../types/designer";

// ── Shirt silhouette paths per view ─────────────────────────────────────────

const SHIRT_PATHS = {
  front: [
    // body
    { points: [80, 30, 50, 75, 10, 62, 25, 145, 55, 145, 55, 360, 345, 360, 345, 145, 375, 145, 390, 62, 350, 75, 320, 30] },
    // collar
    { points: [160, 30, 145, 70, 200, 85, 255, 70, 240, 30], isCollar: true },
  ],
  back: [
    { points: [80, 30, 50, 75, 10, 62, 25, 145, 55, 145, 55, 360, 345, 360, 345, 145, 375, 145, 390, 62, 350, 75, 320, 30] },
    { points: [160, 30, 145, 70, 200, 65, 255, 70, 240, 30], isCollar: true },
  ],
};

const DESIGN_ZONE = { x: 110, y: 80, width: 180, height: 220 };
const STAGE_WIDTH = 400;
const STAGE_HEIGHT = 420;

// ── Individual element renderers ─────────────────────────────────────────────

function KonvaTextElement({
  el,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  transformerRef,
}: {
  el: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (attrs: Partial<TextElement>) => void;
  transformerRef: React.RefObject<any>;
}) {
  const nodeRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && nodeRef.current) {
      transformerRef.current.nodes([nodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, transformerRef]);

  return (
    <Text
      ref={nodeRef}
      x={el.x}
      y={el.y}
      width={el.width}
      text={el.text}
      fontSize={el.fontSize}
      fontFamily={el.fontFamily}
      fontStyle={`${el.fontWeight} ${el.fontStyle}`}
      textDecoration={el.textDecoration}
      fill={el.fill}
      align={el.align}
      letterSpacing={el.letterSpacing}
      rotation={el.rotation}
      opacity={el.opacity}
      visible={el.visible}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={(e) => {
        const node = e.target;
        onTransformEnd({
          x: node.x(),
          y: node.y(),
          width: Math.max(40, node.width() * node.scaleX()),
          rotation: node.rotation(),
          opacity: node.opacity(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}

function KonvaImageElement({
  el,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  transformerRef,
}: {
  el: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (attrs: Partial<ImageElement>) => void;
  transformerRef: React.RefObject<any>;
}) {
  const nodeRef = useRef<any>(null);
  const [image] = useImage(el.src, "anonymous");

  useEffect(() => {
    if (isSelected && transformerRef.current && nodeRef.current) {
      transformerRef.current.nodes([nodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, transformerRef]);

  return (
    <KonvaImage
      ref={nodeRef}
      image={image}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation}
      opacity={el.opacity}
      visible={el.visible}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={(e) => {
        const node = e.target;
        onTransformEnd({
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * node.scaleX()),
          height: Math.max(20, node.height() * node.scaleY()),
          rotation: node.rotation(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}

function KonvaShapeElement({
  el,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  transformerRef,
}: {
  el: ShapeElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (attrs: Partial<ShapeElement>) => void;
  transformerRef: React.RefObject<any>;
}) {
  const nodeRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && nodeRef.current) {
      transformerRef.current.nodes([nodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, transformerRef]);

  const commonProps = {
    ref: nodeRef,
    x: el.x + el.width / 2,
    y: el.y + el.height / 2,
    fill: el.fill,
    stroke: el.stroke,
    strokeWidth: el.strokeWidth,
    rotation: el.rotation,
    opacity: el.opacity,
    visible: el.visible,
    draggable: !el.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: any) =>
      onDragEnd(e.target.x() - el.width / 2, e.target.y() - el.height / 2),
    onTransformEnd: (e: any) => {
      const node = e.target;
      onTransformEnd({
        x: node.x() - (el.width * node.scaleX()) / 2,
        y: node.y() - (el.height * node.scaleY()) / 2,
        width: Math.max(20, el.width * node.scaleX()),
        height: Math.max(20, el.height * node.scaleY()),
        rotation: node.rotation(),
      });
      node.scaleX(1);
      node.scaleY(1);
    },
  };

  if (el.shapeType === "circle") {
    return <Circle {...commonProps} radius={Math.min(el.width, el.height) / 2} />;
  }

  if (el.shapeType === "triangle") {
    return <RegularPolygon {...commonProps} sides={3} radius={Math.min(el.width, el.height) / 2} />;
  }

  if (el.shapeType === "star") {
    return (
      <Star
        {...commonProps}
        numPoints={5}
        innerRadius={Math.min(el.width, el.height) / 4}
        outerRadius={Math.min(el.width, el.height) / 2}
      />
    );
  }
  // rect

  return (
    <Rect
      ref={nodeRef}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      fill={el.fill}
      stroke={el.stroke}
      strokeWidth={el.strokeWidth}
      rotation={el.rotation}
      opacity={el.opacity}
      visible={el.visible}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={(e) => {
        const node = e.target;
        onTransformEnd({
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * node.scaleX()),
          height: Math.max(20, node.height() * node.scaleY()),
          rotation: node.rotation(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}

function KonvaStickerElement({
  el,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  transformerRef,
}: {
  el: StickerElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (attrs: Partial<StickerElement>) => void;
  transformerRef: React.RefObject<any>;
}) {
  const nodeRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && nodeRef.current) {
      transformerRef.current.nodes([nodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, transformerRef]);

  return (
    <Text
      ref={nodeRef}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      text={el.emoji}
      fontSize={el.width * 0.75}
      align="center"
      verticalAlign="middle"
      rotation={el.rotation}
      opacity={el.opacity}
      visible={el.visible}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={(e) => {
        const node = e.target;
        const newW = Math.max(30, el.width * node.scaleX());
        onTransformEnd({
          x: node.x(),
          y: node.y(),
          width: newW,
          height: newW,
          rotation: node.rotation(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}

// ── Main canvas ──────────────────────────────────────────────────────────────

interface DesignCanvasProps {
  stageRef: React.RefObject<any>;
  elements: DesignElement[];
  selectedId: string | null;
  shirtColor: string;
  activeView: ShirtView;
  onSelect: (id: string | null) => void;
  onUpdateLive: (id: string, attrs: Partial<DesignElement>) => void;
  onUpdateCommit: (id: string, attrs: Partial<DesignElement>) => void;
}

export default function DesignCanvas({
  stageRef,
  elements,
  selectedId,
  shirtColor,
  activeView,
  onSelect,
  onUpdateLive,
  onUpdateCommit,
}: DesignCanvasProps) {
  const transformerRef = useRef<any>(null);

  // Deselect when clicking empty space
  const handleStageClick = useCallback(
    (e: any) => {
      if (e.target === e.target.getStage() || e.target.name() === "shirt-body") {
        onSelect(null);

        if (transformerRef.current) {
          transformerRef.current.nodes([]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      }
    },
    [onSelect]
  );

  // Clear transformer when nothing selected
  useEffect(() => {
    if (!selectedId && transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  const paths = SHIRT_PATHS[activeView];

  // Shade for sleeve/side areas
  const bodyColor = shirtColor;

  return (
    <Stage
      ref={stageRef}
      width={STAGE_WIDTH}
      height={STAGE_HEIGHT}
      onClick={handleStageClick}
      onTap={handleStageClick}
      style={{ cursor: "default" }}
    >
      {/* ── Shirt layer ── */}
      <Layer>
        {/* Main shirt body */}
        <Line
          name="shirt-body"
          points={paths[0].points}
          closed
          fill={bodyColor}
          stroke={lightenColor(bodyColor, 30)}
          strokeWidth={1}
          listening={true}
        />
        {/* Collar */}
        <Line
          name="shirt-body"
          points={paths[1].points}
          closed
          fill={darkenColor(bodyColor, 15)}
          stroke={lightenColor(bodyColor, 20)}
          strokeWidth={0.5}
          listening={true}
        />
        {/* Sleeve fold lines for realism */}
        <Line
          points={[25, 145, 55, 145]}
          stroke={darkenColor(bodyColor, 20)}
          strokeWidth={0.8}
          opacity={0.6}
        />
        <Line
          points={[345, 145, 375, 145]}
          stroke={darkenColor(bodyColor, 20)}
          strokeWidth={0.8}
          opacity={0.6}
        />

        {/* Design zone boundary */}
        <Rect
          x={DESIGN_ZONE.x}
          y={DESIGN_ZONE.y}
          width={DESIGN_ZONE.width}
          height={DESIGN_ZONE.height}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1}
          dash={[5, 4]}
          fill="rgba(255,255,255,0.04)"
          listening={false}
        />
        <Text
          x={DESIGN_ZONE.x}
          y={DESIGN_ZONE.y + DESIGN_ZONE.height + 6}
          width={DESIGN_ZONE.width}
          text="design zone"
          fontSize={10}
          fill="rgba(255,255,255,0.3)"
          align="center"
          listening={false}
        />
      </Layer>

      {/* ── Elements layer ── */}
      <Layer>
        {elements.map((el) => {
          const isSelected = el.id === selectedId;
          const commonProps = {
            isSelected,
            onSelect: () => onSelect(el.id),
            onDragEnd: (x: number, y: number) => onUpdateCommit(el.id, { x, y } as any),
            transformerRef,
          };

          if (el.type === "text") {
            return (
              <KonvaTextElement
                key={el.id}
                el={el as TextElement}
                onTransformEnd={(attrs) => onUpdateCommit(el.id, attrs as any)}
                {...commonProps}
              />
            );
          }

          if (el.type === "image") {
            return (
              <KonvaImageElement
                key={el.id}
                el={el as ImageElement}
                onTransformEnd={(attrs) => onUpdateCommit(el.id, attrs as any)}
                {...commonProps}
              />
            );
          }

          if (el.type === "shape") {
            return (
              <KonvaShapeElement
                key={el.id}
                el={el as ShapeElement}
                onTransformEnd={(attrs) => onUpdateCommit(el.id, attrs as any)}
                {...commonProps}
              />
            );
          }

          if (el.type === "sticker") {
            return (
              <KonvaStickerElement
                key={el.id}
                el={el as StickerElement}
                onTransformEnd={(attrs) => onUpdateCommit(el.id, attrs as any)}
                {...commonProps}
              />
            );
          }

          return null;
        })}

        <Transformer
          ref={transformerRef}
          rotateEnabled
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "middle-left",
            "middle-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;

            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
}

// ── Color helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function lightenColor(hex: string, amount: number): string {
  try {
    const [r, g, b] = hexToRgb(hex);

    return rgbToHex(r + amount, g + amount, b + amount);
  } catch {
    return hex;
  }
}

function darkenColor(hex: string, amount: number): string {
  try {
    const [r, g, b] = hexToRgb(hex);

    return rgbToHex(r - amount, g - amount, b - amount);
  } catch {
    return hex;
  }
}
