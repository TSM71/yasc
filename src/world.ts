import { collideInelastic, collideInelasticImmovable, pushAway } from './physics'
import { v2add, v2len, v2scl, v2sqr, v2sub, v2uni, type Vec2 } from './vector'

export type Ball = {
  pos: Vec2, vel: Vec2
  radius: number, mass: number
  level: number, color: string
}

export const levels: { radius: number, color: string }[] = [
  { radius: 15, color: '#D38342' },
  { radius: 20, color: '#B26741' },
  { radius: 25, color: '#A6805C' },
  { radius: 30, color: '#36CFA6' },
  { radius: 35, color: '#FEA392' },
  // { radius: 40, color: '#A908DB' },
  { radius: 45, color: '#CADCB8' },
  // { radius: 50, color: '#6CA467' },
  // { radius: 55, color: '#CA2944' },
  // { radius: 60, color: '#EB15F7' },
  { radius: 65, color: '#3DEC0F' },
  // { radius: 70, color: '#713D00' },
  // { radius: 75, color: '#36F62B' },
  // { radius: 80, color: '#6990C9' },
  // { radius: 85, color: '#6B6595' },
  // { radius: 90, color: '#8E7D86' },
  { radius: 95, color: '#5FE5DA' },
  // { radius: 100, color: '#A49451' },
  // { radius: 105, color: '#25FEB0' },
  // { radius: 110, color: '#48CF93' },
  // { radius: 115, color: '#03DA51' },
  { radius: 120, color: '#E0CB1D' },
]

export class World {
  width = 420
  height = 470
  gravity = 981
  drag = 1e-10
  crBall = 0.2
  crWall = 0.5
  crFusion = 0.8
  balls: Ball[] = []
  win = false
  available(x: number, level: number) {
    const radius = levels[level]!.radius
    const pos = { x, y: -radius }
    return this.balls.every(ball => v2len(v2sub(pos, ball.pos)) >= radius + ball.radius)
  }
  drop(x: number, level: number) {
    const lvl = levels[level]!
    this.balls.push({
      pos: { x, y: -lvl.radius },
      vel: { x: 0, y: 0 },
      radius: lvl.radius, mass: lvl.radius * lvl.radius,
      level, color: lvl.color
    })
  }
  draw(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.fillStyle = '#000'
    ctx.fillRect(x, y, width, height)
    for (const ball of this.balls) {
      ctx.fillStyle = ball.color
      ctx.beginPath()
      ctx.arc(x + ball.pos.x * width / this.width, y + ball.pos.y * height / this.height, ball.radius * height / this.height, 0, 360, false)
      ctx.fill()
    }
  }
  step(delta: number) {
    for (const ball of this.balls) {
      let forces = { x: 0, y: this.gravity }
      forces = v2add(forces, v2scl(ball.vel, -ball.radius * ball.radius * v2sqr(ball.vel) * this.drag))
      ball.vel = v2add(ball.vel, v2scl(forces, delta))
      ball.pos = v2add(ball.pos, v2scl(ball.vel, delta))
    }
    const remove: number[] = []
    for (const [index1, ball1] of this.balls.entries()) {
      for (const [index2, ball2] of this.balls.entries()) {
        if (index1 >= index2) continue
        if (remove.includes(index1)) continue
        if (remove.includes(index2)) continue
        const dist = v2len(v2sub(ball1.pos, ball2.pos))
        if (dist < ball1.radius + ball2.radius) {
          if (ball1.level === ball2.level && ball1.level < levels.length - 1) {
            remove.push(index1, index2)
            const level = levels[ball1.level + 1]!
            const mass = level.radius * level.radius
            this.balls.push({
              pos: v2scl(v2add(ball1.pos, ball2.pos), 0.5),
              vel: v2scl(v2uni(v2add(ball1.vel, ball2.vel)), Math.sqrt(ball1.mass * (v2sqr(ball1.vel) + v2sqr(ball2.vel)) / mass) * this.crFusion),
              radius: level.radius, mass,
              level: ball1.level + 1, color: level.color
            })
            if (ball1.level === levels.length - 2) this.win = true
            continue
          }
          ;[ball1.pos, ball2.pos] = pushAway(ball1.pos, ball2.pos, ball1.radius, ball2.radius)
          ;[ball1.vel, ball2.vel] = collideInelastic(ball1.pos, ball2.pos, ball1.vel, ball2.vel, ball1.mass, ball2.mass, this.crBall)
        }
      }
    }
    this.balls = this.balls.filter((_, index) => !remove.includes(index))
    for (const ball of this.balls) {
      if (ball.pos.x < ball.radius) {
        ball.pos.x = ball.radius
        ball.vel = collideInelasticImmovable(ball.pos, { x: 0, y: ball.pos.y }, ball.vel, { x: 0, y: 0 }, this.crWall)
      }
      if (ball.pos.x > this.width - ball.radius) {
        ball.pos.x = this.width - ball.radius
        ball.vel = collideInelasticImmovable(ball.pos, { x: this.width, y: ball.pos.y }, ball.vel, { x: 0, y: 0 }, this.crWall)
      }
      if (ball.pos.y > this.height - ball.radius) {
        ball.pos.y = this.height - ball.radius
        ball.vel = collideInelasticImmovable(ball.pos, { x: ball.pos.x, y: this.height }, ball.vel, { x: 0, y: 0 }, this.crWall)
      }
    }
  }
}
