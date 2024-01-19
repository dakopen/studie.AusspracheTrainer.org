from django.contrib import admin
from .models import PhonemeAssessmentResult, PronunciationAssessmentResult, SynthesizedAudioFile

@admin.register(PhonemeAssessmentResult)
class PhonemeAssessmentResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'phoneme_id', 'score', 'language', 'how_many_times', 'created_at')
    search_fields = ('user', 'phoneme_id', 'language', 'how_many_times', 'created_at')

@admin.register(PronunciationAssessmentResult)
class PronunciationAssessmentResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'accuracy', 'completeness', 'fluency', 'sentence', 'recognized_sentence', 'language', 'created_at')
    search_fields = ('user', 'sentence', 'language', 'created_at')

@admin.register(SynthesizedAudioFile)
class SynthesizedAudioFileAdmin(admin.ModelAdmin):
    list_display = ('text', 'language', 'filename', 'created_at')
    search_fields = ('text', 'language', 'filename', 'created_at')