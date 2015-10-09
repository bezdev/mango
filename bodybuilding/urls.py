from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.bodybuilding, name = 'bodybuilding'),
    url(r'^(?P<exercise>[a-zA-Z]+)/$', views.exercise, name = 'bodybuilding'),
]