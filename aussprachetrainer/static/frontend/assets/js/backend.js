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
            const defaultUrl = `/${languagePrefix}/`;

            // Replace the current URL with the default URL
            window.history.pushState(null, null, defaultUrl);

            // Change the browser title
            document.title = "AusspracheTrainer";

            if (data.status === 'SUCCESS') {
                // Handle the result here
                //displayResult(data.result);                
                // DEBUG::
                displayError();

            } else if (data.status !== 'FAILURE') {
                // If the task is still pending or running, check again in a few seconds
                setTimeout(() => checkStatus(taskId), 2000);
            } else {
                // Handle failure here
                displayError();
            }
        });
}

function displayResult(result) {
    // Show result in the DOM
    document.getElementById("result").innerHTML = result;
}

function displayError() {
    // Show error in the DOM
    fetch("/analysis_error/")
    .then(response => response.json())
    .then(data => {
        document.getElementById("result").innerHTML = data;
    });
}

