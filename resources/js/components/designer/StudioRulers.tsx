interface StudioRulersProps {
  width: number;
  height: number;
  zoom?: number;
}

export default function StudioRulers({ width, height, zoom = 1 }: StudioRulersProps) {
  const cmTicksX = Array.from({ length: 31 }); // 0 to 30 cm
  const cmTicksY = Array.from({ length: 35 });

  return (
    <div className="studio-rulers-wrapper pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {/* Top Horizontal Ruler */}
      <div
        className="top-ruler absolute top-0 left-6 right-0 h-5 bg-slate-900/90 border-b border-slate-800/80 flex items-end select-none"
        style={{ transform: `scaleX(${zoom})`, transformOrigin: "left center" }}
      >
        {cmTicksX.map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full border-r border-slate-700/40 relative">
            {i % 5 === 0 && (
              <span className="text-[8px] font-mono font-bold text-slate-400 absolute top-0.5">
                {i}cm
              </span>
            )}
            <div className={`w-px bg-slate-500/60 ${i % 5 === 0 ? "h-2.5 bg-indigo-400" : "h-1.5"}`} />
          </div>
        ))}
      </div>

      {/* Left Vertical Ruler */}
      <div
        className="left-ruler absolute top-5 bottom-0 left-0 w-6 bg-slate-900/90 border-r border-slate-800/80 flex flex-col items-end select-none"
        style={{ transform: `scaleY(${zoom})`, transformOrigin: "top center" }}
      >
        {cmTicksY.map((_, i) => (
          <div key={i} className="flex-1 flex items-center justify-end w-full border-b border-slate-700/40 relative">
            {i % 5 === 0 && (
              <span className="text-[8px] font-mono font-bold text-slate-400 absolute left-0.5 transform -rotate-90">
                {i}
              </span>
            )}
            <div className={`h-px bg-slate-500/60 ${i % 5 === 0 ? "w-2.5 bg-indigo-400" : "w-1.5"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
