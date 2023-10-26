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
    textarea.val("");
    resizeTextarea();
}

recordButton.on('click', function() {
    if (recordButton.text() === "Click me!") {
        recordButton.text("Started");
    } else {
        recordButton.text("Click me!");
    }
});
// START: Dropdown menu //
/*
function toggleDropdown() {
    const dropdown = document.getElementById("languageDropdown");
    const dropbtn = document.querySelector('.dropbtn');
    const currentLang = document.querySelector('.dropbtn img').getAttribute('data-lang');
    
    // Hide the current flag from dropdown
    document.querySelectorAll('#languageDropdown img').forEach(img => {
        img.style.display = img.getAttribute('data-lang') === currentLang ? 'none' : 'block';
    });

    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        dropbtn.classList.remove('active');
    } else {
        dropdown.style.display = 'block';
        dropbtn.classList.add('active');

    }
}

// Update the button to display the selected flag
document.getElementById("languageDropdown").addEventListener('click', function(e) {
    e.preventDefault();
    const btnImg = document.querySelector('.dropbtn img');
    if (e.target.tagName === 'IMG') {
        btnImg.src = e.target.src;
        btnImg.alt = e.target.alt;
        btnImg.width = e.target.width;  // Preserve width
        btnImg.height = e.target.height;  // Preserve height
        btnImg.setAttribute('data-lang', e.target.getAttribute('data-lang'));  // Update data-lang
        toggleDropdown();
    }
});
*/
/*Dropdown Menu*/
let selectedLiId = 'dropdown-lang-english';
$('#' + selectedLiId).hide();

$('.dropdown').click(function () {
    $(this).attr('tabindex', 1).focus();
    $(this).toggleClass('active');
    $(this).find('.dropdown-menu').slideToggle(300);

    // Do not show the already selected flag
    $('#' + selectedLiId).hide();
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
    }, 301);
    
    // set the id to the new selected flag
    selectedLiId = $(this).attr('id');

    var selectedText = $(this).clone().children().remove().end().text(); // Entfernt die Flagge und holt nur den Text
    var selectedFlag = $(this).find('.dropdown-flag').clone(); // Klont das Flaggenbild
    selectedFlag.height(20).width(30);

    $(this).parents('.dropdown').find('.dropdown-select > span').text(selectedText).append(selectedFlag); // Fügt zuerst das Bild und dann den Text hinzu
    $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));

});
/*
$('.dropdown .dropdown-menu li').click(function () {
    $(this).parents('.dropdown').find('span').text($(this).text());
    $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));
});
*/
/*End Dropdown Menu*/

// END: Dropdown menu //

