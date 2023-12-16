from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth import login, get_user_model
from django.shortcuts import redirect
from .forms import RegisterForm, CustomAuthForm
from frontend.views import render_into_base
from django.utils.translation import gettext as _
from django.http import JsonResponse

User = get_user_model()

class UserLoginView(LoginView):
    form_class = CustomAuthForm
    template_name = 'user_auth/login.html'
    next_page = 'dashboard'

class UserLogoutView(LogoutView):
    next_page = '/'

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user, backend='user_auth.backends.EmailOrUsernameModelBackend')
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
