# Emotions AI

Real-time facial expression detection that runs entirely in the browser. Point a webcam at
a face and it labels the expression live: happy, sad, angry, fearful, disgusted, surprised
or neutral, using [face-api.js](https://github.com/justadudewhohacks/face-api.js) (built on
TensorFlow.js) for on-device face detection, landmark tracking and emotion classification.

**Live demo:** [emotions-ai.abchaudary.me](https://emotions-ai.abchaudary.me)
**Full write-up:** [abchaudary.me/projects/emotions-ai](https://abchaudary.me/projects/emotions-ai)

## What it does

- Detects a face from a live webcam feed via `getUserMedia` (WebRTC)
- Tracks 68 facial landmarks in real time
- Classifies the expression into one of seven categories at frame rate
- Draws the landmark mesh and current label as a canvas overlay on the video

## No build step, no server

There is no `package.json` in this repository. No bundler, no framework, no backend doing
inference. `index.html` loads two scripts directly, `res/face-api.min.js` and
`res/script.js`, and that is the entire application.

The twelve model files in `models/` (the tiny face detector, the 68-point landmark model
and its tiny variant, and the expression classifier weights) ship with the page and load
once in the browser. Every frame is classified on the device that opened the page. No
video frame is ever sent to a server, because there is no server to send it to, which is
what makes the privacy claim checkable rather than promised: open the network tab and
watch the weights come down with nothing going back up.

## Tech stack

| Layer | Choice |
|---|---|
| Face detection & expression classification | [face-api.js](https://github.com/justadudewhohacks/face-api.js) (TensorFlow.js) |
| Camera input | WebRTC (`getUserMedia`) |
| Rendering | HTML5 Canvas |
| Everything else | Vanilla JavaScript, no framework, no build tooling |

## Running it locally

Static files, no install and no build step. Serve the directory with anything that can
serve static assets over HTTP (browsers block camera access on `file://`), for example:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the served URL and grant camera access.

## Project structure

```
index.html          Entry point: loads face-api.js and script.js
res/
  face-api.min.js    face-api.js library
  script.js          Detection loop, canvas overlay, expression labelling
  style.css
models/              Pretrained face-api.js model weights (downloaded once, run on-device)
```

## Credits

Built on [face-api.js](https://github.com/justadudewhohacks/face-api.js) by
[justadudewhohacks](https://github.com/justadudewhohacks), itself built on
[TensorFlow.js](https://www.tensorflow.org/js).

By [Abdullah Chaudary](https://abchaudary.me).
