const responsearea = $("#responsearea");
const responseareaScores = $("#responsearea-scores");
const textarea = $("#textarea");
const binIcon = $("#bin-icon");
const recordButton = $("#record-button");
var textareaWidth;
var textareaMaxWidth

windowResize();
/* EVENT LISTENERS */
textarea.on('input change keyup paste', function(){
    resizeTextarea();
    switchFromTimelineToText();
    checkTextareaError();
});

$(window).resize(windowResize);

// START: Text area auto size:
function resizeTextarea() {
    let computedFontSize = textarea.css("font-size");
    let fontAttr = "500 " + String(Math.max(Math.min(parseInt(computedFontSize) + 1, 50), 30)) + "px Montserrat";
    let textwidth = getTextWidth(textarea.val(), fontAttr);
    textarea.width(Math.max(textareaWidth, Math.min(textwidth + (parseInt(computedFontSize) + 1 - 36.8), window.outerWidth * 0.95)) + 'px');

    textarea.css("height", "1.6em");
    textarea.css("height", textarea.prop("scrollHeight") + "px");
    responsearea.css('width', textarea.css('width'));
}

function windowResize() {
    textareaMaxWidth = Math.min(window.outerWidth * 0.85, 800);
    textarea.css("max-width", textareaMaxWidth + "px");
    textareaWidth = Math.min(window.outerWidth * 0.85, 475);
    resizeTextarea();
}

function getTextWidth(text, font) { // important
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}
// END: Text area auto size

function clearTextarea() {
    resetFormReturnTextarea();
}

/*Dropdown Menu*/
let selectedLiId = $('.dropdown-select span img').attr('value')
$('#' + selectedLiId).hide();

$('.dropdown').click(function () {
    $(this).attr('tabindex', 1).focus();
    $(this).toggleClass('active');
    $(this).find('.dropdown-menu').slideToggle(300);

    // Do not show the already selected flag
    setTimeout(() => {
        $('#' + selectedLiId).hide();
    }, 300);
});
$('.dropdown').focusout(function () {
    $(this).removeClass('active');
    $(this).find('.dropdown-menu').slideUp(300);
});
$('.dropdown .dropdown-menu li').click(function () {
    // show the old selected flag again
    let tmpSelection = selectedLiId;
    setTimeout(() => {
        $('#' + tmpSelection).show();
    }, 300);
    
    // set the id to the new selected flag
    selectedLiId = $(this).attr('id');
    $('#hiddenSelectedLanguage').val(selectedLiId);

    var selectedText = $(this).clone().children().remove().end().text(); // Entfernt die Flagge und holt nur den Text
    var selectedFlag = $(this).find('.dropdown-flag').clone(); // Klont das Flaggenbild
    selectedFlag.height(20).width(30);

    $(this).parents('.dropdown').find('.dropdown-select > span').text(selectedText).append(selectedFlag); // Fügt zuerst das Bild und dann den Text hinzu
    $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));

    // update the placeholder of the textarea
    var selectedLanguage = selectedLiId.split('-')[2];
    let placeholderTextarea;
    switch(selectedLanguage) {
        case "gb":
            placeholderTextarea = "Practice sentence";
            break;
        case "germany":
            placeholderTextarea = "Übungssatz";
            break;
        case "france":
            placeholderTextarea = "Phrase d'exercice";
            break;
    }
    textarea.attr('placeholder', placeholderTextarea);
});

/*End Dropdown Menu*/
function generateRandomSentence() {
    let language = $('#hiddenSelectedLanguage').val();
    var selectedLanguage = language.split('-')[2];
    switch(selectedLanguage) {
        case "gb":
            language = "en-GB";
            break;
        case "germany":
            language = "de-DE";
            break;
        case "france":
            language = "fr-FR";
            break;
    }

    $.ajax({
        url: '/generate_random_sentence/?language=' + language,
        type: 'POST',
        success: function (data) {
            textarea.val(data.sentence);
            resizeTextarea();
            checkTextareaError();
            switchFromTimelineToText();
        },
        error: function (xhr, status, error) {
            // Handle error
            console.error("Error: " + error);
        }
    });
}


// https://codepen.io/shahednasser/pen/XWgbGBN
const playerButton = document.querySelector('.player-button'),
      audio = document.querySelector('audio'),
      timeline = document.getElementById('synth-timeline'),
      soundButton = document.querySelector('.sound-button'),
      playIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill=var(--rosa)>
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
  </svg>
      `,
      pauseIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill=var(--rosa)>
  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
</svg>
      `
function toggleAudio() {
    console.log(audio.paused);
    if (audio.paused) {
        audio.play();
        playerButton.innerHTML = pauseIcon;
        switchFromTextToTimeline();
    } else {
        audio.pause();
        playerButton.innerHTML = playIcon;
    }
}

function switchFromTextToTimeline() {
    timeline.style.display = 'inherit';
    $('#synth-text').css('display', 'none');
}

function switchFromTimelineToText() {
    timeline.style.display = 'none';
    $('#synth-text').css('display', 'inherit');
}

function synthSpeech() {
    var text = textarea.val();
    let language = $('#hiddenSelectedLanguage').val();
    var selectedLanguage = language.split('-')[2];
    switch(selectedLanguage) {
        case "gb":
            language = "en-GB";
            break;
        case "germany":
            language = "de-DE";
            break;
        case "france":
            language = "fr-FR";
            break;
    }

    if (text) {
        $.ajax({
            url: '/speech_synthesis/?language=' + encodeURIComponent(language) + '&text=' + encodeURIComponent(text),
            type: 'POST',
            data: {
                csrfmiddlewaretoken: csrftoken // Pass CSRF token
            },
            success: function(data) {
                var audioPlayer = $('#audio-player');
                var audioSource = $('#audio-source');
                audioSource.attr('src', data.audio_url);
                audioPlayer[0].load(); // [0] to get the native HTML element
                audioPlayer.show();
                toggleAudio();
            },
            error: function(xhr, status, error) {
                console.error("Error in speech synthesis: " + error);
            }
        });
    }
    sessionStorage.setItem('last_synth', (text + $('#hiddenSelectedLanguage').val()));
}

playerButton.addEventListener('click', function (e) {
    e.preventDefault();
    if (textarea.val() != "") {
        let last_synth = sessionStorage.getItem('last_synth');
        if (last_synth === null) {
            synthSpeech();
        }
        else {
            if (last_synth !== (textarea.val() + $('#hiddenSelectedLanguage').val())) {
                synthSpeech();
            }
            else {
                toggleAudio();
            }
        }
    }
    else {
        checkTextareaError();
    }
}
);

function changeTimelinePosition () {
  const percentagePosition = (100*audio.currentTime) / audio.duration;
  timeline.style.backgroundSize = `${percentagePosition}% 100%`;
  timeline.value = percentagePosition;
}

audio.ontimeupdate = changeTimelinePosition;

function audioEnded() {
  playerButton.innerHTML = playIcon;
}

audio.onended = audioEnded;

function changeSeek() {
  const time = (timeline.value * audio.duration) / 100;
  audio.currentTime = time;
}

timeline.addEventListener('change', changeSeek);

