function checkStatus(taskId) {
    fetch(`/check_status/${taskId}/`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'SUCCESS') {
                // Handle the result here
                displayResult(data.result);
            } else if (data.status !== 'FAILURE') {
                // If the task is still pending or running, check again in a few seconds
                setTimeout(() => checkStatus(taskId), 3000);
            } else {
                // Handle failure here
                displayError();
            }
        });
}

function displayResult(result) {
    // Zeige das Ergebnis im DOM an
    document.getElementById("result").innerHTML = result;
}

function displayError() {
    // Zeige einen Fehler im DOM an
    document.getElementById("result").innerHTML = "Ein Fehler ist aufgetreten.";
}

