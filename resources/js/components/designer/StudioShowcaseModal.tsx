import Studio3DLiveView from "./Studio3DLiveView";

interface StudioShowcaseModalProps {
  campaignName: string;
  shirtColor: string;
  designUrl: string | null;
  productType: string;
  onClose: () => void;
  onDownload: (format: "png" | "jpeg") => void;
}

export default function StudioShowcaseModal({
  campaignName,
  shirtColor,
  designUrl,
  productType,
  onClose,
  onDownload,
}: StudioShowcaseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">
                Studio Showcase Package
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                PRO RENDER
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">{campaignName}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Showcase Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Interactive 3D Orbit Model */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-300">Interactive 3D Render</span>
            <div className="h-[360px] rounded-xl overflow-hidden border border-slate-800">
              <Studio3DLiveView color={shirtColor} designUrl={designUrl} productType={productType as any} />
            </div>
          </div>

          {/* Right: Product Details & Flat Art Card */}
          <div className="flex flex-col justify-between gap-4 bg-slate-950/50 p-5 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-3">Garment Specifications</span>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-400">
                  <span>Product Model</span>
                  <span className="font-bold text-slate-200 uppercase">{productType}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-400">
                  <span>Base Color</span>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ background: shirtColor }} />
                    <span className="font-mono text-slate-200 uppercase">{shirtColor}</span>
                  </div>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-400">
                  <span>Print Quality</span>
                  <span className="font-bold text-emerald-400">300 DPI Vector Studio</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-400">
                  <span>Printing Technique</span>
                  <span className="font-bold text-indigo-300">Direct-to-Garment (DTG)</span>
                </div>
              </div>
            </div>

            {/* Design Art Thumbnail */}
            {designUrl && (
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
                <img src={designUrl} alt="Design artwork" className="w-16 h-16 object-contain bg-slate-950 rounded border border-slate-800" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-200 block truncate">Flat Print Texture</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">High-resolution flattened artwork ready for production print beds.</span>
                </div>
              </div>
            )}

            {/* Download Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => onDownload("png")}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>📥</span> Download High-Res PNG
              </button>
              <button
                onClick={() => onDownload("jpeg")}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                JPEG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
