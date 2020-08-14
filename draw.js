const svgEl = document.createElement('div')
document.body.append(svgEl)

function svg(type, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', type)
  for (const k in attrs) {
    el.setAttribute(k, attrs[k])
  }
  return el
}

function initSvg(cont) {
  const root = svg('svg', {
    width: window.innerWidth,
    height: window.innerHeight,
  })
  cont.append(root)

  const rootSize = { w: root.clientWidth, h: root.clientHeight }
  const viewbox = { x: -500, y: -500, w: rootSize.w, h: rootSize.h }
  let mpos

  const updateViewbox = () =>
    root.setAttribute(
      'viewBox',
      `${viewbox.x} ${viewbox.y} ${viewbox.w} ${viewbox.h}`,
    )

  updateViewbox()

  root.addEventListener('mousewheel', ev => {
    ev.preventDefault()

    const { w, h } = viewbox
    const mx = ev.offsetX
    const my = ev.offsetY
    const dw = w * Math.sign(ev.deltaY) * 0.05
    const dh = h * Math.sign(ev.deltaY) * 0.05
    const dx = (mx / rootSize.w) * dw
    const dy = (my / rootSize.h) * dh

    viewbox.x -= dx
    viewbox.y -= dy
    viewbox.w += dw
    viewbox.h += dh

    updateViewbox()
  })

  root.addEventListener('mousedown', ({ x, y }) => {
    mpos = { x, y }
  })

  root.addEventListener('mousemove', ({ x, y }) => {
    if (mpos) {
      const cur = { x, y }
      const scale = rootSize.w / viewbox.w
      const dx = (mpos.x - cur.x) / scale
      const dy = (mpos.y - cur.y) / scale

      viewbox.x += dx
      viewbox.y += dy
      mpos = cur

      updateViewbox()
    }
  })

  root.addEventListener('mouseup', () => {
    mpos = null
  })

  root.addEventListener('mouseleave', () => {
    mpos = null
  })

  return root
}

const deg2rad = x => (x / 180) * Math.PI

const sleep = ms => new Promise(res => setTimeout(res, ms))

function getTurtle() {
  let pos
  let ang // deg
  let dx
  let dy
  let draw

  const root = initSvg(svgEl)

  // prettier-ignore
  const self = {
    async forward(step) {
      await sleep(1)

      const newPos = [
        pos[0] + dx * step,
        pos[1] + dy * step,
      ]

      if (draw) {
        root.append(svg('line', {
          x1: pos[0],
          y1: pos[1],
          x2: newPos[0],
          y2: newPos[1],
          style: 'stroke: rgb(255,0,0); stroke-width: 2;',
        }))
      }

      self.setposition(newPos)
    },
    left(deg) { self.setheading(ang - deg) },
    right(deg) { self.setheading(ang + deg) },

    penup() { draw = false },
    pendown() { draw = true },

    position() { return pos },
    setposition(newPos) { pos = newPos },

    heading() { return ang },
    setheading(newAng) {
      ang = newAng
      const a = deg2rad(ang)
      dx = Math.cos(a)
      dy = Math.sin(a)
    },
  }

  self.setposition([0, 0])
  self.setheading(0)
  self.pendown()

  return self
}

async function lSys(n, step, deg, seq, gens) {
  const turtle = getTurtle()

  async function nodraw() {
    turtle.penup()
    await turtle.forward(step)
    turtle.pendown()
  }

  const stack = []

  function push() {
    const state = [turtle.position(), turtle.heading()]
    stack.push(state)
  }

  function pop() {
    const [pos, ang] = stack.pop()
    turtle.setposition(pos)
    turtle.setheading(ang)
  }

  const lang = {
    F: turtle.forward.bind(turtle, step),
    '+': turtle.left.bind(turtle, deg),
    '-': turtle.right.bind(turtle, deg),
    f: nodraw,
    '[': push,
    ']': pop,
  }

  while (n--) {
    const nextSeq = []

    for (const cmd of seq) {
      const cmdSeq = cmd in gens ? gens[cmd] : [cmd]
      nextSeq.push(...cmdSeq)

      for (const a of cmdSeq) {
        if (a in lang) {
          await lang[a]()
        } else {
          console.log('unknown action:', a)
        }
      }
    }

    seq = nextSeq.join('')
  }

  console.log('done')
}

// prettier-ignore
// lSys(2, 20, 90, 'F-F-F-F', { F: 'F+FF-FF-F-F+F+FF-F-F+F+FF+FF-F' })
lSys(4, 10, 90, 'F', { 'F': 'F+F-F-F+F' })
// lSys(2, 20, 90, 'F+F+F+F', {F: 'F+f-FF+F+FF+Ff+FF-f+FF-F-FF-Ff-FFF', f: 'ffffff'})
// lSys(4, 20, 90, 'F-F-F-F', { F: 'FF-F-F-F-F-F+F' })
// lSys(4, 20, 90, 'F-F-F-F', { F: 'FF-F-F-F-FF' })
// lSys(3, 20, 90, 'F-F-F-F', { F: 'FF-F+F-F-FF' })
// lSys(4, 20, 90, 'F-F-F-F', { F: 'FF-F--F-F' })
// lSys(5, 20, 25.7, 'F', { F: 'F[+F]F[-F]F' })
// lSys(4, 20, 22.5, 'F', { F: 'FF-[-F+F+F]+[+F-F-F]' })
