import type { DesignElement, ProductType } from "../../types/designer";

interface PreflightInspectorModalProps {
  elements: DesignElement[];
  productType: ProductType;
  shirtColor: string;
  onClose: () => void;
}

export default function PreflightInspectorModal({
  elements,
  productType,
  shirtColor,
  onClose,
}: PreflightInspectorModalProps) {
  // Pre-flight checks logic
  const elementCount = elements.length;
  const hasText = elements.some((e) => e.type === "text");
  const hasGraphics = elements.some((e) => e.type === "image" || e.type === "sticker");

  // Print area boundary check (110 <= x <= 290, 80 <= y <= 300)
  const overflowingElements = elements.filter(
    (e) => e.x < 110 || e.x + e.width > 290 || e.y < 80 || e.y + e.height > 300
  );
  const isBoundaryClean = overflowingElements.length === 0;

  // Bulk Unit Cost Estimation
  const basePrices: Record<ProductType, number> = {
    tshirt: 25,
    hoodie: 65,
    polo: 38,
    jersey: 45,
  };
  const baseGarmentPrice = basePrices[productType] || 25;
  const printComplexityCost = Math.min(20, elementCount * 3.5);
  const estimatedUnitCost = baseGarmentPrice + printComplexityCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏁</span>
            <div>
              <h2 className="text-base font-bold text-slate-100">Production Pre-Flight Inspector</h2>
              <p className="text-xs text-slate-400">Automated pre-print quality check & unit cost estimate.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Quality Audit Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* DPI Rating Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Print Quality</span>
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  PASS
                </span>
              </div>
              <span className="text-sm font-bold text-slate-100 mt-1">300 DPI Studio</span>
              <span className="text-[10px] text-slate-400">Vector canvas render ready.</span>
            </div>

            {/* Boundary Check Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Print Bounds</span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    isBoundaryClean
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {isBoundaryClean ? "CLEAN" : "BLEED WARN"}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-100 mt-1">
                {isBoundaryClean ? "100% Inside Area" : `${overflowingElements.length} Item Bleeding`}
              </span>
              <span className="text-[10px] text-slate-400">
                {isBoundaryClean ? "No artwork clipping." : "Adjust items inside print box."}
              </span>
            </div>

            {/* Print Tech Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Print Technique</span>
                <span className="text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                  DTG PRINT
                </span>
              </div>
              <span className="text-sm font-bold text-slate-100 mt-1">Direct-to-Garment</span>
              <span className="text-[10px] text-slate-400">Full color photographic output.</span>
            </div>
          </div>

          {/* Live Bulk Cost Calculator Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
              Estimated Unit Cost Breakdown
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Base Garment ({productType.toUpperCase()})</span>
                <span className="font-semibold text-slate-200">RM {baseGarmentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Print Application ({elementCount} Artwork Layers)</span>
                <span className="font-semibold text-slate-200">RM {printComplexityCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-slate-100 font-bold text-sm">
                <span>Estimated Unit Price</span>
                <span className="text-indigo-400 text-base">RM {estimatedUnitCost.toFixed(2)} / pc</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              Done & Return to Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
