const textarea = $("#textarea");
const binIcon = $("#bin-icon");
const recordButton = $("#record-button");

windowResize();
/* EVENT LISTENERS */
textarea.on('input change keyup paste', function(){
    resizeTextarea();
});

$(window).resize(windowResize);

// START: Text area auto size:
function resizeTextarea() {
    let computedFontSize = textarea.css("font-size");
    let fontAttr = "700 " + String(Math.max(Math.min(parseInt(computedFontSize) + 1, 50), 30)) + "px Montserrat";
    textwidth = getTextWidth(textarea.val(), fontAttr);
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


//
