from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('application.urls')),
    path('', include('application.urls')),
    path('', lambda request: redirect('user_login')),
]
