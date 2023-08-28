from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import CustomUser
from django.utils.translation import gettext as _

GENDER_CHOICES = [
    ("m", _("männlich")),
    ("f", _("weiblich")),
    ("d", _("divers")),
]


class RegisterForm(UserCreationForm):
    email = forms.EmailField(label=_("E-Mail"), required=True)
    age = forms.IntegerField(min_value=0, max_value=142, label=_("Alter"), required=False)
    gender = forms.ChoiceField(choices=GENDER_CHOICES, label=_("Geschlecht"), required=False)
    
    class Meta:
        model = CustomUser
        fields = ["username", "email", "age", "gender", "password1", "password2"]
    