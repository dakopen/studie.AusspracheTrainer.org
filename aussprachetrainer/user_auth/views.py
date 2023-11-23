from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth import login
from django.shortcuts import render, redirect
from .forms import RegisterForm
from frontend.views import render_into_base
from django.utils.translation import gettext as _
from django.http import JsonResponse
from django.contrib.auth.models import User

class UserLoginView(LoginView):
    template_name = 'user_auth/login.html'
    next_page = 'dashboard'

class UserLogoutView(LogoutView):
    next_page = '/'

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = RegisterForm()

    return render_into_base(request, _('Registrieren'), 'user_auth/register.html', {'form': form})



def check_username(request):
    username = request.GET.get('username', None)
    data = {
        'is_taken': User.objects.filter(username__iexact=username).exists()
    }
    return JsonResponse(data)
