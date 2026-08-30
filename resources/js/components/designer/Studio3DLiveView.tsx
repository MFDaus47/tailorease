import { OrbitControls, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import CameraController from "../apparel/CameraController";
import ShirtModel from "../apparel/ShirtModel";
import type { ProductType } from "../../types/designer";

interface Studio3DLiveViewProps {
  color: string;
  designUrl: string | null;
  productType?: ProductType;
  height?: string;
  className?: string;
}

export default function Studio3DLiveView({
  color,
  designUrl,
  productType = "tshirt",
  height = "100%",
  className = "",
}: Studio3DLiveViewProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [envPreset, setEnvPreset] = useState<"city" | "studio" | "sunset" | "dawn">("city");

  return (
    <div
      className={`studio-3d-container relative w-full h-full flex flex-col overflow-hidden bg-slate-950/80 rounded-xl border border-indigo-500/20 shadow-2xl ${className}`}
      style={{ height }}
    >
      {/* 3D Toolbar overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 shadow-lg">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
            Real-Time 3D Studio
          </span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
            {productType.toUpperCase()}
          </span>
        </div>

        {/* View & Lighting controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-800 p-1">
            <button
              onClick={() => setView("front")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                view === "front"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Front 3D
            </button>
            <button
              onClick={() => setView("back")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                view === "back"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Back 3D
            </button>
          </div>

          <select
            value={envPreset}
            onChange={(e: any) => setEnvPreset(e.target.value)}
            className="bg-slate-900/90 backdrop-blur-md text-xs font-medium text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-indigo-500/40"
          >
            <option value="city">Studio City</option>
            <option value="studio">Soft Studio</option>
            <option value="sunset">Warm Sunset</option>
            <option value="dawn">Cool Dawn</option>
          </select>
        </div>
      </div>

      {/* Three.js Canvas */}
      <div className="w-full flex-1">
        <Canvas camera={{ position: [0, 0, 5.5], fov: 22 }}>
          <ambientLight intensity={1.6} />
          <directionalLight position={[2, 5, 3]} intensity={2.2} castShadow />
          <directionalLight position={[-2, -3, -2]} intensity={0.6} />

          <ShirtModel color={color} rotation={0} designUrl={designUrl} />

          <Environment preset={envPreset} />
          <OrbitControls makeDefault enableZoom maxPolarAngle={Math.PI / 1.7} minPolarAngle={Math.PI / 4} />
          <CameraController view={view} />
        </Canvas>
      </div>

      {/* Orbit hint footer */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <span className="text-[10px] font-medium text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800/80 shadow-md">
          🖱️ Click & Drag to Orbit 360° | Scroll to Zoom
        </span>
      </div>
    </div>
  );
}
