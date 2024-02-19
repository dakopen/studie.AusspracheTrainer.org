// Define global state variables
let isRecording = false;
let isShowingResults = false;
let chunks = [];
let mediaRecorder;
let recordedAudio = new Audio();
let audioContext, analyser, bufferLength, dataArray;

// Canvas elements
let canvas, ctx;
let offscreenCanvas, offscreenCtx, offscreenX;
let x, y, yMirrored;
let pixelsPerSecond, realPixelsPerSecond;

// Time recording variables
let starttimeRecording, endtimeRecording;

// drawing visuals
let stream;
let animationFrameId;
let counter = 0;

// icons and other visuals
const stopRecordingIcon = document.getElementById("stop-recording-icon");
const startRecordingIcon = document.getElementById("start-recording-icon");
const waitRecordingIcon = document.getElementById("wait-recording-icon");

// buttons
const recButton = document.getElementById("record-button");
const rightRecordingButton = document.getElementById("right-button");
const replayButton = document.getElementById("replay-button");

// container
const recButtonContainer = document.querySelector(".button-container");
const audioContainer = document.querySelector(".audio-container");

// error messages
const textareaEmptyError = document.getElementById('textarea-error');

// other elements
const replayLine = document.getElementById("replay-line");


const audioOptions = determineAudioOptions(); // Determine audio options once at the start

// Function to determine supported audio format
function determineAudioOptions() {
    const audioTypes = ['audio/ogg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/mpeg'];
    for (let type of audioTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
            document.getElementById('hiddenAudioMIMEtype').value = type;
            return { 'type': type };
        }
    }
    alert("Your browser does not support any of the required audio formats. Please use a different browser.");
}


function getResponsiveCanvasWidth() {
  // Use the lesser of the window's innerWidth or a max width (e.g., 800)
  return Math.min(window.outerWidth - 50, 800);
}

function createCanvas(width, height, marginTop = '36px', addClass = 'canvas-visualizer') {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.marginTop = marginTop;
    canvas.classList.add(addClass);
    return canvas;
}

function clearAndAppendCanvas(parentSelector, newCanvas, classToRemove) {
    const parent = document.getElementById(parentSelector);
    const oldCanvases = parent.querySelectorAll(`.${classToRemove}`);
    oldCanvases.forEach(oldCanvas => parent.removeChild(oldCanvas));
    parent.appendChild(newCanvas);
}

function initializeCanvasAndOffscreen() {
    canvas = createCanvas(getResponsiveCanvasWidth(), 130);
    clearAndAppendCanvas('canvas-parent-container', canvas, 'canvas-visualizer');
    ctx = canvas.getContext('2d', { willReadFrequently: true });



    const previousOffscreenCanvas = document.querySelector('.offscreen-canvas-class');
    if (previousOffscreenCanvas) {
      previousOffscreenCanvas.remove();
    }

    offscreenCanvas = document.createElement('canvas');
    offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    offscreenCanvas.width = 30000;  // more than enough
    offscreenCanvas.height = canvas.height;
    offscreenCanvas.className = 'offscreen-canvas-class';

    offscreenX = 0;
    x = getResponsiveCanvasWidth() / 2 - document.getElementById("record-button").offsetWidth / 2;
  }

window.addEventListener('load', initializeCanvasAndOffscreen);
/*## END: initializing canvas and offscreen canvas ##*/



function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  }
}

function beforeRecordingChecks() {
  if (!checkEmptyTextarea()) return false;
  // add more checks here
  return true;
}


let replayX;

function checkEmptyTextarea() {
  const isEmpty = textarea.val().trim() === ''; // Check if textarea is empty, trimming whitespace
  textareaEmptyError.style.display = isEmpty ? 'block' : 'none'; // Show or hide error based on 'isEmpty'
  return !isEmpty; // Return true if NOT empty, false otherwise
};

function updateUIForRecordingState() {
  if (isRecording) {
      rightRecordingButton.style.display = "flex"; // ??? or style opacity 1 (from 0, check if this works)
      rightRecordingButton.style.opacity = '1'; // ??? add this later to css and make it display none

      startRecordingIcon.style.display = "none";
      stopRecordingIcon.style.display = "block";
      waitRecordingIcon.style.display = "none";

  } else {
      rightRecordingButton.style.display = "none"; // ??? same as above

      startRecordingIcon.style.display = "none";
      stopRecordingIcon.style.display = "none";
      waitRecordingIcon.style.display = "inherit";
  }
}


async function startUserMediaStream() {
  try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      window.streamReference = stream; // Keep a reference to the stream for stopping later
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      return stream;
  } catch (error) {
      console.error('Error accessing the media devices.', error);
      throw error; // Rethrow or handle as needed
  }
}


function startRecording() {
  if (!beforeRecordingChecks()) return
  ensureAudioContext();

  starttimeRecording = Date.now();
  isRecording = true;
  isShowingResults = false;

  updateUIForRecordingState();
  // ??? disable textarea updates

  initializeCanvasAndOffscreen();

  startUserMediaStream().then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = event => chunks.push(event.data);
      mediaRecorder.start(100);
      animationFrameId = requestAnimationFrame(draw);
  }).catch(console.error);
}


function stopUserMediaStream() {
  if (window.streamReference) {
      window.streamReference.getTracks().forEach(track => track.stop());
      window.streamReference = null;
  }
}

function resizeOffscreenCanvas() {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
  
  // Set the temporary canvas dimensions to match the offscreen canvas
  tempCanvas.width = offscreenCanvas.width;
  tempCanvas.height = offscreenCanvas.height;
  
  // Copy the current content of the offscreen canvas to the temporary canvas
  tempCtx.drawImage(offscreenCanvas, 0, 0);
  
  // Resize the offscreen canvas to fit the actual used width
  offscreenCanvas.width = offscreenX;
  
  // Draw the content back from the temporary canvas to the resized offscreen canvas
  offscreenCtx.drawImage(tempCanvas, 0, 0);
}

function processRecording(chunks) {
  resizeOffscreenCanvas();

  // Create a blob from the recorded chunks
  const blob = new Blob(chunks, audioOptions);
  recordedAudio.src = URL.createObjectURL(blob);
  replayX = 0;

  // Once the metadata is loaded, calculate pixels per second for playback visualization
  recordedAudio.onloadedmetadata = () => {
    const audioDuration = (endtimeRecording - starttimeRecording) / 1000;
    pixelsPerSecond = Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) / audioDuration;
    realPixelsPerSecond = offscreenCanvas.width / audioDuration;
  };

  // Stop all tracks to release the media stream
  stopUserMediaStream();

  // Prepare and submit form data
  prepareAndSubmitFormData(blob);
}

function prepareAndSubmitFormData(blob) {
  const reader = new FileReader();
  reader.onload = () => {
      document.getElementById('hiddenAudioData').value = reader.result;
      document.getElementById('hiddenTextData').value = textarea.val();
      $('#recordAudioForm').submit();
  };
  reader.onerror = (error) => console.error('FileReader Error: ', error);
  reader.readAsDataURL(blob);
}


function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    endtimeRecording = Date.now();
    isRecording = false;
    updateUIForRecordingState();
    
    processRecording(chunks);
};

rightRecordingButton.addEventListener("click", function(e) {
  e.preventDefault();
  if (isRecording && !isShowingResults) {
    cancelRecording();
  } else {
    console.warn("Unexpected state: Right button clicked when not recording or showing results.");
    // Handle any other scenarios as necessary, or simply ignore if not applicable
  }
});

// HIER WEITER MACHEN!!!
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
  responseareaScores.css('display', 'none');

  if (replayAreaShown) {
    moveRecButton(false);
  }
  resizeTextarea();
  return trainingstext;
}

function cancelRecording() {

  mediaRecorder.stop();
  stopUserMediaStream();

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


let lastMeanFrequency = 0;


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

function disableRecordButtonWhileLoading() {
  recButton.disabled = true;
}

function enableRecordButtonAfterLoading() {
  recButton.disabled = false;
}

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
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });

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
    // const red = 255 - Math.round(2.55 * percentage);
    // const green = Math.round(2.55 * percentage);

    // offscreenCtx.fillStyle = `rgba(${red}, ${green}, 0, 0.5)`;
    if (percentage < 70) {
      offscreenCtx.fillStyle = "rgba(255, 0, 0, 0.5)";
    }
    else if (percentage < 95) {
      offscreenCtx.fillStyle = "rgba(255, 255, 0, 0.5)";
    }
    else {
      offscreenCtx.fillStyle = "rgba(0, 255, 0, 0.5)";
    }
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
        disableRecordButtonWhileLoading();
        var taskID = data.task_id;
        checkStatus(taskID);
        isShowingResults = true;
      },
      error: function(err) {
        enableRecordButtonAfterLoading();
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
