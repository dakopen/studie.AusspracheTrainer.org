// Define global state variables
let isRecording = false;
let isShowingResults = false;
let mediaRecorder, chunks = [];
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

// canvas setup
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
    const oldCanvases = parent.querySelector(`.${classToRemove}`);
    oldCanvases.forEach(oldCanvas => parent.removeChild(oldCanvas));
    parent.appendChild(newCanvas);
}

function initializeCanvasAndOffscreen() {
    elements.canvas = createCanvas(getResponsiveCanvasWidth(), 130);
    clearAndAppendCanvas('canvas-parent-container', canvas, 'canvas-visualizer');
    ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Create offscreen canvas
    offscreenCanvas = createCanvas(30000, canvas.height, '', 'offscreen-canvas-class');
    offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    offscreenX = 0;
    x = canvas.width / 2 - document.getElementById("record-button").offsetWidth / 2;
}

window.addEventListener('load', initializeCanvasAndOffscreen); // ??? Is this evene necessary?

// maybe put that in the other file
function checkEmptyTextarea() {
    const isEmpty = textarea.val().trim() === ''; // Check if textarea is empty, trimming whitespace
    textareaEmptyError.style.display = isEmpty ? 'block' : 'none'; // Show or hide error based on 'isEmpty'
    return !isEmpty; // Return true if NOT empty, false otherwise
};


// recording
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

function updateUIForRecordingState() {
    if (isRecording) {
        rightRecordingButton.style.display = "flex"; // ??? or style opacity 1 (from 0, check if this works)

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

async function startUserMediaStream() { // ??? async?
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    window.streamReference = stream; // Keep a reference to the stream for stopping later
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    return stream;
}

async function stopUserMediaStream() { // ??? async?
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

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    endtimeRecording = Date.now();
    isRecording = false;
    updateUIForRecordingState();
    // ??? enable textarea updates

}

function cancelRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop(); // Stop the media recorder if it's recording
    }
  
    // Reset recording flags and UI elements
    isRecording = false;
    updateUIForRecordingState();
    // ??? enable textarea updates
  
    // Release the media stream and reset the canvas
    stopUserMediaStream();

    // Cancel any ongoing animation frames related to waveform drawing
    if (typeof animationFrameId !== "undefined") {
        cancelAnimationFrame(animationFrameId);
    }

    initializeCanvasAndOffscreen(); // Prepare for a new recording session
}

rightRecordingButton.addEventListener("click", function(e) {
    e.preventDefault();
    if (isRecording && !isShowingResults) {
      cancelRecording();
    } else {
      console.warn("Unexpected state: Right button clicked when not recording or showing results.");
      // Handle any other scenarios as necessary, or simply ignore if not applicable
    }
});
  
function resetFormAndUI() {
    const trainingstext = textarea.val();
    document.getElementById('recordAudioForm').reset();
    textarea.val('');  // reset the textarea since otherwise django will autofill it

    isShowingResults = false
    
    initializeCanvasAndOffscreen();

    const replayAreaVisible = (window.getComputedStyle(replayButton).display != 'none');
    replayButton.style.display = 'none';
    replayLine.style.display = 'none';
    responsearea.css('display', 'none'); // referenced in frontend-backend.js
    responseareaScores.css('display', 'none'); // referenced in frontend-backend.js
    
    if (replayAreaVisible) {
        moveRecButton(false);
    }

    return trainingstext
}

function moveRecButton(down) {
    // Define the adjustment value
    const adjustment = 150;


    const currentTop = parseInt(window.getComputedStyle(recButtonContainer).getPropertyValue('top'), 10);
    const currentHeight = parseInt(window.getComputedStyle(audioContainer).getPropertyValue('height'), 10);
    const newTop = down ? currentTop + adjustment : currentTop - adjustment;
    const newHeight = down ? currentHeight + adjustment : currentHeight - adjustment;

    // Update styles
    recButtonContainer.style.top = `${newTop}px`;
    audioContainer.style.height = `${newHeight}px`;

    // place the replay button with right margin
    replayButton.style.marginRight = (Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) + 22) + "px";
    replayLine.style.marginRight = (Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) - 2) + "px";

    if (down) {
        setTimeout(() => {
          replayButton.style.display = 'flex';
          replayLine.style.display = 'inherit'
        }, 500);
    }
}

recButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Start recording if not currently recording and not showing results
    if (!isRecording && !isShowingResults) {
      handleStartRecording();
      return; // Exit early to avoid further checks
    }
  
    // Reset and start a new recording if showing results but not currently recording
    if (!isRecording && isShowingResults) {
      handleResetAndStartRecording();
      return; // Exit early to avoid further checks
    }
  
    // Handle stopping recording explicitly to cover any edge cases
    // Consider integrating this logic into the stopRecording function if appropriate
    if (isRecording) {
      handleStopRecording();
    }
});
  
// Encapsulate the start recording logic
function handleStartRecording() {
    startRecording();
}

// Encapsulate the logic for resetting the UI and starting a new recording
function handleResetAndStartRecording() {
    textarea.val(resetFormReturnTextarea());
    resizeTextarea();
    startRecording();
}
  
// Encapsulate the stop recording and UI adjustment logic
function handleStopRecording() {
    setTimeout(() => {
        stopRecording();
        moveRecButton(true); // Move recording button to accommodate space for results or waveform
        cancelAnimationFrame(animationFrameId); // Ensure no lingering animation frames

        // Replace the visible canvas with the offscreen canvas prepared during recording
        if (canvas.parentNode && offscreenCanvas) {
            canvas.parentNode.replaceChild(offscreenCanvas, canvas);
            offscreenCanvas.id = canvas.id; // Maintain any necessary ID or attributes
            canvas = offscreenCanvas; // Update the reference to point to the now visible offscreenCanvas

            // Adjust canvas styling to center it, assuming your CSS doesn't already handle this
            offscreenCanvas.style.cssText = "left: 50%; transform: translateX(-50%);";
        }
    }, 350); // A slight delay to allow for any needed cleanup or UI transitions
}

// I am not quite content with these functions
function disableRecordButtonWhileLoading() {
    recButton.disabled = true;
}
  
  function enableRecordButtonAfterLoading() {
    recButton.disabled = false;
}

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

function resizeAndCopyCanvasContent() {
    const maxWidth = getResponsiveCanvasWidth();
    const aspectRatio = offscreenCanvas.width / offscreenCanvas.height;
    const newWidth = Math.min(offscreenX, maxWidth);
    const newHeight = newWidth / aspectRatio;
  
    // Create a temporary canvas to hold current content
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = offscreenCanvas.width; // Original dimensions
    tempCanvas.height = offscreenCanvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(offscreenCanvas, 0, 0); // Copy content
  
    // Resize offscreen canvas
    offscreenCanvas.width = newWidth;
    offscreenCanvas.height = newHeight;
  
    // Copy content back to resized offscreen canvas
    offscreenCtx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
}
  
function colorCanvas(offsets) {
    resizeAndCopyCanvasContent(); // Handles resizing and content replication
    replayLine.style.height = `${offscreenCanvas.height}px`;
    audioContainer.style.maskImage = 'none'; // Disable mask image
  
    offsets.forEach(({startTime, endTime, percentage}) => {
      const color = getColorBasedOnPercentage(percentage);
      const startX = startTime / 1000 * pixelsPerSecond;
      const endX = endTime / 1000 * pixelsPerSecond;
      offscreenCtx.fillStyle = color;
      offscreenCtx.fillRect(startX, 0, endX - startX, offscreenCanvas.height);
    });
  
    // Ensure a single event listener for click events
    offscreenCanvas.removeEventListener('click', handleCanvasClick);
    offscreenCanvas.addEventListener('click', handleCanvasClick);
  
    updateUIForPlayback(); // Simplify UI updates for playback
}
  
function getColorBasedOnPercentage(percentage) {
    if (percentage < 70) return "rgba(255, 0, 0, 0.5)";
    if (percentage < 95) return "rgba(255, 255, 0, 0.5)";
    return "rgba(0, 255, 0, 0.5)";
}

function handleCanvasClick(event) {
    event.preventDefault();
    const rect = offscreenCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    replayX = x * 2; // Adjust if necessary for your visualization scale
    const marginRight = Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) - replayX;
    replayLine.style.marginRight = `${marginRight}px`;
    recordedAudio.currentTime = x / pixelsPerSecond;
}
  
function updateUIForPlayback() {
    startRecordingIcon.style.display = "inherit";
    waitRecordingIcon.style.display = "none";
    stopRecordingIcon.style.display = "none";
}

$(document).ready(function() {
    $('#recordAudioForm').on('submit', handleSubmit);
});

function handleSubmit(event) {
    event.preventDefault(); // Prevent the default form submission
    const form = $(this);
    const formData = new FormData(form[0]); // Assuming 'this' is the form element

    disableRecordButtonWhileLoading(); // Disable the button before the AJAX call
    submitFormData(form.attr('action'), formData)
        .then(handleSuccess)
        .catch(handleError)
        .finally(enableRecordButtonAfterLoading); // Re-enable the button after AJAX call
}

function submitFormData(url, formData) {
    return $.ajax({
        url: url,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        headers: {
            'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val() // CSRF token
        }
    });
}

function handleSuccess(data) {
    // Assuming 'checkStatus' is a function that checks the status of the task
    const taskID = data.task_id;
    checkStatus(taskID);
    isShowingResults = true; // Update the state to show results
}

function handleError(err) {
    console.error('Error:', err);
    // Handle error (e.g., show error message to the user)
}

// Assuming replayButtonIcon, replayLine, and other elements are correctly initialized

let isPlaying = false;
let replayAnimationFrameId;
let replayX = 0;

// Simplified control for replay functionality
const replayControl = {
    start() {
        recordedAudio.play();
        replayButtonIcon.classList.replace('fa-play', 'fa-pause');
        isPlaying = true;
        this.animateReplayLine();
    },
    pause() {
        recordedAudio.pause();
        cancelAnimationFrame(replayAnimationFrameId);
        replayButtonIcon.classList.replace('fa-pause', 'fa-play');
        isPlaying = false;
    },
    stop() {
        recordedAudio.pause();
        recordedAudio.currentTime = 0;
        cancelAnimationFrame(replayAnimationFrameId);
        replayX = 0;
        this.updateReplayLinePosition();
        replayButtonIcon.classList.replace('fa-pause', 'fa-play');
        isPlaying = false;
    },
    animateReplayLine(lastTimestamp = performance.now()) {
        const animate = (timestamp) => {
            const deltaTime = (timestamp - lastTimestamp) / 1000;
            replayX += pixelsPerSecond * deltaTime * 2;
            this.updateReplayLinePosition();

            if (replayX * 1/2 < (Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) - 2)) {
                replayAnimationFrameId = requestAnimationFrame(animate);
            } else {
                this.stop(); // Automatically stop when reaching the end
            }
        };
        replayAnimationFrameId = requestAnimationFrame(animate);
    },
    updateReplayLinePosition() {
        replayLine.style.marginRight = `${Math.min(offscreenCanvas.width, getResponsiveCanvasWidth()) - replayX - 2}px`;
    }
};

// Event listener for replay button
document.getElementById('replay-button').addEventListener('click', (event) => {
    event.preventDefault();
    isPlaying ? replayControl.pause() : replayControl.start();
});

// Function to jump to a specific timestamp in the waveform
function jumpToWaveformTimestamp(timestamp) {
    recordedAudio.currentTime = timestamp;
    replayX = timestamp * pixelsPerSecond * 2;
    replayControl.updateReplayLinePosition();
}
