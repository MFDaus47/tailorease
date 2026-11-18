import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const REASONS = [
    'Unable to source required fabric',
    'Delivery date not feasible',
    'Design too complex for current capacity',
    'Other',
];

export default function RejectOrderDialog({
    open,
    busy = false,
    onClose,
    onConfirm,
}: {
    open: boolean;
    busy?: boolean;
    onClose: () => void;
    onConfirm: (reason: string, notes: string) => void;
}) {
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');

    const close = () => {
        setReason('');
        setNotes('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) close(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reject order</DialogTitle>
                    <DialogDescription>The customer sees this reason on the order.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    {REASONS.map((option) => (
                        <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${reason === option ? 'border-red-400 bg-red-50' : 'border-border'}`}>
                            <input type="radio" name="reject-reason" value={option} checked={reason === option} onChange={() => setReason(option)} className="accent-red-500" />
                            <span className="text-sm text-foreground">{option}</span>
                        </label>
                    ))}
                </div>
                <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Additional notes"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-border bg-muted px-3 py-2.5 text-sm focus:outline-none"
                />
                <div className="flex gap-3">
                    <button type="button" onClick={close} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground">Cancel</button>
                    <button
                        type="button"
                        disabled={!reason || busy}
                        onClick={() => onConfirm(reason, notes.trim())}
                        className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                    >
                        Confirm rejection
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
