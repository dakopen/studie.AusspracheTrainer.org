from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()

class UserAuthTest(TestCase):
    
    def setUp(self):
        self.language_code = 'de'  # Replace with the language code you're testing
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        self.dashboard_url = reverse('dashboard')

    def test_login_successful(self):
        response = self.client.post(self.login_url, {'username': 'testuser', 'password': 'testpass'})
        self.assertEqual(response.status_code, 302)  # Should redirect
        self.assertRedirects(response, self.dashboard_url)  # Redirect to dashboard

    def test_login_unsuccessful(self):
        response = self.client.post(self.login_url, {'username': 'testuser', 'password': 'wrongpass'})
        self.assertEqual(response.status_code, 200)  # Stays on the same page
        self.assertContains(response, 'Wrong username or password.')

    def test_logout(self):
        self.client.login(username='testuser', password='testpass')
        response = self.client.get(self.logout_url)
        self.assertEqual(response.status_code, 302)  # Should redirect
        self.assertEqual(response.url, '/')


    def test_authenticated_user_dashboard_access(self):
        self.client.login(username='testuser', password='testpass')
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 200)  # Should have access
    
    def test_unauthenticated_user_dashboard_access(self):
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 302)  # Should redirect
        expected_redirect_url = f"{self.login_url}?next={self.dashboard_url}"
        self.assertTrue(response.url in expected_redirect_url) # expected_redirect_url starts with localization
