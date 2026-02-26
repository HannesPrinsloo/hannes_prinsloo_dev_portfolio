import type { Rect } from './types';

export function checkAABBCollision(rect1: Rect, rect2: Rect, hitboxShrink: number = 0): boolean {
    const r1X = rect1.x + hitboxShrink;
    const r1Y = rect1.y + hitboxShrink;
    const r1W = rect1.width - hitboxShrink * 2;
    const r1H = rect1.height - hitboxShrink * 2;

    const r2X = rect2.x + hitboxShrink;
    const r2Y = rect2.y + hitboxShrink;
    const r2W = rect2.width - hitboxShrink * 2;
    const r2H = rect2.height - hitboxShrink * 2;

    return (
        r1X < r2X + r2W &&
        r1X + r1W > r2X &&
        r1Y < r2Y + r2H &&
        r1Y + r1H > r2Y
    );
}
