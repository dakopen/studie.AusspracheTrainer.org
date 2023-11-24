from django.db import models
from django.conf import settings

class PronunciationAssessmentResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)
    accuracy = models.FloatField()
    completeness = models.FloatField()
    fluency = models.FloatField()
    sentence = models.TextField()
    recognized_sentence = models.TextField()
    word_assessment = models.JSONField()
    language = models.CharField(max_length=5)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} -  {self.sentence} - {self.created_at} - {self.language}"
