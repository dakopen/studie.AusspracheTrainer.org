country_class_to_locale_dict = {
    'dropdown-lang-germany': 'de-DE',
    'dropdown-lang-uk' : 'en-GB',
    'dropdown-lang-france': 'fr-FR',
}

def country_class_to_locale(country_class):
    global country_class_to_locale_dict

    """Converts a country class to a locale string."""
    return country_class_to_locale_dict[country_class]