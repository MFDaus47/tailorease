import type { ShirtView, ViewMode } from "../../types/designer";

interface MultiSidePreviewDockProps {
  activeView: ShirtView;
  viewMode: ViewMode;
  shirtColor: string;
  live3dDataUrl: string | null;
  onViewChange: (view: ShirtView) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function MultiSidePreviewDock({
  activeView,
  viewMode,
  shirtColor,
  live3dDataUrl,
  onViewChange,
  onViewModeChange,
}: MultiSidePreviewDockProps) {
  return (
    <div className="multi-side-dock fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl animate-slideUp">
      {/* Front View Card */}
      <button
        onClick={() => {
          onViewModeChange("2d");
          onViewChange("front");
        }}
        className={`flex flex-col items-center p-1.5 rounded-xl border transition-all ${
          viewMode === "2d" && activeView === "front"
            ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20 scale-105"
            : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
        }`}
      >
        <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center relative overflow-hidden border border-slate-800">
          <span
            className="w-8 h-8 rounded-t-full border border-slate-600/50 shadow-inner"
            style={{ background: shirtColor }}
          />
          {live3dDataUrl && (
            <img src={live3dDataUrl} alt="Front design" className="absolute inset-0 object-contain p-1 opacity-80" />
          )}
        </div>
        <span className="text-[10px] font-bold text-slate-300 mt-1">Front</span>
      </button>

      {/* Back View Card */}
      <button
        onClick={() => {
          onViewModeChange("2d");
          onViewChange("back");
        }}
        className={`flex flex-col items-center p-1.5 rounded-xl border transition-all ${
          viewMode === "2d" && activeView === "back"
            ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20 scale-105"
            : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
        }`}
      >
        <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center relative overflow-hidden border border-slate-800">
          <span
            className="w-8 h-8 rounded-t-full border border-slate-600/50 shadow-inner"
            style={{ background: shirtColor }}
          />
        </div>
        <span className="text-[10px] font-bold text-slate-300 mt-1">Back</span>
      </button>

      <div className="w-px h-10 bg-slate-800 my-auto mx-1" />

      {/* Live 3D Split Card */}
      <button
        onClick={() => onViewModeChange("split")}
        className={`flex flex-col items-center p-1.5 rounded-xl border transition-all ${
          viewMode === "split"
            ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20 scale-105"
            : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
        }`}
      >
        <div className="w-12 h-12 rounded-lg bg-indigo-950/40 flex items-center justify-center relative overflow-hidden border border-indigo-800/40">
          <span className="text-xl">🌓</span>
        </div>
        <span className="text-[10px] font-bold text-indigo-300 mt-1">Split 3D</span>
      </button>

      {/* Full 3D Orbit Card */}
      <button
        onClick={() => onViewModeChange("3d")}
        className={`flex flex-col items-center p-1.5 rounded-xl border transition-all ${
          viewMode === "3d"
            ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20 scale-105"
            : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
        }`}
      >
        <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center relative overflow-hidden border border-slate-800">
          <span className="text-xl">🌍</span>
        </div>
        <span className="text-[10px] font-bold text-slate-300 mt-1">3D Orbit</span>
      </button>
    </div>
  );
}
