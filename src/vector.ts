export type Vec2 = { x: number, y: number }
export const v2neg = (a: Vec2): Vec2 => ({ x: -a.x, y: -a.y })
export const v2add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y })
export const v2sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y })
export const v2scl = (a: Vec2, b: number): Vec2 => ({ x: a.x * b, y: a.y * b })
export const v2dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y
export const v2len = (a: Vec2): number => Math.hypot(a.x, a.y)
export const v2sqr = (a: Vec2): number => v2dot(a, a)
export const v2uni = (a: Vec2): Vec2 => v2scl(a, 1 / v2len(a))
