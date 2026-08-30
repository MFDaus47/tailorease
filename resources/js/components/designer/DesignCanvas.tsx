import { useEffect, useRef, useCallback, useState } from "react";
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
  LineElement,
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
  onDragMove,
  onTransformEnd,
  transformerRef,
}: {
  el: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onDragMove?: (x: number, y: number) => void;
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

  const displayText =
    el.textTransform === "uppercase"
      ? el.text.toUpperCase()
      : el.textTransform === "lowercase"
      ? el.text.toLowerCase()
      : el.text;

  return (
    <Text
      ref={nodeRef}
      x={el.x}
      y={el.y}
      width={el.width}
      text={displayText}
      fontSize={el.fontSize}
      fontFamily={el.fontFamily}
      fontStyle={`${el.fontWeight} ${el.fontStyle}`}
      textDecoration={el.textDecoration}
      fill={el.fill}
      stroke={el.stroke || undefined}
      strokeWidth={el.strokeWidth || 0}
      shadowColor={el.shadowBlur ? el.shadowColor || "rgba(0,0,0,0.5)" : undefined}
      shadowBlur={el.shadowBlur || 0}
      shadowOffsetX={el.shadowOffsetX || 0}
      shadowOffsetY={el.shadowOffsetY || 0}
      align={el.align}
      letterSpacing={el.letterSpacing}
      rotation={el.rotation}
      opacity={el.opacity}
      visible={el.visible}
      scaleX={el.scaleX ?? 1}
      scaleY={el.scaleY ?? 1}
      draggable={!el.locked && el.visible}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={(e) => onDragMove?.(e.target.x(), e.target.y())}
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
  onDragMove,
  onTransformEnd,
  transformerRef,
}: {
  el: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onDragMove?: (x: number, y: number) => void;
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
      scaleX={el.scaleX ?? 1}
      scaleY={el.scaleY ?? 1}
      draggable={!el.locked && el.visible}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={(e) => onDragMove?.(e.target.x(), e.target.y())}
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
  onDragMove,
  onTransformEnd,
  transformerRef,
}: {
  el: ShapeElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onDragMove?: (x: number, y: number) => void;
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
    scaleX: el.scaleX ?? 1,
    scaleY: el.scaleY ?? 1,
    draggable: !el.locked && el.visible,
    onClick: onSelect,
    onTap: onSelect,
    onDragMove: (e: any) =>
      onDragMove?.(e.target.x() - el.width / 2, e.target.y() - el.height / 2),
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
      cornerRadius={el.cornerRadius ?? 0}
      scaleX={el.scaleX ?? 1}
      scaleY={el.scaleY ?? 1}
      draggable={!el.locked && el.visible}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={(e) => onDragMove?.(e.target.x(), e.target.y())}
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
  onDragMove,
  onTransformEnd,
  transformerRef,
}: {
  el: StickerElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onDragMove?: (x: number, y: number) => void;
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
      scaleX={el.scaleX ?? 1}
      scaleY={el.scaleY ?? 1}
      draggable={!el.locked && el.visible}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={(e) => onDragMove?.(e.target.x(), e.target.y())}
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

function KonvaLineElement({
  el,
  isSelected,
  onSelect,
  onDragEnd,
  onDragMove,
  onTransformEnd,
  transformerRef,
}: {
  el: LineElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onDragMove?: (x: number, y: number) => void;
  onTransformEnd: (attrs: Partial<LineElement>) => void;
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
    <Line
      ref={nodeRef}
      x={el.x}
      y={el.y}
      points={el.points || [0, 0, el.width, 0]}
      stroke={el.stroke}
      strokeWidth={el.strokeWidth}
      lineCap={el.lineCap || "round"}
      lineJoin={el.lineJoin || "round"}
      dash={el.dash}
      rotation={el.rotation}
      opacity={el.opacity}
      visible={el.visible}
      scaleX={el.scaleX ?? 1}
      scaleY={el.scaleY ?? 1}
      draggable={!el.locked && el.visible}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={(e) => onDragMove?.(e.target.x(), e.target.y())}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={(e) => {
        const node = e.target;
        onTransformEnd({
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * node.scaleX()),
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
  zoom?: number;
  panX?: number;
  panY?: number;
  showGrid?: boolean;
  snapEnabled?: boolean;
  onSelect: (id: string | null) => void;
  onUpdateLive: (id: string, attrs: Partial<DesignElement>) => void;
  onUpdateCommit: (id: string, attrs: Partial<DesignElement>) => void;
  onDrawFinish?: () => void;
}

export default function DesignCanvas({
  stageRef,
  elements,
  selectedId,
  shirtColor,
  activeView,
  zoom = 1,
  panX = 0,
  panY = 0,
  showGrid = false,
  snapEnabled = true,
  onSelect,
  onUpdateLive,
  onUpdateCommit,
  onDrawFinish,
}: DesignCanvasProps) {
  const transformerRef = useRef<any>(null);
  const [guideLines, setGuideLines] = useState<{ x?: number; y?: number }>({});

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

  useEffect(() => {
    if (!selectedId && transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  const handleDragMove = useCallback(
    (id: string, curX: number, curY: number) => {
      if (!snapEnabled) {
        setGuideLines({});
        return;
      }
      const activeEl = elements.find((e) => e.id === id);
      if (!activeEl) return;

      const SNAP_THRESHOLD = 6;
      const zoneCenterX = DESIGN_ZONE.x + DESIGN_ZONE.width / 2;
      const zoneCenterY = DESIGN_ZONE.y + DESIGN_ZONE.height / 2;
      const elCenterX = curX + activeEl.width / 2;
      const elCenterY = curY + activeEl.height / 2;

      let guideX: number | undefined = undefined;
      let guideY: number | undefined = undefined;

      if (Math.abs(elCenterX - zoneCenterX) < SNAP_THRESHOLD) {
        guideX = zoneCenterX;
      }
      if (Math.abs(elCenterY - zoneCenterY) < SNAP_THRESHOLD) {
        guideY = zoneCenterY;
      }

      setGuideLines({ x: guideX, y: guideY });
    },
    [elements, snapEnabled]
  );

  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      setGuideLines({});
      let finalX = x;
      let finalY = y;

      if (snapEnabled) {
        const activeEl = elements.find((e) => e.id === id);
        if (activeEl) {
          const SNAP_THRESHOLD = 6;
          const zoneCenterX = DESIGN_ZONE.x + DESIGN_ZONE.width / 2;
          const zoneCenterY = DESIGN_ZONE.y + DESIGN_ZONE.height / 2;
          const elCenterX = x + activeEl.width / 2;
          const elCenterY = y + activeEl.height / 2;

          if (Math.abs(elCenterX - zoneCenterX) < SNAP_THRESHOLD) {
            finalX = zoneCenterX - activeEl.width / 2;
          }
          if (Math.abs(elCenterY - zoneCenterY) < SNAP_THRESHOLD) {
            finalY = zoneCenterY - activeEl.height / 2;
          }
        }
      }

      onUpdateCommit(id, { x: finalX, y: finalY });
      onDrawFinish?.();
    },
    [elements, snapEnabled, onUpdateCommit, onDrawFinish]
  );

  const paths = SHIRT_PATHS[activeView];
  const bodyColor = shirtColor;

  return (
    <div
      className="canvas-stage-wrapper"
      style={{
        transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
        transformOrigin: "center center",
      }}
    >
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
          <Line
            name="shirt-body"
            points={paths[0].points}
            closed
            fill={bodyColor}
            stroke={lightenColor(bodyColor, 35)}
            strokeWidth={1.5}
            listening={true}
            shadowColor="#000000"
            shadowBlur={15}
            shadowOpacity={0.4}
            shadowOffsetY={6}
          />
          <Line
            name="shirt-body"
            points={paths[1].points}
            closed
            fill={darkenColor(bodyColor, 18)}
            stroke={lightenColor(bodyColor, 25)}
            strokeWidth={0.8}
            listening={true}
          />
          <Line
            points={[25, 145, 55, 145]}
            stroke={darkenColor(bodyColor, 25)}
            strokeWidth={1}
            opacity={0.6}
          />
          <Line
            points={[345, 145, 375, 145]}
            stroke={darkenColor(bodyColor, 25)}
            strokeWidth={1}
            opacity={0.6}
          />

          {showGrid && (
            <Group listening={false}>
              {Array.from({ length: 20 }).map((_, i) => (
                <Line
                  key={`h-${i}`}
                  points={[0, i * 25, STAGE_WIDTH, i * 25]}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth={0.5}
                  dash={[2, 4]}
                />
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <Line
                  key={`v-${i}`}
                  points={[i * 25, 0, i * 25, STAGE_HEIGHT]}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth={0.5}
                  dash={[2, 4]}
                />
              ))}
            </Group>
          )}

          <Rect
            x={DESIGN_ZONE.x}
            y={DESIGN_ZONE.y}
            width={DESIGN_ZONE.width}
            height={DESIGN_ZONE.height}
            stroke="rgba(99, 102, 241, 0.4)"
            strokeWidth={1.2}
            dash={[6, 4]}
            fill="rgba(99, 102, 241, 0.03)"
            listening={false}
            cornerRadius={4}
          />
          <Text
            x={DESIGN_ZONE.x}
            y={DESIGN_ZONE.y + DESIGN_ZONE.height + 6}
            width={DESIGN_ZONE.width}
            text="PRINT AREA"
            fontSize={9}
            fontFamily="Inter"
            fontWeight="700"
            letterSpacing={1.2}
            fill="rgba(99, 102, 241, 0.6)"
            align="center"
            listening={false}
          />

          {guideLines.x !== undefined && (
            <Line
              points={[guideLines.x, DESIGN_ZONE.y, guideLines.x, DESIGN_ZONE.y + DESIGN_ZONE.height]}
              stroke="#818cf8"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
            />
          )}
          {guideLines.y !== undefined && (
            <Line
              points={[DESIGN_ZONE.x, guideLines.y, DESIGN_ZONE.x + DESIGN_ZONE.width, guideLines.y]}
              stroke="#818cf8"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
            />
          )}
        </Layer>

        {/* ── Elements layer ── */}
        <Layer>
          {elements.map((el) => {
            const isSelected = el.id === selectedId;
            const commonProps = {
              isSelected,
              onSelect: () => onSelect(el.id),
              onDragMove: (x: number, y: number) => handleDragMove(el.id, x, y),
              onDragEnd: (x: number, y: number) => handleDragEnd(el.id, x, y),
              transformerRef,
            };

            if (el.type === "text") {
              return (
                <KonvaTextElement
                  key={el.id}
                  el={el as TextElement}
                  onTransformEnd={(attrs) => {
                    onUpdateCommit(el.id, attrs as any);
                    onDrawFinish?.();
                  }}
                  {...commonProps}
                />
              );
            }

            if (el.type === "image") {
              return (
                <KonvaImageElement
                  key={el.id}
                  el={el as ImageElement}
                  onTransformEnd={(attrs) => {
                    onUpdateCommit(el.id, attrs as any);
                    onDrawFinish?.();
                  }}
                  {...commonProps}
                />
              );
            }

            if (el.type === "shape") {
              return (
                <KonvaShapeElement
                  key={el.id}
                  el={el as ShapeElement}
                  onTransformEnd={(attrs) => {
                    onUpdateCommit(el.id, attrs as any);
                    onDrawFinish?.();
                  }}
                  {...commonProps}
                />
              );
            }

            if (el.type === "sticker") {
              return (
                <KonvaStickerElement
                  key={el.id}
                  el={el as StickerElement}
                  onTransformEnd={(attrs) => {
                    onUpdateCommit(el.id, attrs as any);
                    onDrawFinish?.();
                  }}
                  {...commonProps}
                />
              );
            }

            if (el.type === "line") {
              return (
                <KonvaLineElement
                  key={el.id}
                  el={el as LineElement}
                  onTransformEnd={(attrs) => {
                    onUpdateCommit(el.id, attrs as any);
                    onDrawFinish?.();
                  }}
                  {...commonProps}
                />
              );
            }

            return null;
          })}

          <Transformer
            ref={transformerRef}
            rotateEnabled
            anchorFill="#818cf8"
            anchorStroke="#ffffff"
            anchorSize={8}
            anchorCornerRadius={2}
            borderStroke="#6366f1"
            borderDash={[4, 4]}
            borderStrokeWidth={1}
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right",
              "middle-left",
              "middle-right",
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 15 || newBox.height < 15) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
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
