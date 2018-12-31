const w = 600, h = 600
const GifEncoder = require('gifencoder')
const Canvas = require('canvas').Canvas
const fs = require('fs')
const scDiv = 0.51
const scGap = 0.05
const lines = 4
const nodes = 4
const strokeFactor = 90
const sizeFactor = 3
const color = "#4CAF50"
const backColor = "#bdbdbd"
const delay = 50

const maxScale = (scale, i, n) => {
    return Math.max(0, scale - i/n)
}

const divideScale = (scale, i, n) => {
    return Math.min(1/n, maxScale())
}

const scaleFactor = (scale) => {
    return Math.floor(scale / scDiv)
}

const mirrorValue = (scale, a, b) => {
    return (1 - scaleFactor(scale)) / a + (scaleFactor(scale)) / b
}

const updateScale = (scale, dir, a, b) => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const xScale = (j) => 1 - 2 * (j %2)

const yScale = (j) => 1 - 2 * Math.floor(j/2)

const drawVSSNode = (context, i, scale) => {
    const deg = 2 * Math.PI/3
    const gap = w / (nodes + 1)
    const size = gap / sizeFactor
    const sc1 = divideScale(scale, 0, 2)
    const sc2 = divideScale(scale, 1, 2)
    context.lineCap = 'round'
    context.lineWidth = Math.min(w, h) / 60
    context.strokeStyle = color
    context.save()
    context.translate(gap * (i + 1), h/2)
    context.rotate(Math.PI/2 * sc2)
    for (var j = 0; j < lines; j++) {
        const sc = divideScale(sc1, j, lines)
        context.save()
        context.scale(xScale(j), yScale(j))
        for (var k = 0; k < 2; k++) {
            context.save()
            context.translate(size, size)
            context.rotate(deg * sc * k)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(-size/2, 0)
            context.stroke()
            context.restore()
        }
    }
    context.restore()
}

class State {
    constructor() {
        this.scale = 0
        this.dir = 0
        this.prevScale = 0
    }

    update(cb) {
        this.scale += updateScale(this.scale, this.dir, lines, 1)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating() {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
        }
    }
}

class VSSNode {
    constructor(i) {
        this.i = i
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new VSSNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context) {
        drawVSSNode(context)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb) {
        this.state.update(cb)
    }

    startUpdating() {
        this.state.startUpdating()
    }
    getNext(dir, cb) {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class VaseShapeStep {

    constructor() {
        this.root = new VSSNode(0)
        this.curr = this.root
        this.dir = 1
        this.startUpdating()
    }

    draw(context) {
        this.root.draw(context)
    }

    update(cb) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            if (this.curr.i == 0 && this.dir == 1) {
                cb()
            }
            else {
                if (this.dir == 1) {

                    console.log(`completed animation number ${this.i}`)
                } else {

                    console.log(`completed reset of animation number ${this.i}`)
                }
                this.startUpdating()
            }
        })
    }

    startUpdating() {
        this.curr.startUpdating()
    }
}

class Renderer {
    constructor() {
        this.vss = new VaseShapeStep()
        this.running = true
    }

    render(context, cb, endcb) {
        while (this.running) {
            this.vss.draw(context)
            this.vss.update(() => {
                endcb()
                this.running = false
            })
            cb(context)
        }
    }
}

class VaseShapeStepGif {
    constructor() {
        this.renderer = new Renderer()
        this.gifEncoder = new GifEncoder(w, h)
        this.canvas = new Canvas(w, h)
        this.context = this.canvas.getContext('2d')
        this.initEncoder()
    }

    initEncoder() {
        this.gifEncoder.setDelay(50)
        this.gifEncoder.setRepeat(0)
        this.gifEncoder.setQuality(100)
    }

    create(fn) {
        this.gifEncoder.createReadStream().pipe(fs.createWriteStream(fn))
        this.gifEncoder.start()
        this.renderer.render(this.context, (context) => {
            this.gifEncoder.addFrame(this.context)
        }, () => {
            this.gifEncoder.end()
            console.log("created gif")
        })
    }

    static init(fn) {
        const vss = new VaseShapeStep()
        vss.create(fn)
    }
}

module.exports = VaseShapeStepGif.init
