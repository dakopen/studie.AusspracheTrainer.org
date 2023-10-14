const responsearea = $("#responsearea");

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
            window.history.pushState(null, null, defaultUrl);

            // Change the browser title
            document.title = "AusspracheTrainer";

            if (data.status === 'SUCCESS') {
                // Handle the result here
                displayResult(data.result);                

            } else if (data.status !== 'FAILURE') {
                // If the task is still pending or running, check again in a few seconds
                setTimeout(() => checkStatus(taskId), 2000);
            } else {
                console.log(data);
                // Handle failure here
                displayError();
            }
        });
}

function displayResult(result) {
    console.log(result);
    responsearea.html(); // clear previous responsearea
    responsearea.css('display', 'inline-block')
    responsearea.css('width', textarea.css('width'));
    let firstWord = true;

    // Show result in the DOM
    let paragraph = result[0]['Paragraph'];
    let words = result[0]['Words'];

    // Display paragraph scores
    document.getElementById('resultDiv').innerHTML += `<p>Accuracy Score: ${paragraph.accuracy_score}</p>`;
    document.getElementById('resultDiv').innerHTML += `<p>Completeness Score: ${paragraph.completeness_score}</p>`;
    document.getElementById('resultDiv').innerHTML += `<p>Fluency Score: ${paragraph.fluency_score}</p>`;

    // Display word-by-word analysis
    let wordTable = "<table><tr><th>Index</th><th>Word</th><th>Accuracy Score</th><th>Error Type</th></tr>";
    let index = 0;
    words.forEach(word => {
        wordTable += `<tr><td>${word.index}</td><td>${word.word}</td><td>${word.accuracy_score}</td><td>${word.error_type}</td></tr>`;
        
        const red = 255 - Math.round(2.55 * word.accuracy_score);
        const green = Math.round(2.55 * word.accuracy_score);
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
            case 'None':
                wordSpan.style.color = `rgba(${red}, ${green}, 0, 0.5)`;
                wordSpan.innerText = word.word;
                wordSpan.classList.add('waveform-word');
                console.log(result[1]);
                console.log(result[1][index][0] / 1000);
                let timestamp = result[1][index][0] / 1000;
                wordSpan.addEventListener('click', () => {
                    jumpToWaveformTimestamp(timestamp);
                });
                index++;
                break;

        }
        wordSpan.classList.add('response-word');
        responsearea.append(wordSpan);

        // TODO: 3 different styles for all error types and then
        // have for all error types another class and for all error types
        // except the Omission class get matched for highlight Waveform und jump thing
        // which I will program later
    });
    wordTable += "</table>";
    document.getElementById('resultDiv').innerHTML += wordTable;

    colorCanvas(result[1])
    //document.getElementById("result").innerHTML = result;
}

function displayError() {
    // Show error in the DOM
    fetch("/analysis_error/")
    .then(response => response.json())
    .then(data => {
        document.getElementById("result").innerHTML = data;
    });
}

