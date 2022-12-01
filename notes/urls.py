from django.urls import path
from . import views

urlpatterns = [
    path('', views.notes, name = 'notes'),
    path('<slug:name_slug>/', views.note, name = ' notes note'),
]