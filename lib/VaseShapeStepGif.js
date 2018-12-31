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
