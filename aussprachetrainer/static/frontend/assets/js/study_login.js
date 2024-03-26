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




function toggleText(iconId) {
    var infoText = document.getElementById("infoText");
    let addinfo1 = document.getElementById("additional-info1");
    let addinfo2 = document.getElementById("additional-info2");
    let addinfo3 = document.getElementById("additional-info3");

    switch (iconId) {
      case 1:
        addinfo1.classList.remove("inactive");
        addinfo2.classList.add("inactive");
        addinfo3.classList.add("inactive");
        break;
      case 2:
        addinfo1.classList.add("inactive");
        addinfo2.classList.remove("inactive");
        addinfo3.classList.add("inactive");
        break;
      case 3:
        addinfo1.classList.add("inactive");
        addinfo2.classList.add("inactive");
        addinfo3.classList.remove("inactive");
        break;
      default:
        addinfo1.classList.add("inactive");
        addinfo2.classList.add("inactive");
        addinfo3.classList.add("inactive");
    }
  }


  document.addEventListener('DOMContentLoaded', () => {
    const weitereInfoButton = document.querySelector('.dropdown-files');
    const icon = document.querySelector('.dropdown-icon-files'); // Icon für die Rotation
    const additionalInfoDiv = document.querySelector('.additional-information');
    const iconWrappers = document.querySelectorAll('.icon-wrapper'); // Icon Wrapper für Hintergrundwechsel

    // Funktion zum Aktualisieren des Hintergrunds der Icons
    function updateIconBackground() {
        iconWrappers.forEach((iconWrapper, index) => {
            // Prüfe, ob der zugehörige Textbereich aktiv ist
            if (document.getElementById('additional-info' + (index + 1)).classList.contains('inactive')) {
                iconWrapper.querySelector('.icon').classList.add('icon-inactive');
            } else {
                iconWrapper.querySelector('.icon').classList.remove('icon-inactive');
            }
        });
    }

    weitereInfoButton.addEventListener('click', () => {
        icon.classList.toggle('dropdown-rotate');
        additionalInfoDiv.classList.toggle('inactive');
        updateIconBackground(); // Aktualisiere den Hintergrund der Icons, wenn der Hauptbutton geklickt wird
    });
    
    window.toggleText = function(index) {
        // Verberge alle Textbereiche
        document.querySelectorAll('.info-text .text').forEach(function(element) {
            element.classList.add('inactive');
        });

        // Aktiviere den angeklickten Textbereich
        document.getElementById('additional-info' + index).classList.remove('inactive');


        updateIconBackground(); // Aktualisiere den Hintergrund der Icons basierend auf dem aktiven Bereich
    }

    updateIconBackground(); // Initialisiere den Hintergrund der Icons beim Laden der Seite
});


/*
  document.addEventListener('DOMContentLoaded', () => {
    const weitereInfoButton = document.querySelector('.dropdown-files');
    const additionalInfoDiv = document.querySelector('.additional-information');
    const icon = document.querySelector('.dropdown-icon-files'); // Icon for rotation

    // Initially hide the additional information
    additionalInfoDiv.style.maxHeight = '0';
    additionalInfoDiv.style.overflow = 'hidden';
    additionalInfoDiv.style.transition = 'max-height 0.5s ease'; // Verlängert für sanfteren Übergang

    let addinfo1 = document.getElementById("additional-info1");
    let addinfo2 = document.getElementById("additional-info2");
    let addinfo3 = document.getElementById("additional-info3");
    let addinfoIcons = document.getElementById("icon-wrapper-addinfo");
    var scrollHeight = Math.max(addinfo1.scrollHeight, addinfo2.scrollHeight, addinfo3.scrollHeight, addinfoIcons.scrollHeight); // Etwas zusätzlicher Platz
    
    weitereInfoButton.addEventListener('click', () => {
        if (additionalInfoDiv.style.maxHeight === '0px') {
            additionalInfoDiv.style.maxHeight = scrollHeight + 'px';
            icon.classList.add('dropdown-rotate');
            additionalInfoDiv.style.overflow = 'visible';
        } else {
            additionalInfoDiv.style.maxHeight = '0';
            setTimeout(() => {
                additionalInfoDiv.style.overflow = 'hidden';
            }, 500); // Warte auf das Ende der Transition, bevor overflow auf 'hidden' gesetzt wird
            icon.classList.remove('dropdown-rotate');
        }
    });
});
*/

window.onload = function() {
    const form = document.getElementById("schoolForm");

    form.onsubmit = async function(e) {
      e.preventDefault(); // Verhindert das Standard-Absendeverhalten

      // Verwendet Fetch API, um das Formular zu senden
      const response = await fetch("https://formspree.io/f/mrgnybzv", {
        method: 'POST',
        body: new FormData(form),
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) { // Überprüft, ob die Anfrage erfolgreich war
        form.reset(); // Setzt das Formular zurück
        alert("Erfolg! Ihre Nachricht wurde gesendet."); // Zeigt eine Erfolgsmeldung an
      } else {
        alert("Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut.");
      }
    }
  }