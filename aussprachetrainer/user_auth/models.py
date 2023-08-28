from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext as _


class CustomUser(AbstractUser):
    age = models.IntegerField(null=True, blank=True)

    GENDER_CHOICES = [
        ("m", _("männlich")),
        ("f", _("weiblich")),
        ("d", _("divers")),
    ]

    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
