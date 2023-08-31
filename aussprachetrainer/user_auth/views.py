from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth import login
from django.shortcuts import render, redirect
from .forms import RegisterForm
from frontend.views import render_into_base
from django.utils.translation import gettext as _


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
