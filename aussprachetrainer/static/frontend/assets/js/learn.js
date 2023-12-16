/*Dropdown Menu*/
let selectedLiId = $('.dropdown-select span img').attr('value')
$('#' + selectedLiId).hide();

$('.dropdown').click(function () {
    $(this).attr('tabindex', 1).focus();
    $(this).toggleClass('active');
    $(this).find('.dropdown-menu').slideToggle(300);

    // Do not show the already selected flag
    setTimeout(() => {
        $('#' + selectedLiId).hide();
    }, 300);
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
    }, 300);
    
    // set the id to the new selected flag
    selectedLiId = $(this).attr('id');
    $('#hiddenSelectedLanguage').val(selectedLiId);

    var selectedText = $(this).clone().children().remove().end().text(); // Entfernt die Flagge und holt nur den Text
    var selectedFlag = $(this).find('.dropdown-flag').clone(); // Klont das Flaggenbild
    selectedFlag.height(20).width(30);

    $(this).parents('.dropdown').find('.dropdown-select > span').text(selectedText).append(selectedFlag); // Fügt zuerst das Bild und dann den Text hinzu

    // update the placeholder of the textarea
    var selectedLanguage = selectedLiId.split('-')[2];
    switch (selectedLanguage) {
        case "gb":
            updateLanguageParameter("en-GB");
            break;
        case "germany":
            updateLanguageParameter("de-DE");
            break;
        case "france":
            updateLanguageParameter("fr-FR");
            break;
    }
});

function updateLanguageParameter(newLang) {
    var currentUrl = new URL(window.location.href);
    var searchParams = currentUrl.searchParams;

    // Update or add the 'language' parameter
    searchParams.set('language', newLang);

    // Build the new URL with updated parameters
    currentUrl.search = searchParams.toString();

    // Redirect to the new URL
    window.location.href = currentUrl.toString();
}

/*End Dropdown Menu*/