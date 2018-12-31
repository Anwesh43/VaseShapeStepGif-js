const w = 600, h = 600
const GifEncoder = require('gifencoder')
const Canvas = require('canvas').Canvas
const scDiv = 0.51
const scGap = 0.05
const lines = 4
const nodes = 4
const strokeFactor = 90
const sizeFactor = 3
const color = "#4CAF50"
const backColor = "#bdbdbd"

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

    startUpdating(cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}
