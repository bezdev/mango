from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from django.contrib import admin
from bodybuilding import views
from search.views import search

urlpatterns = [
    path('', include(('index.urls', 'index'), namespace='index')),
    path('admin/', admin.site.urls),
    path('bodybuilding/', include(('bodybuilding.urls', 'bodybuilding'), namespace='bodybuilding')),
    path('life/', include(('life.urls', 'life'), namespace='life')),
    path('notes/', include(('notes.urls', 'note'), namespace='notes')),
    path('recipes/', include(('recipes.urls', 'recipes'), namespace='recipes')),
    path('search', search, name = 'search'),
    path('api/v1/bodybuilding', views.api_v1_bodybuilding),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
