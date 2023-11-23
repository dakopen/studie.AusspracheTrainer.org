document.addEventListener("DOMContentLoaded", function() {
    var usernameInput = document.querySelector('[name="username"]');
    var statusIcon = document.getElementById('username_status_icon');

    usernameInput.addEventListener('keyup', function() {
        var username = this.value;
        if(username.length >= 1) { // Only check if the username is at least 3 characters
            fetch(`/auth/check_username/?username=${encodeURIComponent(username)}`)
                .then(response => response.json())
                .then(data => {
                    if(data.is_taken) {
                        statusIcon.innerHTML = '&#x2716;'; // Or use an appropriate X icon
                        statusIcon.classList.add('taken');
                        statusIcon.classList.remove('available');
                    } else {
                        statusIcon.innerHTML = '&#10004;'; // Or use an appropriate checkmark icon
                        statusIcon.classList.add('available');
                        statusIcon.classList.remove('taken');
                    }
                });
        } else {
            statusIcon.innerHTML = ''; // Clear icon when username is too short
            statusIcon.classList.remove('available', 'taken');
        }
    });
});
