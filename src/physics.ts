import { v2add, v2dot, v2len, v2scl, v2sqr, v2sub, type Vec2 } from './vector'

export function pushAway(x1: Vec2, x2: Vec2, r1: number, r2: number): [x1: Vec2, x2: Vec2] {
  const diff = v2sub(x1, x2)
  const dist = v2len(diff)
  const off = v2scl(diff, (r1 + r2 - dist) / (2 * dist))
  return [
    v2add(x1, off),
    v2sub(x2, off),
  ]
}

export function collideElastic(x1: Vec2, x2: Vec2, v1: Vec2, v2: Vec2, m1: number, m2: number): [v1: Vec2, v2: Vec2] {
  const diff = v2sub(x1, x2)
  const off = 2 * v2dot(v2sub(v1, v2), diff) / ((m1 + m2) * v2sqr(diff))
  return [
    v2sub(v1, v2scl(diff, off * m2)),
    v2add(v2, v2scl(diff, off * m1)),
  ]
}

export function collideInelastic(x1: Vec2, x2: Vec2, v1: Vec2, v2: Vec2, m1: number, m2: number, cr: number): [v1: Vec2, v2: Vec2] {
  const diff = v2sub(x1, x2)
  const off = (1 + cr) * v2dot(v2sub(v1, v2), diff) / ((m1 + m2) * v2sqr(diff))
  return [
    v2sub(v1, v2scl(diff, off * m2)),
    v2add(v2, v2scl(diff, off * m1)),
  ]
}

export function collideInelasticImmovable(x1: Vec2, x2: Vec2, v1: Vec2, v2: Vec2, cr: number): Vec2 {
  const diff = v2sub(x1, x2)
  return v2sub(v1, v2scl(diff, (1 + cr) * v2dot(v2sub(v1, v2), diff) / v2sqr(diff)))
}
