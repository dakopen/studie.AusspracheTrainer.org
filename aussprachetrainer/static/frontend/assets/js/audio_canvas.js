const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');
offscreenCanvas.width = 30000;  // more than enough
offscreenCanvas.height = canvas.height;


const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

let mediaRecorder;
let chunks = [];

const startRecording = () => {
  chunks = [];
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((userStream) => {
      stream = userStream;
      //const audio = document.createElement("audio");
      //audio.srcObject = stream;
      //audio.play();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.addEventListener("dataavailable", (event) => {
        chunks.push(event.data);
      });
      mediaRecorder.start();

      // start the animation and stuff
      animationFrameId = requestAnimationFrame(draw);
      recButton.innerText = 'Stop';
    })
    .catch((error) => {
      console.error(error);
    });
};

const stopRecording = () => {
  mediaRecorder.stop();

  // Stop all tracks to release the media stream
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
  }

  // Combine the chunks to form a Blob
  const blob = new Blob(chunks, { 'type': 'audio/mp3' });

  // Create a FormData object and append the blob to it
  let formData = new FormData();
  formData.append('audio_file', blob, 'audio.mp3');
  formData.append('text', textarea.val());
  // Make an AJAX request to send the FormData object to the server
  fetch('/analyze/', {
    method: 'POST',
    body: {"test": "test"},
  })
  .then(response => response.json())
  .then(data => {
    // The task id is returned here, you can now keep checking for results
    let taskID = data.task_id;
    checkStatus(taskID);
  });

};



const recButton = document.getElementById("record-button");
const recButtonContainer = document.querySelector(".button-container");
const audioContainer = document.querySelector(".audio-container");

let stream;
let x = canvas.width / 2 - document.getElementById("record-button").offsetWidth / 2;

let lastMeanFrequency = 0;
let animationFrameId;
let counter = 0;

let isRecording = false;

const moveRecButtonDown = () => {
  const recButtonContainer = document.querySelector(".button-container");
  const audioContainer = document.querySelector(".audio-container");

  let currentTop = parseInt(window.getComputedStyle(recButtonContainer).getPropertyValue('top'), 10);
  let currentHeight = parseInt(window.getComputedStyle(audioContainer).getPropertyValue('height'), 10);

  let newTop = currentTop + 150;
  let newHeight = currentHeight + 150;
  recButtonContainer.style.transition = 'top 0.5s ease-in-out';
  audioContainer.style.transition = 'height 0.5s ease-in-out';

  audioContainer.style.height = newHeight + 'px';
  recButtonContainer.style.top = newTop + 'px';
};

recButton.addEventListener("click", () => {
  isRecording = !isRecording;
  if (isRecording) {
    startRecording();
  } else {
    stopRecording();
    cancelAnimationFrame(animationFrameId);
    recButton.innerText = 'Record';

    // Capture entire offscreen canvas content and display it as an image
    const canvasImage = offscreenCanvas.toDataURL();
    const imgElement = document.createElement("img");
    imgElement.src = canvasImage;
    document.body.appendChild(imgElement);

    moveRecButtonDown();

    // replace canvas with offscreen canvas
    offscreenCanvas.className = 'offscreen-canvas-class';
    canvas.replaceWith(offscreenCanvas);

    void offscreenCanvas.offsetWidth;
    offscreenCanvas.style.left = "50%";
    
  }
});

let y, yMirrored;
let offscreenX = 0;

function draw() {
  if (!isRecording) return;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imageData, -1, 0);
  
  analyser.getByteFrequencyData(dataArray);
  const meanFrequency = dataArray.reduce((a, b) => a + b) / bufferLength;
  
  const smoothFrequency = (lastMeanFrequency + meanFrequency) / 2;

  if (counter <= 1) {
    const yHeight = Math.max((smoothFrequency / 64) * canvas.height / 2, 1);
    y = canvas.height / 2 - yHeight;
    yMirrored = canvas.height / 2 + yHeight;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, yMirrored);
    ctx.strokeStyle = 'var(--lila)';
    ctx.stroke();

    // draw an offscreen canvas
    offscreenCtx.beginPath();
    offscreenCtx.moveTo(offscreenX, y);
    offscreenCtx.lineTo(offscreenX, yMirrored);
    offscreenCtx.strokeStyle = 'var(--lila)';
    offscreenCtx.stroke();
    offscreenX += 4;
  } else if (counter <= 3) {
    // Gap
  } else {
    counter = 0;
  }

  counter++;
  lastMeanFrequency = meanFrequency;
  animationFrameId = requestAnimationFrame(draw);
}
