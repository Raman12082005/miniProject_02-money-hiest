const hero   = document.getElementById('hero')
const canvas = document.getElementById('heroCanvas')
const ctx    = canvas.getContext('2d')

const TRAIL_LENGTH = 60
const HEAD_RADIUS  = 80

const mouse  = { x: -9999, y: -9999 }
const smooth = { x: -9999, y: -9999 }
let trail    = []

// ── Images ───────────────────────────────
const bottomImg = new Image()
const topImg    = new Image()
bottomImg.src = './images/one.png'
topImg.src    = './images/twoo.png'

// ── Resize ───────────────────────────────
function resize() {
  canvas.width  = hero.offsetWidth
  canvas.height = hero.offsetHeight
}
resize()
window.addEventListener('resize', resize)

// ── Mouse tracking ────────────────────────
hero.addEventListener('mousemove', (e) => {
  const rect = hero.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
})

// ── Draw loop ─────────────────────────────
function draw() {
  const { width, height } = canvas

  // smooth follow
  smooth.x += (mouse.x - smooth.x) * 0.13
  smooth.y += (mouse.y - smooth.y) * 0.13

  // update trail
  trail.unshift({ x: smooth.x, y: smooth.y })
  if (trail.length > TRAIL_LENGTH) trail.length = TRAIL_LENGTH

  ctx.clearRect(0, 0, width, height)

  // 1. base image
  ctx.drawImage(bottomImg, 0, 0, width, height)

  // 2. offscreen masked reveal
  const offscreen = document.createElement('canvas')
  offscreen.width  = width
  offscreen.height = height
  const off = offscreen.getContext('2d')

  for (let i = 0; i < trail.length; i++) {
    const t     = 1 - i / trail.length
    const r     = HEAD_RADIUS * (0.25 + 0.75 * t)
    const alpha = Math.pow(t, 1.5)
    off.beginPath()
    off.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2)
    off.fillStyle = `rgba(0,0,0,${alpha})`
    off.fill()
  }

  off.globalCompositeOperation = 'source-in'
  off.drawImage(topImg, 0, 0, width, height)

  ctx.drawImage(offscreen, 0, 0)

  // 3. crimson glow at cursor head
  if (trail.length > 0) {
    const head = trail[0]
    const glow = ctx.createRadialGradient(
      head.x, head.y, 0,
      head.x, head.y, HEAD_RADIUS * 1.4
    )
    glow.addColorStop(0,   'rgba(192, 0, 26, 0.22)')
    glow.addColorStop(0.5, 'rgba(192, 0, 26, 0.11)')
    glow.addColorStop(1,   'rgba(0,0,0,0)')
    ctx.beginPath()
    ctx.arc(head.x, head.y, HEAD_RADIUS * 1.4, 0, Math.PI * 2)
    ctx.fillStyle = glow
    ctx.fill()
  }

  requestAnimationFrame(draw)
}

// ── Start after both images load ──────────
let loaded = 0
function onLoad() {
  if (++loaded === 2) draw()
}
bottomImg.onload = onLoad
topImg.onload    = onLoad