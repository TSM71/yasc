import { v2sqr, v2sub, type Vec2 } from './vector'
import { levels, type World } from './world'

export class Board {
  cvs: HTMLCanvasElement
  queue = Array(5).fill(0).map(() => Math.floor(Math.random() * 3))
  box = { width: 0, bottom: 0, left: 0, height: 0 }
  worldX: number
  canvasX: number
  available: number[] = []
  lastpos: Vec2[] = []
  instability = 0
  status: 'WON' | 'WINNING' | 'PLAYABLE' | 'UNSTABLE' | 'LOST' = 'PLAYABLE'
  constructor(public ctx: CanvasRenderingContext2D, public world: World) {
    this.cvs = ctx.canvas
    this.box.width = this.cvs.width * 0.8
    this.box.left = (this.cvs.width - this.box.width) / 2
    this.box.bottom = this.cvs.height - this.box.left
    this.box.height = this.box.width * this.world.height / world.width
    this.worldX = world.width / 2
    this.canvasX = this.xWorldToCanvas(this.worldX)
  }
  xOffsetToCanvas(x: number): number { return x * this.cvs.width / this.cvs.clientWidth }
  xCanvasToWorld(x: number): number { return (x - this.box.left) * this.world.width / this.box.width }
  xWorldClamp(x: number, level: number): number { const radius = levels[level]!.radius; return Math.max(radius, Math.min(this.world.width - radius, x)) }
  xWorldToCanvas(x: number): number { return x * this.box.width / this.world.width + this.box.left }
  xCanvasToOffset(x: number): number { return x * this.cvs.clientWidth / this.cvs.width }
  sWorldToCanvas(s: number): number { return s * this.box.width / this.world.width }
  yOffsetToCanvas(y: number): number { return y * this.cvs.height / this.cvs.clientHeight }
  yWorldToCanvas(y: number): number { return (y - this.world.height) * this.box.height / this.world.height + this.box.bottom }
  point(offsetX: number) {
    const level = this.queue[0]!
    this.worldX = this.xWorldClamp(this.xCanvasToWorld(this.xOffsetToCanvas(offsetX)), level)
    this.canvasX = this.xWorldToCanvas(this.worldX)
  }
  click(offsetX: number): boolean {
    if (!this.queue.length) return false
    this.point(offsetX)
    const level = this.queue[0]!
    if (!this.world.available(this.worldX, level)) return false
    this.world.drop(this.worldX, level)
    this.queue.shift()
    this.queue.push(Math.floor(Math.random() * 3))
    this.point(offsetX)
    return true
  }
  shake() {
    this.world.balls.forEach(ball => {
      ball.vel.x += Math.random() * 200 - 100
      ball.vel.y -= Math.random() * 200 + 300
    })
  }
  tick(delta: number) {
    for (let i = 0; i < 100; ++i) this.world.step(delta / 100)
      const level = this.queue[0]!
    const start = Math.floor(this.xCanvasToOffset(this.xWorldToCanvas(this.xWorldClamp(0, level))))
    const end = Math.ceil(this.xCanvasToOffset(this.xWorldToCanvas(this.xWorldClamp(this.world.width, level))))
    this.available = Array(end - start).fill(0).flatMap((_, x) => {
      const worldX = this.xWorldClamp(this.xCanvasToWorld(this.xOffsetToCanvas(start + x)), level)
      return this.world.available(worldX, level) ? start + x : []
    })
    this.instability = this.world.balls.length !== this.lastpos.length ? Infinity :
      this.world.balls.reduce((acc, ball, index) => acc + v2sqr(v2sub(ball.pos, this.lastpos[index]!)), 0)
    this.lastpos = this.world.balls.map(ball => ball.pos)
    this.status = this.world.win ? this.instability < 1e-3 ? 'WON' : 'WINNING' : this.available.length === 0 ? this.instability < 1e-3 ? 'LOST' : 'UNSTABLE' : 'PLAYABLE'
  }
  draw() {
    this.ctx.fillStyle = '#1E90FF'
    this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height)

    this.world.draw(this.ctx, this.box.left, this.box.bottom - this.box.height, this.box.width, this.box.height)

    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillStyle = '#fff'
    for (const ball of this.world.balls) {
      this.ctx.fillText(`${ball.level + 1}`, this.xWorldToCanvas(ball.pos.x), this.yWorldToCanvas(ball.pos.y))
    }

    if (this.status === 'PLAYABLE' || this.status === 'UNSTABLE') {
      if (this.queue.length) {
        const level = levels[this.queue[0]!]!
        const cr = this.sWorldToCanvas(level.radius)
        this.ctx.fillRect(this.canvasX, this.box.bottom - this.box.height, 1, this.box.height)
        this.ctx.fillStyle = '#ffffff40'
        this.ctx.fillRect(this.canvasX - cr, this.box.bottom - this.box.height, 2 * cr, this.box.height)
      }
      let cy = this.yWorldToCanvas(0)
      for (const size of this.queue) {
        const level = levels[size]!
        const cr = this.sWorldToCanvas(level.radius)
        this.ctx.fillStyle = level.color + 'c0'
        this.ctx.beginPath()
        this.ctx.arc(this.canvasX, cy - cr, cr, 0, 360, false)
        this.ctx.fill()
        this.ctx.fillStyle = '#fff'
        this.ctx.fillText(`${size + 1}`, this.canvasX, cy - cr)
        cy -= 2 * cr
      }
    }

    this.ctx.fillStyle = '#fff'
    for (const x of this.available) {
      this.ctx.fillRect(this.xOffsetToCanvas(x), this.box.bottom - this.box.height - 1, 1, 1)
    }
  }
}
