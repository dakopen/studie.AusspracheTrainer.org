const textarea = $("#textarea");
const binIcon = $("#bin-icon");
const recordButton = $("#record-button");
var textareaWidth;
var textareaMaxWidth

windowResize();
/* EVENT LISTENERS */
textarea.on('input change keyup paste', function(){
    resizeTextarea();
});

$(window).resize(windowResize);

// START: Text area auto size:
function resizeTextarea() {
    let computedFontSize = textarea.css("font-size");
    let fontAttr = "500 " + String(Math.max(Math.min(parseInt(computedFontSize) + 1, 50), 30)) + "px Montserrat";
    let textwidth = getTextWidth(textarea.val(), fontAttr);
    textarea.width(Math.max(textareaWidth, Math.min(textwidth + (parseInt(computedFontSize) + 1 - 36.8), window.innerWidth * 0.95)) + 'px');

    textarea.css("height", "1.6em");
    textarea.css("height", textarea.prop("scrollHeight") + "px");
    responsearea.css('width', textarea.css('width'));
}

function windowResize() {
    textareaMaxWidth = Math.min(window.innerWidth * 0.85, 800);
    textarea.css("max-width", textareaMaxWidth + "px");
    textareaWidth = Math.min(window.innerWidth * 0.85, 475);
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
        },
        error: function (xhr, status, error) {
            // Handle error
            console.error("Error: " + error);
        }
    });
}
