const w : number = window.innerWidth
const h : number = window.innerHeight
const nodes : number = 5
const lines : number = 2
const scGap : number = 0.05
const scDiv : number = 0.51
const sizeFactor : number = 3
const strokeFactor : number = 90
const foreColor : string = "#0277BD"
const backColor : string = "#212121"

const maxScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.max(0, scale - i / n)
}

const divideScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.min(1 / n, maxScale(i, n)) * n
}
const scaleFactor : Function = (scale : number) : number => Math.floor(scale / scDiv)

const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
    const k = scaleFactor(scale)
    return (1 - k) / a + k / b
}

const updateValue : Function = (scale : number, dir : number, a : number, b : number) => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const drawLLine : Function = (context : CanvasRenderingContext2D, i : number, sc1 : number, sc2 : number, size : number) => {
    const sf : number = 1 - 2 * i
    context.save()
    context.translate(-size, size * sf * sc1)
    context.rotate(-Math.PI * 0.05 * sc2)
    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(2 * size, 0)
    context.stroke()
    context.restore()
}

const drawLTSNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = w / (nodes + 1)
    const size : number = gap / sizeFactor
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    context.save()
    context.translate(gap * (i + 1), h/2)
    for (var j = 0; j < lines; j++) {
        const sc1j : number = divideScale(sc1, 0, lines)
        const sc2j : number = divideScale(sc2, 0, lines)
        context.save()
        context.scale(1 - 2 * j, 1 - 2 * j)
        drawLLine(context, j, sc1j, sc2j, size)
        context.restore()

    }
    context.restore()
}

class LToSquareStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown  = () => {

        }
    }

    static init() {
        const stage : LToSquareStage = new LToSquareStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += updateValue(this.scale)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}
