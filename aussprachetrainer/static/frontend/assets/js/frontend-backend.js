function checkStatus(taskId) {
    fetch(`/check_status/${taskId}/`)
        .then(response => response.json())
        .then(data => {
            // ***** Change the URL and browser title *****
            // Get the current URL
            const currentUrl = window.location.href;

            // Extract the language prefix (e.g., "/de" or "/en")
            const languagePrefix = currentUrl.split('/')[3];

            // Construct the new URL with the same language prefix
            const defaultUrl = `/${languagePrefix}/result/`;

            // Replace the current URL with the default URL
            //window.history.pushState(null, null, defaultUrl); disabled for now

            // Change the browser title
            document.title = "AusspracheTrainer";

            if (data.status === 'SUCCESS') {
                // Handle the result here
                displayResult(data.result);
                enableRecordButtonAfterLoading();

            } else if (data.status !== 'FAILURE') {
                // If the task is still pending or running, check again in a few seconds
                setTimeout(() => checkStatus(taskId), 2000);
            } else {
                console.log(data);
                // Handle failure here
                displayError();
                enableRecordButtonAfterLoading();
            }
        });
}

function displayResult(result) {
    responsearea.empty(); // clear previous responsearea
    responseareaScores.empty(); // clear previous responseareaScores
    responsearea.css('display', 'inline-block')
    responsearea.css('width', textarea.css('width'));

    let words = result[0]['Words'];


    let index = 0;
    words.forEach(word => {
     
        // const red = 255 - Math.round(2.55 * word.accuracy_score);
        // const green = Math.round(2.55 * word.accuracy_score);
        let wordSpan = document.createElement('span');

        switch (word.error_type) {
            case 'Omission':
                wordSpan.style.color = "red";
                wordSpan.innerText = "[" + word.word + "]";
                wordSpan.classList.add('omission-word');
                break;
            case 'Insertion':
                wordSpan.classList.add('insertion-word');
                // no break here!!
            case 'Mispronunciation':
                // no break here!!
            case 'None':
                // wordSpan.style.color = `rgba(${red}, ${green}, 0, 0.5)`;
                if (word.accuracy_score < 70) {
                    wordSpan.style.color = "var(--darkred)";
                }
                else if (word.accuracy_score < 95) {
                    wordSpan.style.color = "var(--yellow)";
                }
                else {
                    wordSpan.style.color = "black";
                }
                
                wordSpan.innerText = word.word;
                wordSpan.classList.add('waveform-word');
                let timestamp = result[1][index++][0] / 1000;
                wordSpan.addEventListener('click', () => {
                    jumpToWaveformTimestamp(timestamp);
                });
                break;

        }
        wordSpan.classList.add('response-word');
        responsearea.append(wordSpan);
    });

    colorCanvas(result[1])


    // Show result in the DOM
    let paragraph = result[0]['Paragraph'];
    let responseScoreSpan = document.createElement('span');
    const accuracy = Math.round(paragraph.accuracy_score);
    const completeness = Math.round(paragraph.completeness_score);
    const fluency = Math.round(paragraph.fluency_score);

    // Füge die formatierten Scores zum Span-Element hinzu
    responseScoreSpan.innerHTML = `${djangoTranslations.accuracy}: <b>${accuracy}</b> | ${djangoTranslations.completeness}: <b>${completeness}</b> | ${djangoTranslations.fluency}: <b>${fluency}</b>`;    responseareaScores.append(responseScoreSpan);
    responseareaScores.css('display', 'inline-block');
}

function displayError() {
    // Show error in the DOM
    fetch("/analysis_error/")
    .then(response => response.json())
    .then(data => {
        document.getElementById("result").innerHTML = data;
    });
}

