const dropdown = $("#dropdown");
const textarea = $("#textarea");
const responsearea = $("#responsearea");
const textareaError = $("#textarea-error");
const binIcon = $("#bin-icon");
const mikrofonIcon = $("#mikrofon-icon");
const aufnehmenErrorMessage = $("#aufnehmen-fehlermeldung");
const rightButton = $("#right-button");
const leftButton = $("#left-button");
const responseText = $("#responseText");
const loadingSymbol = $("#loading-symbol");
const generierenButton = $("#generieren");
var sessionId = null;
var aufnehmen_verbieten = false;
var audioObjectListenAgain = null;
var remainingInterval = null;
var secondsPassed = 0;

const previousFeatureButton = document.querySelector('.previous-feature');
const nextFeatureButton = document.querySelector('.next-feature');



const waveform = document.getElementById("waveform");
var textareaMaxWidth = null;
var textareaWidth = null;

windowResize();
/* EVENT LISTENERS */
textarea.on('input change keyup paste', function(){
    resizeTextarea();
    checkTextareaInputServerside();
    hideAufnahmeFehler();
    hideResponsearea();
    makeTranscriptsInactive();
});

$(window).resize(windowResize);
//JQUERY
/* PAGE LOAD */
(function ($) {
    "use strict";
    // Page loading animation
    $(window).on("load", function () {
        $("#js-preloader").addClass("loaded");
        sessionId = retrieveId();
        console.log("Session-ID: " + sessionId);
        clearTextarea();
        console.log("CSRF-Token: " + getCookie("csrftoken"));
    });

})(window.jQuery);


/* SESSION ID */
// https://stackoverflow.com/questions/48095737/django-new-session-for-each-browser-tab/48112774
function retrieveId() {
    return document.getElementById("sessionId").value
}

function toggleDropdown() {
    dropdown.attr('tabindex', 1).focus();
    dropdown.toggleClass("active");
    dropdown.find(".dropdown-menu").slideToggle(300);
}

function dropdownFold() {
    console.log("fold");
    dropdown.removeClass("active");
    dropdown.find(".dropdown-menu").slideUp(300);
}

/* Funktion: Dropdown-Item pressed */
$('.dropdown .dropdown-menu li').click(function () {
    dropdown.find("span").text($(this).attr("content"));
    dropdown.find("input").attr("value", $(this).attr("content"))
});


/* get Cookie */

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/;SameSite=Lax";
}


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function resizeTextarea() {
    let computedFontSize = textarea.css("font-size");
    let fontAttr = "400 " + String(Math.max(Math.min(parseInt(computedFontSize) + 1, 50), 30)) + "px Open Sans";
    textwidth = getTextWidth(textarea.val(), fontAttr);
    textarea.width(Math.max(textareaWidth, Math.min(textwidth + (parseInt(computedFontSize) + 1 - 36.8), window.innerWidth * 0.95)) + 'px');

    textarea.css("height", "1.6em");
    textarea.css("height", textarea.prop("scrollHeight") + "px");

    resizeResponsearea();
}

function resizeResponsearea() {
    responsearea.width(Math.min(parseFloat(textarea.width()), parseInt(textarea.css("max-width"))) + "px");
}

function windowResize() {
    textareaMaxWidth = Math.min(window.innerWidth * 0.85, 750);
    textarea.css("max-width", textareaMaxWidth + "px");
    textareaWidth = Math.min(window.innerWidth * 0.85, 450);
    resizeTextarea();
}


function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}


function satzGenerieren() {
    let selectedCategory = dropdown.find("input").val();
    console.log(selectedCategory);

    parameterUrl = `/satzgenerator/?session=${sessionId}`
    fetch(parameterUrl, {
        method: "post", body: selectedCategory,
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "currenttextarea": textarea.val(),
        }
    }).then(function (data) {
        data.text().then(function (text) {
            textarea.val(text);
            resizeTextarea();
            hideAufnahmeFehler();

        })
    }
    )
}

function displayTextareaError(fehlerListe) {
    var textareaErrorText = ""
    fehlerListe.forEach(function (item, index) {
        textareaErrorText += item + " "
    });
    textareaError.html(textareaErrorText.trim())
}

/* SERVER SIDE */
function checkTextareaInputServerside() {
    if (sessionId != null) {
        parameterUrl = `/satzcheck/?session=${sessionId}`
        fetch(parameterUrl, {
            method: "post",
            body: textarea.val(),
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                mode: "same-origin"
            }
        }).then(response => response.json())
            .then(data => {
                displayTextareaError(data[0]);
                if (data[1]) {
                    binIcon.addClass("active");
                    binIcon.removeClass("inactive")
                }
                else {
                    binIcon.removeClass("active");
                    binIcon.addClass("inactive");
                }
                aufnehmen_verbieten = data[2]
            }
            );
    }
}

/* AUDIO */
// see: https://blog.addpipe.com/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/

//webkitURL is deprecated but nevertheless 
URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia() 
var rec;
//Recorder.js object 
var input;
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext;
var recordingsList = document.getElementById("recordingsList");

function toggleRecording() {
    try {
        if (rec.recording) { stopRecording(); }
        else { finalTextareaCheckBeforeRecording(); }
    }
    catch (TypeError) {        
        finalTextareaCheckBeforeRecording();
    }
}

function finalTextareaCheckBeforeRecording(){
    if (!textarea.val()) {
        displayAufnahmeFehler("Bitte erst einen Übungssatz eingeben.");
    }
    else if (aufnehmen_verbieten){
        displayAufnahmeFehler("Bitte überprüfe den Übungssatz.");
    }
    else startRecording();
}

function startRecording() {

    try {
        const collection = document.getElementsByClassName("transcript-btn");
        for (let i = 0; i < collection.length; i++) {
            if (collection[i].classList.contains("active"))
                setTextareaToOriginal();
        }  
    }
    catch (e) {
    }
     


    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
        textarea.attr("readonly", true); 
        binIcon.prop("disabled", true);
        generierenButton.prop("disabled", true);
        hideResponsearea();
        /* Aktives Mikrofon Bild */
        mikrofonIcon.attr("src", "/static/assets/images/Mikrofon_aktiv.svg");
        mikrofonIcon.css({ "width": "80%", "height": "80%" });
        /* assign to gumStream for later use */
        audioContext = new AudioContext();

        gumStream = stream;
        /* use the stream */
        
        let wave = new Wave();
        maximize_waveform();
        wave.fromStream(stream, "waveform", {
            type: "flower blocks",
            colors: ["#5c50fe", "#aa6bfd"]
        });


        input = audioContext.createMediaStreamSource(stream);
        /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
        rec = new Recorder(input, {
            numChannels: 1
        })
        //start the recording process 
        rec.record()
        console.log("Aufnahme gestartet...");
        
        leftButton.removeClass("active");
        rightButton.html("abbrechen");
        rightButton.unbind();
        rightButton.click(abortRecording);
        rightButton.addClass("active");

        remainingInterval = setInterval(secondsRemaining, 1000);
        aufnahmeTimeout = setTimeout(function () {
            console.log("Aufnahme-Timeout");
            stopRecording();
        }, 23000);

    }).catch(function (err) {
        //enable the record button if getUserMedia() fails 
        console.log("getUserMedia() fehlgeschlagen.");
        displayAufnahmeFehler("Bitte erlaube den Zugriff aud das Mikrofon");
    });
}

function endRecordingState(){
    textarea.attr("readonly", false);
    binIcon.prop("disabled", false);
    clearTimeout(aufnahmeTimeout);
    secondsPassed = 0;
    clearInterval(remainingInterval);
    hideAufnahmeFehler();
    
    rightButton.removeClass("active");

    mikrofonIcon.attr("src", "static/assets/images/Mikrofon.svg");
    mikrofonIcon.css({ "width": "62%", "height": "62%" });
    rec.stop(); //stop microphone access
    gumStream.getAudioTracks()[0].stop();
}

function abortRecording() {
    if (rec.recording) {
        endRecordingState();
        console.log("Aufnahme abgebrochen.");
    }
}

function stopRecording() {
    if (rec.recording) {
        endRecordingState();
        rec.exportWAV(sendData);
        console.log("Aufnahme beendet.");
        displayResponsearea();
    }
}


function hideResponsearea() {
    responsearea.css("transition", "0.3s");
    responsearea.removeClass("active");
    responsearea.addClass("inactive");
    leftButton.removeClass("active");
    rightButton.removeClass("active");

}

function displayResponsearea() {
    responsearea.css("transition", "1.5s");
    responsearea.removeClass("inactive");
    responsearea.addClass("active");

    responsearea.height("auto");
    responsearea.css("min-height", "250px");
    responsearea.css("font-size", parseFloat(textarea.css("font-size")) / 1.5 + "px")
}


/* SPÄTER: erneutes Anhören */
function createAudioObject(blob) {
    var url = URL.createObjectURL(blob);
    audioObjectListenAgain = document.createElement('audio');
    audioObjectListenAgain.controls = true;
    audioObjectListenAgain.src = url;
}   // ENDE SPÄTER


function sendData(data) {
    createAudioObject(data);
    console.log("Senden der Audio Dateien ans Backend...");
    parameterUrl = `/audio/?session=${sessionId}`;
    fetch(parameterUrl,
        {
            method: "post",
            body: data,
            headers: {
                "X-CSRFToken": getCookie('csrftoken'),
                "TARGETSATZ": encodeURIComponent(textarea.val()),
            },
        }
    ).then(function (data) {
        data.text().then(text => {
            if (text != "Audio empfangen") {
                displayAufnahmeFehler(text);
            }
            else {
                receiveResponse();
                console.log("receiveResponse startet");
                loadingSymbol.removeClass("inactive");
                responseText.width("50%");
                responseText.html("Audio an AusspracheTrainerIPAKI, Google und IBM senden...");
            }
        })
    })
}

function receiveResponse() {
    parameterUrl = `/result/?session=${sessionId}`;
    fetch(parameterUrl,
        {
            method: "post",
            headers: {
                "X-CSRFToken": getCookie('csrftoken'),
            },
        }
    ).then(function (data) {
        responseText.html("Aussprache wird analysiert...");
        data.text().then(text => {
            
            if (responsearea.hasClass("active")){
            responseText.html(text);
            responseText.width("100%");
            loadingSymbol.addClass("inactive");

            document.getElementById("responseText").insertBefore(audioObjectListenAgain, document.getElementById("responseText").children[1]);

            leftButton.addClass("active");
            leftButton.html("wiederholen");
            leftButton.unbind();
            leftButton.click(startRecording);

            rightButton.html("neuer Satz");
            rightButton.unbind();
            rightButton.click(clearTextarea);
            rightButton.addClass("active");}

            generierenButton.prop("disabled", false);


        })
    })
}

function secondsRemaining(audiolaenge) {
    secondsPassed++;
    displayAufnahmeFehler("Zum Beenden erneut drücken...")
    audiolaenge = 21 - secondsPassed;
    if (audiolaenge < 10 && audiolaenge > 1){
        displayAufnahmeFehler(`Zum Beenden erneut drücken... Noch ${audiolaenge} Sekunden`);
    }
    else if (audiolaenge == 1){
        displayAufnahmeFehler(`Zum Beenden erneut drücken... Noch ${audiolaenge} Sekunde`);
    }
}

function displayAufnahmeFehler(fehler){
    aufnehmenErrorMessage.css("opacity", "1");
    aufnehmenErrorMessage.html(fehler);
}

function hideAufnahmeFehler(){
    if (aufnehmenErrorMessage.html()) {
        aufnehmenErrorMessage.css("opacity", "0");
        aufnehmenErrorMessage.html("");
    }
}

function minimize_waveform() {
    waveform.style.width = "50%";
}

function maximize_waveform() {
    waveform.style.width = "330%";
}

function getChildren(n, skipMe){
    var r = [];
    for ( ; n; n = n.nextSibling ) 
       if ( n.nodeType == 1 && n != skipMe)
          r.push( n );        
    return r;
};

function getSiblings(n) {
    return getChildren(n.parentNode.firstChild, n);
}


function receiveOtherTranscripts(transcript) {
    parameterUrl = `/transcripts/?session=${sessionId}`;
    fetch(parameterUrl,
        {
            method: "post",
            body: transcript,
            headers: {
                "X-CSRFToken": getCookie('csrftoken'),
            },
        }
    ).then(function (data) {
        data.text().then(text => {
            text = JSON.parse(text);            
            textarea.val(text[0]);
            $('.farbigeAntwort-container').html(text[1]);
        })
    })
}

function setTextareaToOriginal(){
    receiveOtherTranscripts("original");        
    makeTranscriptsInactive();
}

function makeTranscriptsInactive(){
    const collection = document.getElementsByClassName("transcript-btn");
    for (let i = 0; i < collection.length; i++) {
        collection[i].classList.remove("active");
    }
}


function showTranscript(event){
    event.target.classList.toggle("active");
    getSiblings(event.target).forEach(sibling => sibling.classList.remove("active"));
    
    if (event.target.classList.contains("active")) {
        receiveOtherTranscripts(event.target.value);        
    }
    else {
        receiveOtherTranscripts("original");        
    }

}

function clearTextarea() {
    textarea.val("");
    resizeTextarea();
    textarea.select();
    hideResponsearea();
}


/* FEATURE SLIDEBAR */

function features_forward() {
    var features = document.querySelectorAll(".feature");
    var activeIndicators = document.querySelectorAll(".active-indicator");
    var active_feature = document.querySelector(".feature.active");
    for (var i = 0; i < features.length; i++) {
        if (features[i] == active_feature) {
            active_feature.classList.remove("active");
            activeIndicators[i].classList.remove("active");
            active_feature.style.transform = "translateX(-60%) scale(0.98)";
            setTimeout(function() {
                active_feature.style.transform = "";
            }, 300)
            if (i + 1 == features.length) {
                features[0].classList.add("active");
                activeIndicators[0].classList.add("active");

                break;
            }
            features[i + 1].classList.add("active");
            activeIndicators[i + 1].classList.add("active");

            break;
        }

    }
}


function features_backward() {
    var features = document.querySelectorAll(".feature");
    var activeIndicators = document.querySelectorAll(".active-indicator");
    var active_feature = document.querySelector(".feature.active");
    for (var i = 0; i < features.length; i++) {
        if (features[i] == active_feature) {
            active_feature.classList.remove("active");
            activeIndicators[i].classList.remove("active");
            active_feature.style.transform = "translateX(-40%) scale(0.98)";
            setTimeout(function() {
                active_feature.style.transform = "";

            }, 300)
            if (i == 0) {
                features[features.length - 1].classList.add("active");
                activeIndicators[features.length - 1].classList.add("active");
                break;
            }
            features[i - 1].classList.add("active");
            activeIndicators[i - 1].classList.add("active");

            break;
        }
    }
}


/* ON HOVER FUNKTION FÜR DIE FEATURE BUTTONS */



previousFeatureButton.addEventListener("pointerover", function() {
    previousFeatureButton.innerHTML = "&#171;";
});
previousFeatureButton.addEventListener("pointerout", function() {
    previousFeatureButton.innerHTML = "&#8249;";
});


nextFeatureButton.addEventListener("pointerover", function() {
    nextFeatureButton.innerHTML = "&#187;";
});
nextFeatureButton.addEventListener("pointerout", function() {
    nextFeatureButton.innerHTML = "&#8250;";

});