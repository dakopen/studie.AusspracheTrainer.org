from django.shortcuts import render, redirect
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils.translation import gettext as _
from django.utils import translation
from django.template.loader import render_to_string
from analyze.tasks import async_pronunciation_assessment
from celery.result import AsyncResult
from django.http import JsonResponse, HttpResponse
from django.conf import settings

import uuid
import os

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

def waiting_page(request, task_id):
    return render_into_base(request, _("Warte auf Ergebnis"), "waiting_page.html", {"task_id": task_id})

def initiate_analysis(request):
    # Extract the form data here
    text = request.POST["text"]
    audio_file = request.FILES["audio_file"]

    # Generate a random name while preserving the original extension
    original_name, extension = os.path.splitext(audio_file.name)
    random_name = str(uuid.uuid4()) + extension
    
    # Save audio file to disk
    file_name = 'audio_files/' + random_name  # Make sure the folder exists
    default_storage.save(file_name, ContentFile(audio_file.read()))
    
    user_id = request.user.id if request.user.is_authenticated else None

    task = async_pronunciation_assessment.delay(file_name, text, "de-DE", user_id=user_id) # TODO: replace language with given language from user input
    return redirect('waiting_page', task_id=task.id)


def check_status(request, task_id):
    task = AsyncResult(task_id)
    response_data = {'status': task.status, 'result': task.result if task.successful() else None}
    return JsonResponse(response_data)


def analysis_error(request):

    template_content = render_to_string("result_error.html")
    return JsonResponse(template_content, safe=False)


def change_language(request):
    if not request.GET.get("lang"):
        return HttpResponse("Current language: " + translation.get_language())
    
    # strip /xx/ to xx
    lang = request.GET.get("lang").replace("/", "").replace("\\", "")
    assert lang in [code for code, name in settings.LANGUAGES]
    translation.activate(lang)
    response = HttpResponse(lang)
    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang)
    return response
