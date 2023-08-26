const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navBar = document.querySelector(".navbar");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    document.body.classList.toggle("unscrollable");
}

window.addEventListener(
    "scroll", 
    function() {
        if (window.scrollY == 0) {
            navBar.style.boxShadow = "";
            navBar.style.backgroundColor = "var(--white)";
        } else {
            navBar.style.boxShadow = "0px 0px 6px 2px var(--lila)";
            navBar.style.backgroundColor = "var(--white-rosa)";
        }
    }
);

function changeLanguage(language) {
    // Make an AJAX call to change the language
    fetch(`/change_language/?lang=${language}`)
        .catch(error => {
            console.error('Error changing language:', error);
        });
}
