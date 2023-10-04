from django.core.management.base import BaseCommand
from analyze.models import PronunciationAssessmentResult
import random
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Populates the database with random PronunciationAssessmentResult data.'

    def handle(self, *args, **kwargs):
        # Delete existing records (optional)
        PronunciationAssessmentResult.objects.all().delete()

        # Randomly populate the database
        for i in range(100):  # create 100 records
            PronunciationAssessmentResult.objects.create(
                user=random.choice(User.objects.all()),
                accuracy=random.uniform(50.0, 100.0),
                completeness=random.uniform(50.0, 100.0),
                fluency=random.uniform(50.0, 100.0),
                sentence=f'This is the {random.randint(4, 1000)}th sample sentence.',
                recognized_sentence=f'Recognize wrongword is the {random.randint(4, 1000)}th sample sentence.',
                word_assessment={
                    "index": 1,
                    "word": "sample",
                    "accuracy_score": random.uniform(50.0, 100.0),
                    "error_type": "None"
                },
                language='en-US'

            )
            self.stdout.write(self.style.SUCCESS(f'Successfully created record {i+1}'))
