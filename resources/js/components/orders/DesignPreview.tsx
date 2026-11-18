import { Download } from 'lucide-react';
import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { gsap, motionReduced, useGSAP } from '@/lib/gsap';
import { fileNameFromPath, isImagePreview } from '@/lib/order-label';

export default function DesignPreview({ src, label = 'Design' }: { src?: string | null; label?: string }) {
    const [open, setOpen] = useState(false);
    const frame = useRef<HTMLDivElement>(null);
    const image = isImagePreview(src);
    const fileName = fileNameFromPath(src);

    useGSAP(() => {
        if (!open || !frame.current || motionReduced()) {
            return;
        }

        gsap.from(frame.current, { scale: 0.96, opacity: 0, duration: 0.25, ease: 'power2.out' });
    }, { dependencies: [open], scope: frame, revertOnUpdate: true });

    if (!src) {
        return null;
    }

    return (
        <div className="space-y-2">
            {image ? (
                <button type="button" onClick={() => setOpen(true)} className="block w-full text-left">
                    <img src={src} alt={label} className="max-h-40 w-full rounded border border-border bg-white object-contain" />
                </button>
            ) : (
                <div className="rounded border border-border bg-muted px-3 py-2">
                    <p className="truncate text-xs font-medium text-foreground">{fileName}</p>
                    <p className="text-xs text-muted-foreground">This file does not preview as an image.</p>
                </div>
            )}
            <a href={src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                <Download size={13} /> Open file
            </a>
            {image && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>{label}</DialogTitle>
                            <DialogDescription>{fileName}</DialogDescription>
                        </DialogHeader>
                        <div ref={frame} className="overflow-hidden rounded border border-border bg-white">
                            <img src={src} alt={label} className="max-h-[70vh] w-full object-contain" />
                        </div>
                        <a href={src} download target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600">
                            <Download size={14} /> Download
                        </a>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
