

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
    // ??? enable textarea updates

}