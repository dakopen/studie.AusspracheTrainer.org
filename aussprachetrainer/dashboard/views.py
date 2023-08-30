from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def dashboard_view(request):
    return render(request, 'dashboard.html')

# TODO: add user profile settings and move logout there (from the header)