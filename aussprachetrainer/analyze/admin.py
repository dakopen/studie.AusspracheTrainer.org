from django.contrib import admin
from .models import PhonemeAssessmentResult, PronunciationAssessmentResult

@admin.register(PhonemeAssessmentResult)
class PhonemeAssessmentResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'phoneme_id', 'score', 'language', 'how_many_times', 'created_at')
    search_fields = ('user', 'phoneme_id', 'language', 'how_many_times', 'created_at')

@admin.register(PronunciationAssessmentResult)
class PronunciationAssessmentResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'accuracy', 'completeness', 'fluency', 'sentence', 'recognized_sentence', 'language', 'created_at')
    search_fields = ('user', 'sentence', 'language', 'created_at')

