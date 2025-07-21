import { Board } from './board'
import { World } from './world'

// Initialize canvas
const cvs = document.body.appendChild(document.createElement('canvas'))
cvs.width = 360
cvs.height = 740
const ctx = cvs.getContext('2d')!
ctx.font = '20px monospace'

// Initialize game state
let board = new Board(ctx, new World())
const ymin = 160, ystat = 120
const boxes: { x: number, y: number, width: number, height: number, color: string, text: string, click: () => void }[] = [
  { x: 20, y: 20, width: 140, height: 60, color: '#800', text: 'Restart', click() {
    board = new Board(ctx, new World())
  } },
  { x: 200, y: 20, width: 140, height: 60, color: '#444', text: 'Shake', click() {
    if (board.status !== 'WON' && board.status !== 'WINNING')
      board.shake(), board.status = 'UNSTABLE'
  } },
]

// Event listeners
document.body.addEventListener('scroll', evt => evt.preventDefault())
cvs.addEventListener('pointerdown', evt => {
  const y = board.yOffsetToCanvas(evt.offsetY)
  if ((board.status === 'PLAYABLE' || board.status === 'UNSTABLE') && y > ymin)
    board.point(evt.offsetX)
})
cvs.addEventListener('pointermove', evt => {
  const y = board.yOffsetToCanvas(evt.offsetY)
  if ((board.status === 'PLAYABLE' || board.status === 'UNSTABLE') && y > ymin)
    board.point(evt.offsetX)
})
cvs.addEventListener('pointerup', evt => {
  const y = board.yOffsetToCanvas(evt.offsetY)
  if ((board.status === 'PLAYABLE' || board.status === 'UNSTABLE') && y > ymin)
    board.click(evt.offsetX)
  const x = board.xOffsetToCanvas(evt.offsetX)
  for (const box of boxes)
    if (x >= box.x && x < box.x + box.width && y >= box.y && y < box.y + box.height)
      box.click()
})

// Main loop
let lastTime = performance.now()
const loop = (now: number) => {
  // Board update
  if (board.status !== 'WON' && board.status !== 'LOST')
    board.tick((now - lastTime) / 1000)
  board.draw()

  // UI
  ctx.strokeStyle = '#fff'
  ctx.setLineDash([20, 20])
  ctx.beginPath()
  ctx.moveTo(0, ymin)
  ctx.lineTo(cvs.width, ymin)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const box of boxes) {
    ctx.fillStyle = box.color
    ctx.fillRect(box.x, box.y, box.width, box.height)
    ctx.fillStyle = '#fff'
    ctx.fillText(box.text, box.x + box.width / 2, box.y + box.height / 2)
  }
  if (board.status === 'WON' || board.status === 'WINNING')
    ctx.fillText('You won! Congratulations!', cvs.width / 2, ystat)
  if (board.status === 'LOST')
    ctx.fillText('You lost.. Shake the board?', cvs.width / 2, ystat)

  // Loop
  lastTime = now
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
