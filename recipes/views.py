from django.http import JsonResponse
from django.shortcuts import render

from . import parseRecipe
from .models import Recipe

def recipes(request):
    recipes = Recipe.objects.values_list('name', flat=True)
    return render(request, 'recipes/recipes.html', { "recipes" : recipes })

def parse(request):
    searchTerm = request.GET.get('s', '')

    parseRecipeResult = parseRecipe.parse(searchTerm)
    return JsonResponse(parseRecipeResult)

    # if not validators.url(searchTerm):
    #     return JsonResponse({ "error": "invalid url" })

    # content = requests.get(searchTerm).content
    # tree = html.fromstring(content)

    # for table in tree.iter('table'):

    # return JsonResponse({ "ok": str(content) })