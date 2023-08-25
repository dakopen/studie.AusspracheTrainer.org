from django.shortcuts import render, redirect
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils.translation import gettext as _
from analyze.tasks import analyze_task
import uuid
import os
from celery.result import AsyncResult
from django.http import JsonResponse

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

    task = analyze_task.delay(text, file_name)
    return redirect('waiting_page', task_id=task.id)


def check_status(request, task_id):
    task = AsyncResult(task_id)
    response_data = {'status': task.status, 'result': task.result if task.successful() else None}
    return JsonResponse(response_data)


"""SPÄTER IM JAVASCRIPT DANN:

function checkStatus(taskId) {
    fetch(`/check_status/${taskId}/`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'SUCCESS') {
                // Handle the result here
                displayResult(data.result);
            } else if (data.status !== 'FAILURE') {
                // If the task is still pending or running, check again in a few seconds
                setTimeout(() => checkStatus(taskId), 3000);
            } else {
                // Handle failure here
                displayError();
            }
        });
}

// Start checking the status
checkStatus(taskId);
"""