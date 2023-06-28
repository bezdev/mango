from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from django.contrib import admin
from index import views as index_views
from bodybuilding import views as bodybuilding_views
from search import views as search_views

urlpatterns = [
    path('', include(('index.urls', 'index'), namespace='index')),
    path('admin/', admin.site.urls),
    path('bodybuilding/', include(('bodybuilding.urls', 'bodybuilding'), namespace='bodybuilding')),
    path('life/', include(('life.urls', 'life'), namespace='life')),
    path('notes/', include(('notes.urls', 'note'), namespace='notes')),
    path('recipes/', include(('recipes.urls', 'recipes'), namespace='recipes')),
    path('search', search_views.search, name = 'search'),
    path('api/v1/login', index_views.user_login),
    path('api/v1/bodybuilding', bodybuilding_views.api_v1_bodybuilding),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
