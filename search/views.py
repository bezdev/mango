from os import truncate
from django.http import JsonResponse
from django.http import HttpResponseNotFound
from django.shortcuts import render
from bodybuilding.views import decimal_default
from recipes.models import Recipe

PUBLIC_SITES = [
    'bodybuilding',
    'recipes',
]

def search(request):
    query = request.GET.get('query', '')
    context = request.GET.get('context', '')

    if query == '':
        return HttpResponseNotFound('none')

    results = {
        'results': [],
    }

    for site in PUBLIC_SITES:
        if query.lower() in site:
            results['results'].append({'text': site, 'url': f'/{site}/'})

    if context.startswith('/recipes/'):
        for recipe in Recipe.objects.filter(name__icontains=query).values('name', 'name_slug'):
            results['results'].append({'text': recipe["name"], 'url': f'/recipes/{recipe["name_slug"]}/'})

    return JsonResponse(results)

def set_search_results(key, results):
    return