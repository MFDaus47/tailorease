export function orderNumber(order: { number?: string | null; id: string }): string {
    const number = order.number?.trim();

    return number || order.id;
}

export function orderTitle(order: { name?: string | null; product?: string | null }): string {
    return order.name?.trim() || order.product?.trim() || 'Order';
}

export function matchesOrderQuery(
    order: {
        id: string;
        number?: string | null;
        name?: string | null;
        product?: string | null;
        customer?: string | null;
    },
    query: string,
): boolean {
    const term = query.trim().toLowerCase();

    if (!term) {
        return true;
    }

    return [order.number, order.name, order.product, order.customer, order.id]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(term));
}

export function activeSizes(sizes: unknown): { size: string; qty: number }[] {
    if (!sizes || typeof sizes !== 'object' || Array.isArray(sizes)) {
        return [];
    }

    return Object.entries(sizes as Record<string, unknown>)
        .map(([size, qty]) => ({ size, qty: Number(qty) || 0 }))
        .filter((entry) => entry.qty > 0);
}

export function isImagePreview(path?: string | null): boolean {
    if (!path) {
        return false;
    }

    const clean = path.split('?')[0]?.split('#')[0]?.toLowerCase() ?? '';

    return /\.(png|jpe?g|gif|webp|svg)$/.test(clean);
}

export function fileNameFromPath(path?: string | null): string {
    if (!path) {
        return 'Design file';
    }

    return path.split(/[\\/]/).pop()?.split('?')[0] || 'Design file';
}
