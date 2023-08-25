from django.shortcuts import render
from django.utils.translation import gettext as _

def render_into_base(request, title, filepaths, context=None, content_type=None, status=None, using=None):
    """
    Render a template into the base template.
    """
    if not isinstance(filepaths, list):
        filepaths = [filepaths]

    if context is None:
        context = {}
    
    context["title"] = title
    context["filepaths"] = filepaths

    return render(request, 'extend_base.html', context, content_type, status, using)


def index(request):

    return render_into_base(request, _("AusspracheTrainer"), ["importhtml.html", "upload_audio.html"])


def contact(request):

    return render_into_base(request, _("Kontakt"), "contact.html")


def legal_notice(request):

    return render_into_base(request, _("Impressum"), "legal_notice.html")


def privacy_policy(request):

    return render_into_base(request, _("Datenschutzerklärung"), "privacy_policy.html")