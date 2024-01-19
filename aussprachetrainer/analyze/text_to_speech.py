import azure.cognitiveservices.speech as speechsdk
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from aussprachetrainer.settings import MS_SPEECH_SERVICES_API_KEY as speech_key
from aussprachetrainer.settings import MS_SPEECH_SERVICES_REGION as service_region
import uuid
import datetime
from django.conf import settings
import os
from .models import SynthesizedAudioFile
from django.utils import timezone

speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
def synthesize_speech(text, language):

    existing_file = SynthesizedAudioFile.objects.filter(text=text, language=language).first()
    if existing_file:
        # Update the 'created_at' field to the current time
        existing_file.created_at = timezone.now()
        existing_file.save()
        return os.path.join(settings.MEDIA_ROOT, "synthesized_audio_files/" + existing_file.filename)


    if language == "de-DE":
        speech_config.speech_synthesis_voice_name = "de-DE-ChristophNeural"
    elif language == "en-GB":
        speech_config.speech_synthesis_voice_name = "en-GB-RyanNeural"
    elif language == "fr-FR":
        speech_config.speech_synthesis_voice_name = "fr-FR-DeniseNeural"
    
    speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)
    # Synthesizing the given text
    result = speech_synthesizer.speak_text_async(text).get()
    deletion_time = (datetime.datetime.now() + datetime.timedelta(hours=1)).strftime("%Y%m%d-%H%M%S")
    filename = deletion_time + "-" + str(uuid.uuid4()) + ".wav"

    # Check if the synthesis was successful
    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        path = default_storage.save(os.path.join(settings.MEDIA_ROOT, "synthesized_audio_files/" + filename), ContentFile(result.audio_data))
        
        # store created file in database
        SynthesizedAudioFile.objects.create(
            language=language,
            text=text,
            filename=filename
        )
        
        return path
    
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = result.cancellation_details
        print(f"Speech synthesis canceled: {cancellation_details.reason}")
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print(f"Error details: {cancellation_details.error_details}")
    
        return None