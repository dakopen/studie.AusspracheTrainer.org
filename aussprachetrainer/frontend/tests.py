from django.test import TestCase
from django.urls import reverse
from django.core.management import call_command
from django.utils import translation
from aussprachetrainer.settings import DEBUG
import os.path

class FrontendTests(TestCase):
    
    def test_index_view(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'AusspracheTrainer')

    def test_images(self):
        # this only makes sense when running on prod
        if not DEBUG:
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

