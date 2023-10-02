from django.urls import path
from . import views

urlpatterns = [
    path('<str:code>/', views.clip, name="clips clip"),
]
