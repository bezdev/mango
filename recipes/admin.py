from django.contrib import admin
from recipes.models import Recipe
from django.template.defaultfilters import slugify

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    fields = ('create_date', 'name', 'ingredient_text', 'direction_text')

    def save_model(self, request, obj, form, change):
        obj.name_slug = slugify(obj.name)
        obj.save()
