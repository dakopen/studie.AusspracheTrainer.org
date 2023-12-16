import logging

logger = logging.getLogger(__name__)


phonemes = {
    "de-DE": {"": 0,},
    "en-GB": {  # https://learn.microsoft.com/de-de/azure/ai-services/speech-service/speech-ssml-phonetic-sets#en-gben-ieen-au
        "": 0,
        "iy": 1, 
        "ih": 2,
        "ey": 3,
        "eh": 4,
        "ae": 5,
        "aa": 6,
        "ao": 7,
        "uh": 8,
        "ow": 9,
        "uw": 10,
        "ah": 11,
        "ay": 12,
        "aw": 13,
        "oy": 14,
        "y": 15,
        "ax": 16,
        "er": 17,
        "w": 18,
        "j": 19,
        "p": 20,
        "b": 21,
        "t": 22,
        "d": 23,
        "k": 24,
        "g": 25,
        "m": 26,
        "n": 27,
        "ng": 28,
        "f": 29,
        "v": 30,
        "th": 31,
        "dh": 32,
        "s": 33,
        "z": 34,
        "sh": 35,
        "zh": 36,
        "h": 37,
        "ch": 38,
        "jh": 39,
        "l": 40,
        "r": 41,
    },
    "fr-FR": { # https://learn.microsoft.com/de-de/azure/ai-services/speech-service/speech-ssml-phonetic-sets#fr-frfr-cafr-ch
        "": 0,
        "ae": 1,
        "af": 2,
        "ein": 3,
        "ax": 4,
        "eh": 5,
        "eu": 6,
        "ey": 7,
        "in": 8,
        "iy": 9,
        "oe": 10,
        "oh": 11,
        "on": 12,
        "ow": 13,
        "un": 14,
        "uw": 15,
        "uy": 16,
        "b": 17,
        "d": 18,
        "f": 19,
        "g": 20,
        "gn": 21,
        "hw": 22,
        "k": 23,
        "l": 24,
        "m": 25,
        "n": 26,
        "ng": 27,
        "p": 28,
        "r": 29,
        "s": 30,
        "sh": 31,
        "t": 32,
        "v": 33,
        "w": 34,
        "j": 35,
        "z": 36,
    },
}


def get_phoneme_index(phoneme, language):
    if phoneme in phonemes[language]:
        return phonemes[language][phoneme]
    else:
        return None

def get_phoneme(phoneme_index, language):
    for phoneme, index in phonemes[language].items():
        if index == phoneme_index:
            return phoneme
    return None
