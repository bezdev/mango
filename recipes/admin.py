from django.contrib import admin
from recipes.models import Recipe
from django.template.defaultfilters import slugify

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    fields = ('createdate', 'name', 'ingredientsText', 'directionsText')

    def save_model(self, request, obj, form, change):
        obj.nameSlug = slugify(obj.name)
        obj.save()