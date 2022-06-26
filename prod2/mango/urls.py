from django.urls import include, path
from django.contrib import admin
from bodybuilding import views

urlpatterns = [
    path('', include(('index.urls', 'index'), namespace='index')),
    path('life/', include(('life.urls', 'life'), namespace='life')),
    path('bodybuilding/', include(('bodybuilding.urls', 'bodybuilding'), namespace='bodybuilding')),
    path('api/v1/bodybuilding', views.api_v1_bodybuilding),
]
