from django.db import models
from django.conf import settings

class PronunciationAssessmentResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)
    accuracy = models.FloatField()
    completeness = models.FloatField()
    fluency = models.FloatField()
    sentence = models.TextField()
    recognized_sentence = models.TextField()
    language = models.CharField(max_length=5)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} -  {self.sentence} - {self.created_at} - {self.language}"

class PhonemeAssessmentResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=False, blank=True, on_delete=models.CASCADE)
    phoneme_id = models.PositiveSmallIntegerField()
    language = models.CharField(max_length=5)
    score = models.FloatField()
    how_many_times = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} -  {self.phoneme_id} - {self.created_at} - {self.language}"