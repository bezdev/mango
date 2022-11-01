from os import truncate
from django.http import JsonResponse
from django.http import HttpResponseNotFound
from django.shortcuts import render
from bodybuilding.views import decimal_default

PUBLIC_SITES = [
    'bodybuilding',
    'recipes',
]

def search(request):
    query = request.GET.get('q', '')
    context = request.GET.get('context', '')

    if query == '':
        return HttpResponseNotFound('none')

    results = {
        'sites': [],
        'actions': []
    }

    for site in PUBLIC_SITES:
        if query.lower() in site:
            results['sites'].append(f'/{site}/')

    return JsonResponse(results)

def set_search_results(key, results):
    return