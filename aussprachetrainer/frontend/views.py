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
from pydub import AudioSegment
import base64
import io


def render_into_base(request, title, filepaths, context=None, content_type=None, status=None, using=None, css=None):
    """
    Render a template into the base template.
    """
    if not isinstance(filepaths, list):
        filepaths = [filepaths]

    if context is None:
        context = {}
    
    context["title"] = title
    context["filepaths"] = filepaths

    if css:
        if not isinstance(css, list):
            css = [css]
    context["css"] = css

    return render(request, 'extend_base.html', context, content_type, status, using)


def index(request):

    return render_into_base(request, _("AusspracheTrainer"), ["importhtml.html", "upload_audio.html", "record_audio.html"],
                            css=['frontend/assets/css/record_audio.css'])


def contact(request):

    return render_into_base(request, _("Kontakt"), "contact.html")


def legal_notice(request):

    return render_into_base(request, _("Impressum"), "legal_notice.html")


def privacy_policy(request):

    return render_into_base(request, _("Datenschutzerklärung"), "privacy_policy.html")

def waiting_page(request, task_id):
    return render_into_base(request, _("Warte auf Ergebnis"), "waiting_page.html", {"task_id": task_id})

def initiate_analysis(request):
    audio_data_url = request.POST.get('audio_data')
    text = request.POST.get('text_data')

    audio_data_base64 = audio_data_url.split(',')[1]
    audio_data = base64.b64decode(audio_data_base64)
    random_name = str(uuid.uuid4()) + ".mp3"

    buffer = io.BytesIO()

    audio_segment = AudioSegment.from_ogg(io.BytesIO(audio_data))

    audio_segment.export(buffer, format="mp3")

    buffer.seek(0)

    content_file = ContentFile(buffer.read(), name=random_name)

    
    # Save audio file to disk
    file_name = 'audio_files/' + random_name  
    default_storage.save(file_name, content_file)
    
    user_id = request.user.id if request.user.is_authenticated else None

    task = async_pronunciation_assessment.delay(file_name, text, "de-DE", user_id=user_id) # TODO: replace language with given language from user input
    return JsonResponse({'task_id': task.id})
ICH WEIß NICHT WAS FALSCH IST ABER ES KOMMT IMMER EIN FAILURE
DAFÜR KLAPPT DER REST, ALSO DIE AUDIO WIRD AUFGENOMMEN UND ANGEZEIGT UND SO

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
