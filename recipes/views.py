"""
Recipes
"""
from django.http import JsonResponse
from django.shortcuts import render

from . import RecipeParser
from .models import Recipe

def recipes(request):
    return render(request, 'recipes/recipes.html', { "recipes" : Recipe.objects.values_list('name', flat=True) })

def recipe(request, name_slug):
    recipe = Recipe.objects.filter(name_slug=name_slug).first()
    
    data = {}
    data["name"] = recipe.name
    data["ingredients"] = recipe.decompose()
    data["directions"] = recipe.direction_text.replace("\r\n", "\n").split("\n")

    return render(request, 'recipes/recipe.html', { "recipe" : data })

def parse(request):
    searchTerm = request.GET.get('s', '')

    parseRecipeResult = RecipeParser.parse(searchTerm)
    return JsonResponse(parseRecipeResult)
