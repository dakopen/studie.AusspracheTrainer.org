const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');
offscreenCanvas.width = 30000;  // more than enough
offscreenCanvas.height = canvas.height;
offscreenCanvas.className = 'offscreen-canvas-class';


const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

let mediaRecorder;
let chunks = [];
let recordedAudio = new Audio();
let replayX;


const startRecording = () => {
  chunks = [];
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((userStream) => {
      stream = userStream;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
      };

      mediaRecorder.addEventListener("dataavailable", (event) => {
        chunks.push(event.data);
      });
      mediaRecorder.start(100);

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

  /**RESIZE OFFSCREEN CANVAS **/
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  // Set the temporary canvas dimensions
  tempCanvas.width = offscreenCanvas.width;
  tempCanvas.height = offscreenCanvas.height;

  // Copy current content of offscreenCanvas to temporary canvas
  tempCtx.drawImage(offscreenCanvas, 0, 0);

  // Resize the offscreenCanvas
  offscreenCanvas.width = offscreenX;


  // Draw back the copied content to resized offscreenCanvas
  offscreenCtx.drawImage(tempCanvas, 0, 0);

  // Combine the chunks to form a Blob
  var blob = new Blob(chunks, { 'type': 'audio/ogg' });
  recordedAudio.src = URL.createObjectURL(blob);
  replayX = 0;
  recordedAudio.onloadedmetadata = function() {
    const audioDuration = recordedAudio.duration; // Dauer in Sekunden
    pixelsPerSecond = Math.min(offscreenCanvas.width, 800) / audioDuration;
    realPixelsPerSecond = offscreenCanvas.width / audioDuration;
    
  };
  // Stop all tracks to release the media stream
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
  }

  const reader = new FileReader();
  reader.onload = () => {
    const base64data = reader.result;
    document.getElementById('hiddenAudioData').value = base64data;
    
    document.getElementById('hiddenTextData').value = textarea.val();
    
    $('#recordAudioForm').submit();

  };

  reader.onerror = (error) => {
    console.error('FileReader Error: ', error);
  };

  reader.readAsDataURL(blob);

};


const recButton = document.getElementById("record-button");
const recButtonContainer = document.querySelector(".button-container");
const audioContainer = document.querySelector(".audio-container");
const replayButton = document.getElementById("replay-button");
const replayLine = document.getElementById("replay-line");

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

  // place the replay button with right margin (+ 10 because the button is 20x20px)
  replayButton.style.marginRight = (Math.min(offscreenCanvas.width, 800) + 10) + "px";
  replayLine.style.marginRight = (Math.min(offscreenCanvas.width, 800) - 13) + "px";
  setTimeout(() => {
    replayButton.style.display = 'flex';
    replayLine.style.display = 'inherit'
  }, 500);
};

recButton.addEventListener('click', function(e) {
  e.preventDefault();
  
  isRecording = !isRecording;
  if (isRecording) {
    startRecording();
  } else {
    setTimeout(() => {
      stopRecording();
      cancelAnimationFrame(animationFrameId);
       // Capture entire offscreen canvas content and display it as an image
      const canvasImage = offscreenCanvas.toDataURL();
      const imgElement = document.createElement("img");
      imgElement.src = canvasImage;
      document.body.appendChild(imgElement);

      moveRecButtonDown();

      // replace canvas with offscreen canvas
      canvas.replaceWith(offscreenCanvas);

      // center canvas
      offscreenCanvas.style.left = '0';
      void offscreenCanvas.offsetWidth;
      offscreenCanvas.style.left = '50%';
      offscreenCanvas.style.transform = 'translateX(-50%)';
    }, 150); // record a bit longer than before
    recButton.innerText = 'Record';   
  }

});

let y, yMirrored;
let offscreenX = 0;
let pixelsPerSecond;
let realPixelsPerSecond;

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

function colorCanvas(offsets) {
  offsets.forEach((offset) => {

    const percentage = offset[2]; // between 0 and 100
    const red = 255 - Math.round(2.55 * percentage);
    const green = Math.round(2.55 * percentage);
  
    offscreenCtx.fillStyle = `rgba(${red}, ${green}, 0, 0.5)`;
    offscreenCtx.fillRect(realPixelsPerSecond * offset[0] / 1000 + 6.5, 0, realPixelsPerSecond * offset[1] / 1000, canvas.height);
  });

  const maxWidth = 800;

  // Original dimensions
  const originalWidth = offscreenCanvas.width;
  const originalHeight = offscreenCanvas.height;

  // Aspect ratio
  const aspectRatio = originalWidth / originalHeight;

  // Create a temporary canvas and context
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  // Set the temporary canvas dimensions
  tempCanvas.width = originalWidth;
  tempCanvas.height = originalHeight;

  // Copy current content of offscreenCanvas to temporary canvas
  tempCtx.drawImage(offscreenCanvas, 0, 0);

  // Update the dimensions of the offscreenCanvas
  if (offscreenX > maxWidth) {
    offscreenCanvas.width = maxWidth;
    offscreenCanvas.height = maxWidth / aspectRatio;

  } else {
    offscreenCanvas.width = offscreenX;
    offscreenCanvas.height = offscreenX / aspectRatio;
  }

  replayLine.style.height = offscreenCanvas.height + "px";
  // Scale and draw back the copied content to resized offscreenCanvas
  offscreenCtx.drawImage(tempCanvas, 0, 0, originalWidth, originalHeight, 0, 0, offscreenCanvas.width, offscreenCanvas.height); 

  // disable audio container mask-image:
  audioContainer.style.maskImage = 'none';

  // add the Event Listener for a click that changes the replay line position
  offscreenCanvas.addEventListener('click', function(event) {
    event.preventDefault();
    const rect = offscreenCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    replayX = x * 2;
    replayLine.style.marginRight = (Math.min(offscreenCanvas.width, 800) - replayX) + "px";
    recordedAudio.currentTime = x / pixelsPerSecond;
  });

}


$(document).ready(function() {
  $('#recordAudioForm').on('submit', function(e) {
    e.preventDefault();  // Prevent the form from submitting the traditional way

    var formData = new FormData(this);  // Create a FormData object from the form

    $.ajax({
      url: $(this).attr('action'),  // Get the action URL from the form
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val()  // Get the CSRF token from the form
      },
      success: function(data) {
        var taskID = data.task_id;
        checkStatus(taskID);
        
      },
      error: function(err) {
        console.error('Error:', err);
      }
    });
  });
});
let isPlaying = false;
let replayAnimationFrameId;
let lastTimestamp = 0;
let justResumed = false;
const replayButtonIcon = document.getElementById('replay-button-icon');

const moveReplayLine = (timestamp) => {
    if (!lastTimestamp || justResumed) {
      lastTimestamp = timestamp;
      justResumed = false;  // Reset the flag
    }

    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    replayX += pixelsPerSecond * deltaTime * 2; 

    if (replayX * 1/2 >= (Math.min(offscreenCanvas.width, 800) - 13)) {
        stopReplay();
        isPlaying = !isPlaying;
        return;
    }

    replayLine.style.marginRight = (Math.min(offscreenCanvas.width, 800) - 13 - replayX) + "px";
    replayAnimationFrameId = requestAnimationFrame(moveReplayLine);
};

const startReplay = () => {
    recordedAudio.play();
    replayButtonIcon.classList.remove('fa-play');
    replayButtonIcon.classList.add('fa-pause');
    justResumed = true;  // Set the flag
    replayAnimationFrameId = requestAnimationFrame(moveReplayLine);
};

const pauseReplay = () => {
    recordedAudio.pause();
    cancelAnimationFrame(replayAnimationFrameId);
    replayButtonIcon.classList.remove('fa-pause');
    replayButtonIcon.classList.add('fa-play');
};

const stopReplay = () => {
    recordedAudio.pause();
    recordedAudio.currentTime = 0;
    cancelAnimationFrame(replayAnimationFrameId);
    replayX = 0;
    replayLine.style.marginRight = (Math.min(offscreenCanvas.width, 800) - 13) + "px";
    lastTimestamp = 0;
    replayButtonIcon.classList.remove('fa-pause');
    replayButtonIcon.classList.add('fa-play');
};

document.getElementById('replay-button').addEventListener('click', function(event) {
    event.preventDefault();

    if (isPlaying) {
        pauseReplay();
    } else {
        startReplay();
    }
    isPlaying = !isPlaying;
});

function jumpToWaveformTimestamp(timestamp) {
    recordedAudio.currentTime = timestamp;
    replayX = timestamp * pixelsPerSecond * 2;
    replayLine.style.marginRight = (Math.min(offscreenCanvas.width, 800) - 13 - replayX) + "px";
}