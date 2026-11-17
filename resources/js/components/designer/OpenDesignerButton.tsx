import { router } from "@inertiajs/react";

interface OpenDesignerButtonProps {
  orderId?: string;
  designId?: string;
  campaignName?: string;
}

export default function OpenDesignerButton({
  orderId,
  designId,
  campaignName = "Campaign",
}: OpenDesignerButtonProps) {
  const handleOpenDesigner = () => {
    const params = new URLSearchParams({
      campaign: campaignName,
      return: window.location.pathname + window.location.search,
    });

    if (orderId) {
      params.set("order", orderId);
    }

    if (designId) {
      params.set("design", designId);
    }

    router.visit(`/designer?${params.toString()}`);
  };

  return (
    <div className="open-designer-wrapper">
      <button
        type="button"
        className="open-designer-btn"
        onClick={handleOpenDesigner}
        aria-label="Open apparel designer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
        {designId ? "Edit design" : "Open designer"}
      </button>
    </div>
  );
}
