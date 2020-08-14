import tkinter as tk
from turtle import RawTurtle, TurtleScreen, ScrolledCanvas
from functools import partial


def get_turtle():
    class MyTurtle(RawTurtle):
        def __init__(self, canvas):
            super().__init__(canvas)
            self.bbox = [0, 0, 0, 0]

        def _update_bbox(self):
            pos = self.position()

            if pos[0] < self.bbox[0]:
                self.bbox[0] = pos[0]
            elif pos[0] > self.bbox[2]:
                self.bbox[2] = pos[0]

            if pos[1] < self.bbox[1]:
                self.bbox[1] = pos[1]
            elif pos[1] > self.bbox[3]:
                self.bbox[3] = pos[1]

            min_x, min_y, max_x, max_y = self.bbox
            w = max(0 - min_x, max_x) * 2 + 100
            h = max(0 - min_y, max_y) * 2 + 100
            screen.screensize(w, h)

        def forward(self, *args):
            super().forward(*args)
            self._update_bbox()

        def backward(self, *args):
            super().backward(*args)
            self._update_bbox()

        def right(self, *args):
            super().right(*args)
            self._update_bbox()

        def left(self, *args):
            super().left(*args)
            self._update_bbox()

        def goto(self, *args):
            super().goto(*args)
            self._update_bbox()

        def setx(self, *args):
            super().setx(*args)
            self._update_bbox()

        def sety(self, *args):
            super().sety(*args)
            self._update_bbox()

        def setheading(self, *args):
            super().setheading(*args)
            self._update_bbox()

        def home(self, *args):
            super().home(*args)
            self._update_bbox()

    def zoom(ev):
        amount = 0.9 if ev.delta < 0 else 1.1
        canvas.scale(tk.ALL, 0, 0, amount, amount)

    class drag:
        pos = None

    def release(ev):
        drag.pos = None

    def move(ev):
        if not drag.pos:
            drag.pos = ev.x, ev.y

        px, py = drag.pos
        x, y = ev.x, ev.y
        canvas.move(tk.ALL, x - px, y - py)
        drag.pos = x, y

    root = tk.Tk()
    canvas = ScrolledCanvas(root, width=2000, height=2000)
    canvas.pack(fill=tk.BOTH, expand=tk.YES)
    canvas.bind('<MouseWheel>', zoom)
    canvas.bind('<ButtonRelease-1>', release)
    canvas.bind('<B1-Motion>', move)
    screen = TurtleScreen(canvas)
    turtle = MyTurtle(screen)
    turtle.speed(0)
    turtle.color('red', 'yellow')
    return turtle, screen.mainloop


def l_sys(n, step, deg, seq, gens):
    turtle, loop = get_turtle()

    def nodraw():
        turtle.penup()
        turtle.forward(step)
        turtle.pendown()

    stack = []

    def push():
        state = turtle.position(), turtle.heading()
        stack.append(state)

    def pop():
        pos, ang = stack.pop()
        turtle.setposition(pos)
        turtle.setheading(ang)

    lang = {
        'F': partial(turtle.forward, step),
        '+': partial(turtle.left, deg),
        '-': partial(turtle.right, deg),
        'f': nodraw,
        '[': push,
        ']': pop,
    }

    while n:
        next_seq = []

        for cmd in seq:
            cmd_seq = gens[cmd] if cmd in gens else [cmd]
            next_seq += cmd_seq

            for a in cmd_seq:
                if a in lang:
                    lang[a]()
                else:
                    print('unknown action: ', a)

        seq = ''.join(next_seq)
        n -= 1

    print('done')
    loop()


l_sys(2, 20, 90, 'F-F-F-F', {'F': 'F+FF-FF-F-F+F+FF-F-F+F+FF+FF-F'})
# l_sys(4, 30, 90, '-F', {'F': 'F+F-F-F+F'})
# l_sys(2, 20, 90, 'F+F+F+F', {'F': 'F+f-FF+F+FF+Ff+FF-f+FF-F-FF-Ff-FFF', 'f': 'ffffff'})
# l_sys(4, 20, 90, 'F-F-F-F', {'F': 'FF-F-F-F-F-F+F'})
# l_sys(4, 20, 90, 'F-F-F-F', {'F': 'FF-F-F-F-FF'})
# l_sys(3, 20, 90, 'F-F-F-F', {'F': 'FF-F+F-F-FF'})
# l_sys(4, 20, 90, 'F-F-F-F', {'F': 'FF-F--F-F'})

# l_sys(5, 20, 25.7, 'F', {'F': 'F[+F]F[-F]F'})
# l_sys(4, 20, 22.5, 'F', {'F': 'FF-[-F+F+F]+[+F-F-F]'})
