const video = document.getElementById('video');
const canvasBG = document.getElementById("bg");
canvasBG.width = window.innerWidth;
canvasBG.height = window.innerHeight;
const ctx = canvasBG.getContext("2d");

var currentEmotion = "neutral";
var transitioning = false;

// Load models and start the video
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

class EmojiParticle {
    constructor(x, y, emotion, speed, color, size) {
        this.x = x;
        this.y = y;
        this.emotion = emotion;
        this.speed = speed;
        this.color = color;
        this.size = size;
    }

    draw(context) {
        context.font = `${this.size}px 'Courier New', monospace`;
        context.fillStyle = this.color;
        context.fillText(this.emotion, this.x, this.y);
    }

    moveUp(canvasHeight) {
        this.y -= this.speed;
        if (this.y + this.size < 0) {
            this.y = canvasHeight + Math.random() * 100;
            this.x = Math.random() * canvasBG.width;
        }
    }
}

function generateRandomRGBAColor() {
    let red = Math.floor(Math.random() * 255);
    let green = Math.floor(Math.random() * 255);
    let blue = Math.floor(Math.random() * 255);
    let alpha = Math.random().toFixed(1);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function createParticles(emotion, count) {
    let particles = [];
    for (let i = 0; i < count; i++) {
        let x = Math.random() * canvasBG.width;
        let y = Math.random() * canvasBG.height;
        let speed = Math.random() * 2 + 1;
        let color = generateRandomRGBAColor();
        let size = Math.random() * 30 + 20;
        particles.push(new EmojiParticle(x, y, emotion, speed, color, size));
    }
    return particles;
}

// Array to store emoji particles
var emojiParticles = createParticles(currentEmotion, 100);

function drawBackground(emotion) {
    document.getElementById('bg').style.backgroundColor = getBackgroundColorForEmotion(emotion);
}

function getBackgroundColorForEmotion(emotion) {
    switch (emotion) {
        case "angry": return "#df0000";
        case "disgusted": return "#00af00";
        case "fearful": return "#a900af";
        case "happy": return "#ffff00";
        case "neutral": return "#c7d8c4";
        case "sad": return "#4f4f4f";
        case "surprised": return "#0ff3c2";
        default: return "#ffffff";
    }
}

// Function to handle smooth transition between emotions
function transitionEmotion(newEmotion) {
    transitioning = true;
    let oldParticles = [...emojiParticles];
    let newParticles = createParticles(newEmotion, 100);
    let transitionTime = 2000;
    let startTime = null;

    function animateTransition(time) {
        if (!startTime) startTime = time;
        let progress = (time - startTime) / transitionTime;

        ctx.clearRect(0, 0, canvasBG.width, canvasBG.height);

        oldParticles.forEach(p => {
            p.moveUp(canvasBG.height);
            p.draw(ctx);
        });

        newParticles.forEach(p => {
            p.moveUp(canvasBG.height);
            p.draw(ctx);
        });

        if (progress < 1) {
            requestAnimationFrame(animateTransition);
        } else {
            emojiParticles = newParticles;
            currentEmotion = newEmotion;
            transitioning = false;
        }
    }

    requestAnimationFrame(animateTransition);
}

// Animation function
function animate() {
    if (!transitioning) {
        ctx.clearRect(0, 0, canvasBG.width, canvasBG.height);
        emojiParticles.forEach(p => {
            p.moveUp(canvasBG.height);
            p.draw(ctx);
        });
    }
    requestAnimationFrame(animate);
}

// Start the animation
animate();

// Redraw particles if the window is resized
window.onresize = function () {
    canvasBG.width = window.innerWidth;
    canvasBG.height = window.innerHeight;
    emojiParticles = createParticles(currentEmotion, 100);
};

// Function to change the emotion dynamically
function changeEmotion(newEmotion) {
    if (newEmotion !== currentEmotion && !transitioning) {
        drawBackground(newEmotion);
        transitionEmotion(newEmotion);
    }
}

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );
}

function computeColor(expressions) {
    let emotions = [];
    let emotionsVal = [];
    if(expressions.angry < 1) {
        emotions.push("angry");
        emotionsVal.push(expressions.angry);
    }
    if(expressions.disgusted < 1) {
        emotions.push("disgusted");
        emotionsVal.push(expressions.disgusted);
    }
    if(expressions.fearful < 1) {
        emotions.push("fearful");
        emotionsVal.push(expressions.fearful);
    }
    if(expressions.happy < 1) {
        emotions.push("happy");
        emotionsVal.push(expressions.happy);
    }
    if(expressions.neutral < 1) {
        emotions.push("neutral");
        emotionsVal.push(expressions.neutral);
    }
    if(expressions.sad < 1) {
        emotions.push("sad");
        emotionsVal.push(expressions.sad);
    }
    if(expressions.surprised < 1) {
        emotions.push("surprised");
        emotionsVal.push(expressions.surprised);
    }

    let exp = emotions[emotionsVal.indexOf(Math.max(...emotionsVal))];
    console.log(exp);
    changeEmotion(exp); // Update emotion text and redraw particles
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        if (resizedDetections[0]) {
            computeColor(resizedDetections[0].expressions);
        }
    }, 100);
});
