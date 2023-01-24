const video = document.getElementById('video')
const canvasBG = document.getElementById("bg")
const ctx = canvasBG.getContext("2d")

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]).then(startVideo)
  

class RandomParticle {
    constructor(x, y, maxRadius = 10){
      this.x = x
      this.y = y

      this.r = Math.floor(Math.random() * maxRadius)
      this.color = this.generateRandomRGBAColor()
    }

    generateRandomRGBAColor(){
      let red = Math.floor(Math.random() * 255)
      let green = Math.floor(Math.random() * 255)
      let blue = Math.floor(Math.random() * 255)
      let alpha = Math.floor(Math.random() * 10) / 10

      return `rgba(${red}, ${green}, ${blue}, ${alpha}`
    }

    draw(context){
      this.context = context

      context.beginPath()
      context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false)
      context.closePath()

      context.fillStyle = this.color
      context.fill()
    }

    moveDown(canvaHeight = 400){
      this.y -= 1
      if(this.y <= (0 - this.r)){
        this.y = canvaHeight + this.r
      }
      this.draw(this.context)
    }
}
let circles = []
for(let i = 0; i < 100; i++){
    let circle = new RandomParticle(Math.random() * canvasBG.width, Math.random() * canvasBG.height, 20)
    circles.push(circle)
    circle.draw(ctx)
}

function animate() {
    ctx.clearRect(0, 0, canvasBG.width, canvasBG.height);

    for (var circle of circles) {
        circle.moveDown(canvasBG.height);
    }
    requestAnimationFrame(animate)
}
animate()

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

function drawEmojis() {
    //
}

function computeColor(expressions) {
    let emotions = []
    let emotionsVal = []
    if(expressions.angry<1) {
        emotions.push("angry")
        emotionsVal.push(expressions.angry)
    }
    if(expressions.disgusted<1) {
        emotions.push("disgusted")
        emotionsVal.push(expressions.disgusted)
    }
    if(expressions.fearful<1) {
        emotions.push("fearful")
        emotionsVal.push(expressions.fearful)
    }
    if(expressions.happy<1) {
        emotions.push("happy")
        emotionsVal.push(expressions.happy)
    }
    if(expressions.neutral<1) {
        emotions.push("neutral")
        emotionsVal.push(expressions.neutral)
    }
    if(expressions.sad<1) {
        emotions.push("sad")
        emotionsVal.push(expressions.sad)
    }
    if(expressions.surprized<1) {
        emotions.push("surprized")
        emotionsVal.push(expressions.surprized)
    }
    // console.log(emotions[emotionsVal.indexOf(Math.max(...emotionsVal))])

    let exp = emotions[emotionsVal.indexOf(Math.max(...emotionsVal))]
    console.log(exp)

    switch(exp){
        case "angry":
            document.getElementById('bg').style.backgroundColor = "#df0000"
            break
        case "disgusted":
            document.getElementById('bg').style.backgroundColor = "#00af00"
            break
        case "fearful":
            document.getElementById('bg').style.backgroundColor = "#a900af"
            break
        case "happy":
            document.getElementById('bg').style.backgroundColor = "#ffff00"
            drawEmojis()
            break
        case "neutral":
            document.getElementById('bg').style.backgroundColor = "#c7d8c4"
            break
        case "sad":
            document.getElementById('bg').style.backgroundColor = "#4f4f4f"
            break
        case "surprized":
            document.getElementById('bg').style.backgroundColor = "#0ff3c2"
            break
    }
    // console.log(expressions)
    // console.log(Math.max(...emotionsVal))
    // console.log(expressions)
}


video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    if(resizedDetections[0]){
        computeColor(resizedDetections[0].expressions)
    }
  }, 100)
})