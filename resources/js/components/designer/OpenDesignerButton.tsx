import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { designerPage } from '@/routes';

interface OpenDesignerButtonProps {
  campaignId?: string | number;
  campaignName?: string;
  /** Called with the saved design URL when user saves from the designer */
  onDesignSaved?: (designUrl: string) => void;
}

/**
 * Drop this button into your order form's 3D viewer card.
 *
 * On click it navigates to /designer?campaign=<name>.
 * On return, it reads the saved design from sessionStorage
 * and calls onDesignSaved(dataUrl) so you can pass it to ShirtViewer.
 *
 * Usage:
 *   <OpenDesignerButton
 *     campaignName="UTHM CS Club Jersey 2025"
 *     onDesignSaved={(url) => setDesignUrl(url)}
 *   />
 */
export default function OpenDesignerButton({
  campaignId,
  campaignName = "Campaign",
  onDesignSaved,
}: OpenDesignerButtonProps) {
  const [hasDesign, setHasDesign] = useState(false);

  const storageKey = campaignId != null
    ? `tailorease_design_url_${campaignId}`
    : "tailorease_design_url";

  // Check if a design was already saved for this session
  useEffect(() => {
    const savedDesignUrl = sessionStorage.getItem(storageKey);

    if (!savedDesignUrl) {
        return;
    }

    setHasDesign(true);
    onDesignSaved?.(savedDesignUrl);

  }, [onDesignSaved, storageKey]);

  const handleOpenDesigner = () => {
    const params = new URLSearchParams({ campaign: campaignName });

    if (campaignId != null) {
        params.set("id", String(campaignId));
    }

    router.visit(
        designerPage({
            query: {
                campaign: campaignName,
                id: campaignId,
            }
        })
    )
    // router.visit(`/designer?${params.toString()}`);
  };

  return (
    <div className="open-designer-wrapper">
      <button
        type="button"
        className="open-designer-btn"
        onClick={handleOpenDesigner}
        aria-label="Open apparel designer"
      >
        {/* Palette icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
          <circle cx="8.5"  cy="7.5"  r=".5" fill="currentColor"/>
          <circle cx="6.5"  cy="12.5" r=".5" fill="currentColor"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
        </svg>
        {hasDesign ? "Edit in designer" : "Open in designer"}
      </button>

      {hasDesign && (
        <span className="open-designer-badge" aria-label="Design applied">
          Design applied
        </span>
      )}

      <style>{`
        .open-designer-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .open-designer-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 500;
          border: 0.5px solid rgba(0,0,0,0.18);
          border-radius: 8px;
          background: #fff;
          color: #1a1a1a;
          cursor: pointer;
          transition: background 0.14s, border-color 0.14s;
          font-family: inherit;
        }
        .open-designer-btn:hover {
          background: #f5f5f5;
          border-color: rgba(0,0,0,0.28);
        }
        .open-designer-badge {
          font-size: 11px;
          color: #27ae60;
          background: rgba(39,174,96,0.1);
          border: 0.5px solid rgba(39,174,96,0.3);
          padding: 2px 8px;
          border-radius: 99px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
