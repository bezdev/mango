"""
Recipes
"""
from django.http import JsonResponse
from django.shortcuts import render

from . import parseRecipe
from .models import Recipe

def recipes(request):
    return render(request, 'recipes/recipes.html', { "recipes" : Recipe.objects.values_list('name', flat=True) })

def recipe(request, name_slug):
    return render(request, 'recipes/recipe.html', { "recipe" : Recipe.objects.filter(name_slug=name_slug).first() })

def parse(request):
    searchTerm = request.GET.get('s', '')

    parseRecipeResult = parseRecipe.parse(searchTerm)
    return JsonResponse(RecipeResult)

    # if not validators.url(searchTerm):
    #     return JsonResponse({ "error": "invalid url" })

    # content = requests.get(searchTerm).content
    # tree = html.fromstring(content)

    # for table in tree.iter('table'):

    # return JsonResponse({ "ok": str(content) })