/**# START: initializing canvas and offscreen canvas #**/

let canvas = document.getElementById('visualizer');
let ctx;

let offscreenCanvas;
let offscreenCtx;
let x, y, yMirrored;
let offscreenX;
let pixelsPerSecond;
let realPixelsPerSecond;
const rightRecordingButton = document.getElementById("right-button");
let isShowingResults = false;
const stopRecordingIcon = document.getElementById("stop-recording-icon");
const startRecordingIcon = document.getElementById("start-recording-icon");
const waitRecordingIcon = document.getElementById("wait-recording-icon");
const textareaEmptyError = document.getElementById('textarea-error');

function getResponsiveCanvasWidth() {
  // Use the lesser of the window's innerWidth or a max width (e.g., 800)
  return Math.min(window.innerWidth - 50, 800);
}

function initializeCanvasAndOffscreen() {
  canvas = document.createElement('canvas');
  // Set its dimensions
  canvas.width = getResponsiveCanvasWidth();
  canvas.height = 130;
  canvas.style.marginTop = '36px';
  canvas.classList.add('canvas-visualizer');

  // Find the parent element where the canvas should be attached
  const canvasParent = document.getElementById('canvas-parent-container');
  canvas.style.order = '-1'; // first position

  const oldCanvases = canvasParent.querySelectorAll('.canvas-visualizer');
  oldCanvases.forEach((oldCanvas) => {
    canvasParent.removeChild(oldCanvas);
  });

  // Append the new canvas element
  canvasParent.appendChild(canvas);
  

  // Re-initialize any necessary variables or event listeners for the new canvas
  ctx = canvas.getContext('2d');




  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Remove previous OffscreenCanvas if it exists
  const previousOffscreenCanvas = document.querySelector('.offscreen-canvas-class');
  if (previousOffscreenCanvas) {
    previousOffscreenCanvas.remove();
  }

  // Initialize new OffscreenCanvas
  offscreenCanvas = document.createElement('canvas');
  offscreenCtx = offscreenCanvas.getContext('2d');
  offscreenCanvas.width = 30000;  // more than enough
  offscreenCanvas.height = canvas.height;
  offscreenCanvas.className = 'offscreen-canvas-class';

  offscreenX = 0;
  x = getResponsiveCanvasWidth() / 2 - document.getElementById("record-button").offsetWidth / 2;
}

window.addEventListener('load', initializeCanvasAndOffscreen);
/*## END: initializing canvas and offscreen canvas ##*/

/*** Variable declarations for the audio ***/
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

let mediaRecorder;
let chunks = [];
let recordedAudio = new Audio();
let replayX;

/* Error if the textarea is empty */
const checkTextareaError = () => {
  if (textarea.val() === '') {
    textareaEmptyError.style.display = 'block';
    return false;
  }
  else {
    textareaEmptyError.style.display = 'none';
    return true;
  }
}

/**# START: start and stop recording functions which also triggers the drawing of the waveform #**/
const startRecording = () => {
  if (!checkTextareaError()) return;
  isRecording = true;
  isShowingResults = false;
  rightRecordingButton.style.opacity = '1';

  startRecordingIcon.style.display = "none";
  waitRecordingIcon.style.display = "none";
  stopRecordingIcon.style.display = "block";

  // initialize the canvas and offscreen canvas
  initializeCanvasAndOffscreen();

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
    })
    .catch((error) => {
      console.error(error);
    });
};

const stopRecording = () => {
  mediaRecorder.stop();
  isRecording = false;
  startRecordingIcon.style.display = "none";
  waitRecordingIcon.style.display = "inherit";
  stopRecordingIcon.style.display = "none";

  /** RESIZE OFFSCREEN CANVAS **/
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
    const audioDuration = recordedAudio.duration; // duration in seconds
    pixelsPerSecond = Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) / audioDuration;
    realPixelsPerSecond = offscreenCanvas.width / audioDuration; // use later when drawing the colored boxes (words)
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

rightRecordingButton.addEventListener("click", function(e) {
  e.preventDefault();
  if (isRecording && !isShowingResults) {
    cancelRecording();
    cancelAnimationFrame(animationFrameId);
  }
  
  else {
    // should not happen
  }
});

const resetFormReturnTextarea = () => {
  let trainingstext = textarea.val();
  document.getElementById('recordAudioForm').reset();
  textarea.val('');  // reset the textarea since otherwise django will autofill it

  isShowingResults = false;
  initializeCanvasAndOffscreen();
  let replayAreaShown = (window.getComputedStyle(replayButton).display != 'none');
  replayButton.style.display = 'none';
  replayLine.style.display = 'none';
  responsearea.css('display', 'none');
  if (replayAreaShown) {
    moveRecButton(false);
  }
  resizeTextarea();
  return trainingstext;
}

const cancelRecording = () => {
  mediaRecorder.stop();
  isRecording = false;
  startRecordingIcon.style.display = "block";
  waitRecordingIcon.style.display = "none";
  stopRecordingIcon.style.display = "none";

  // Stop all tracks to release the media stream
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
  }

  initializeCanvasAndOffscreen();
  rightRecordingButton.style.opacity = '0';
}
/*## END: start and stop recording functions which also triggers the drawing of the waveform ##*/


/*** Declarations for the visual functions below that happen right after the recording stopped***/
const recButton = document.getElementById("record-button");
const recButtonContainer = document.querySelector(".button-container");
const audioContainer = document.querySelector(".audio-container");
const replayButton = document.getElementById("replay-button");
const replayLine = document.getElementById("replay-line");

let stream;

let lastMeanFrequency = 0;
let animationFrameId;
let counter = 0;

let isRecording = false;

/**# START: move the waveform down in order to make space for the waveform #**/
const moveRecButton = (down) => {
  const recButtonContainer = document.querySelector(".button-container");

  let currentTop = parseInt(window.getComputedStyle(recButtonContainer).getPropertyValue('top'), 10);
  let currentHeight = parseInt(window.getComputedStyle(audioContainer).getPropertyValue('height'), 10);
  let newTop, newHeight;
  if (down) {
    newTop = currentTop + 150;
    newHeight = currentHeight + 150;
  }
  else {
    newTop = currentTop - 150;
    newHeight = currentHeight - 150;
  }
  
  recButtonContainer.style.transition = 'top 0.5s ease-in-out';
  audioContainer.style.transition = 'height 0.5s ease-in-out';

  audioContainer.style.height = newHeight + 'px';
  recButtonContainer.style.top = newTop + 'px';

  
  // place the replay button with right margin
  replayButton.style.marginRight = (Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) + 22) + "px";
  replayLine.style.marginRight = (Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) - 2) + "px";
  
  if (down) {
    setTimeout(() => {
      replayButton.style.display = 'flex';
      replayLine.style.display = 'inherit'
    }, 500);
  }
};
/*## END: move the waveform down in order to make space for the waveform ##*/

/**# START: start recording on first click and submit form on second click #**/
recButton.addEventListener('click', function(e) {
  e.preventDefault();
  
  if (!isRecording && !isShowingResults) {
    startRecording();
  } 
  else if (!isRecording && isShowingResults) {
    textarea.val(resetFormReturnTextarea());
    resizeTextarea();
    startRecording();
  }
  else {
    setTimeout(() => {
      rightRecordingButton.style.opacity = '0';
      stopRecording();

      moveRecButton(true);
      cancelAnimationFrame(animationFrameId);
    

      // replace canvas with offscreen canvas
      canvas.replaceWith(offscreenCanvas);

      // center canvas
      offscreenCanvas.style.left = '0';
      void offscreenCanvas.offsetWidth;
      offscreenCanvas.style.left = '50%';
      offscreenCanvas.style.transform = 'translateX(-50%)';
    }, 350); // record a bit longer than before
  }
});
/*## END: start recording on first click and submit form on second click ##*/


/**# START: draw the waveform from microphone amplitude #**/
function draw() {
  if (!isRecording) return;
  let width = getResponsiveCanvasWidth();
  const imageData = ctx.getImageData(0, 0, width, canvas.height);
  ctx.clearRect(0, 0, width, canvas.height);
  ctx.putImageData(imageData, -1, 0);
  
  analyser.getByteFrequencyData(dataArray);
  const meanFrequency = dataArray.reduce((a, b) => a + b) / bufferLength;
  
  const smoothFrequency = (lastMeanFrequency + meanFrequency) / 2;

  if (counter <= 1) {
    const yHeight = Math.max((smoothFrequency / 64) * canvas.height / 2, 1);
    //y = (canvas.height / 2 + 20) - yHeight;
    //yMirrored = (canvas.height / 2 + 20) + yHeight;
    y = (canvas.height / 2) - yHeight;
    yMirrored = (canvas.height / 2) + yHeight;

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
/*## END: draw the waveform from microphone amplitude ##*/


/**# START: add colored boxes to the canvas for each recognized word #**/

function colorCanvas(offsets) {
  const maxWidth = getResponsiveCanvasWidth();

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

  offsets.forEach((offset) => {

    const percentage = offset[2]; // between 0 and 100
    const red = 255 - Math.round(2.55 * percentage);
    const green = Math.round(2.55 * percentage);

    offscreenCtx.fillStyle = `rgba(${red}, ${green}, 0, 0.5)`;
    offscreenCtx.fillRect(offset[0] / 1000 * pixelsPerSecond, 0, offset[1] / 1000 * pixelsPerSecond, canvas.height)
  });

  // add the Event Listener for a click that changes the replay line position
  offscreenCanvas.addEventListener('click', function(event) {
    event.preventDefault();
    const rect = offscreenCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    replayX = x * 2;
    replayLine.style.marginRight = (Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) - replayX) + "px";
    recordedAudio.currentTime = x / pixelsPerSecond;
  });

  startRecordingIcon.style.display = "inherit";
  waitRecordingIcon.style.display = "none";
  stopRecordingIcon.style.display = "none";
}
/*## END: add colored boxes to the canvas for each recognized word ##*/


/**# START: submit the whole form including FormData #**/
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
        isShowingResults = true;
      },
      error: function(err) {
        console.error('Error:', err);
      }
    });
  });
});
/*## END: submit the whole form including FormData ##*/


/**# START: audio replay (including visual replay) #**/
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

    if (replayX * 1/2 >= (Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) - 2)) {
        stopReplay();
        isPlaying = !isPlaying;
        return;
    }

    replayLine.style.marginRight = (Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) - 2 - replayX) + "px";
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
    replayLine.style.marginRight = (Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) - 2) + "px";
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
    replayLine.style.marginRight = (Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) - 2 - replayX) + "px";
}
/*## END: audio replay (including visual replay) ##*/
