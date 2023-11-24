from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from django.core.exceptions import ValidationError

User = get_user_model()

class RegisterForm(UserCreationForm):
    email = forms.EmailField(label=_("E-Mail"), required=True)    
    class Meta:
        model = User
        fields = ["username", "email", "password1", "password2"]
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError(_("Ein Benutzer mit dieser E-Mail-Adresse existiert bereits."))
        return email
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username__iexact=username).exists():
            raise ValidationError(_("Ein Benutzer mit diesem Benutzernamen existiert bereits."))
        return username.lower()


class CustomAuthForm(AuthenticationForm):
    username = forms.CharField(
        label=_("Benutzername oder E-Mail"),
        widget=forms.TextInput(attrs={'autofocus': True})
    )
