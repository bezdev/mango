from django.urls import path
from . import views

urlpatterns = [
    path('', views.recipes, name = 'recipes'),
    path('<slug:name_slug>/', views.recipe, name = 'recipes recipe'),
    path('parse', views.parse, name = 'recipes parse'),
]