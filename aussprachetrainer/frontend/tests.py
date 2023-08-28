from django.test import TestCase
from django.urls import reverse
from django.utils import translation
from django.core.management import call_command
import os.path
from analyze.pronunciation_assessment import pronunciation_assessment_continuous_from_file

class FrontendTests(TestCase):
    
    def test_index_view(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'AusspracheTrainer')

    def test_images(self):
        self.assertTrue(os.path.exists('static/frontend/assets/images/favicon.png'))
        self.assertTrue(os.path.exists('static/frontend/assets/images/AT-default.svg'))

class MultiLanguageTestCase(TestCase):        

    def test_english(self):
        mo_already_existed = os.path.exists('frontend/locale/en/LC_MESSAGES/django.mo')
        if not mo_already_existed:
            call_command('compilemessages')        
        
        translation.activate('en')
        self.assertEqual(translation.gettext('Willkommen'), 'Welcome')

        if not mo_already_existed:
            os.remove('frontend/locale/en/LC_MESSAGES/django.mo')

class AnalysisTest(TestCase):
    
    def test_pronunciation_assessment_continuous_from_file(self):
        result = pronunciation_assessment_continuous_from_file(
            'static/frontend/assets/testaudio/ich-habe-etwas-mehr-durst-als-ich-vor-einer-stunde-noch-hatte.wav',                                                   
            'Ich habe etwas mehr Durst, als ich vor einer Stunde noch hatte.',
            'de-DE'
        )
        self.assertEqual([word["word"] for  word in result['Words']], ['Ich', 'habe', 'etwas', 'mehr', 'Durst', 'als', 'ich', 'vor', 'einer', 'Stunde', 'noch', 'hatte'])

        for score in [result['Paragraph']['accuracy_score'], result['Paragraph']['completeness_score'], result['Paragraph']['fluency_score']]:
            self.assertTrue(score >= 80 and score <= 100) # the ML model can change but the scores should be in this range
