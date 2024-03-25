document.addEventListener('DOMContentLoaded', (event) => {
    // Check for EULA agreement cookie
    let studyAgreed = getCookie("studyAgreed");
    if(studyAgreed === "true") {
        document.getElementById("study-checkbox").checked = true;
    }
});

function handleKey(event, prevId, nextId) {
    let target;
    // Handle character replacement and focus shift
    
    if (nextId === 'submit-button' && event.key === "Enter") {
        event.preventDefault(); // Prevent default to avoid submitting form
        let checkbox = document.getElementById('study-checkbox');
        checkbox.checked = !checkbox.checked; // Toggle checkbox state
        setCookie("studyAgreed", checkbox.checked, 365); // Save state in cookie
        return;
    }

    if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9]/)) {
        event.preventDefault(); // Prevent default to manage input manually
        event.target.value = event.key; // Replace the current value with the new key
        // Move focus to the next field or button
        if (nextId === 'submit-button') {
            document.getElementById('submit-button').focus();
        } else {
            target = document.getElementById(nextId);
            if (target) target.focus();
        }
        return; // Exit function after handling character input
    }

    switch(event.key) {
        case "Backspace":
            if (event.target.value.length === 0 || event.target.id === 'submit-button') {
                target = document.getElementById(prevId);
                target.value = target.value.slice(0, -1); // Remove last character
                target.focus();
            } else {
                event.target.value = ''; // Clear current field if it has a character
            }
            break;
        case "ArrowLeft":
            target = document.getElementById(prevId);
            if (target) target.focus();
            break;
        case "ArrowRight":
            target = document.getElementById(nextId);
            if (target) target.focus();
            break;
        default:
            break; // Do nothing for other keys
    }
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=None; Secure";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}