from django.test import TestCase
from analyze.pronunciation_assessment import pronunciation_assessment_continuous_from_file

class AnalysisTest(TestCase):
    
    def test_pronunciation_assessment_continuous_from_file(self):
        result, _, _ = pronunciation_assessment_continuous_from_file(
            'static/frontend/assets/testaudio/testaudio.wav',                                                   
            'Ich habe etwas mehr Durst, als ich vor einer Stunde noch hatte.',
            'de-DE'
        )
        self.assertEqual([word["word"].lower() for  word in result['Words']], ['ich', 'habe', 'etwas', 'mehr', 'durst', 'als', 'ich', 'vor', 'einer', 'stunde', 'noch', 'hatte'])

        for score in [result['Paragraph']['accuracy_score'], result['Paragraph']['completeness_score'], result['Paragraph']['fluency_score']]:
            self.assertTrue(score >= 80 and score <= 100) # the ML model can change but the scores should be in this range
