from django.urls import include, path
from django.contrib import admin
from bodybuilding import views
from search.views import search

urlpatterns = [
    path('', include(('index.urls', 'index'), namespace='index')),
    path('admin/', admin.site.urls),
    path('life/', include(('life.urls', 'life'), namespace='life')),
    path('bodybuilding/', include(('bodybuilding.urls', 'bodybuilding'), namespace='bodybuilding')),
    path('recipes/', include(('recipes.urls', 'recipes'), namespace='recipes')),
    path('search', search, name = 'search'),
    path('api/v1/bodybuilding', views.api_v1_bodybuilding),
]
