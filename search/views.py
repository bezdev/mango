from django.db.models import Q
from django.http import JsonResponse
from django.http import HttpResponseNotFound
from recipes.models import Recipe
from notes.models import Note

PUBLIC_SITES = [
    'bodybuilding',
    'recipes',
    'notes',
]

def search(request):
    query = request.GET.get('query', '')
    context = request.GET.get('context', '')

    if query == '':
        return HttpResponseNotFound('none')

    results = {
        'results': [],
    }

    # TODO: move these to the components
    if context.startswith('/recipes/'):
        for recipe in Recipe.objects.filter(name__icontains=query).values('name', 'name_slug'):
            results['results'].append({'text': recipe["name"], 'url': f'/recipes/{recipe["name_slug"]}/'})

    if context.startswith('/notes/'):
        notes = Note.get_notes(request.user)
        for note in notes.filter(name__icontains=query).values('name', 'name_slug'):
            results['results'].append({'text': note["name"], 'url': f'/notes/{note["name_slug"]}/'})

    for site in PUBLIC_SITES:
        if query.lower() in site:
            results['results'].append({'text': site, 'url': f'/{site}/'})

    return JsonResponse(results)

def set_search_results(key, results):
    return
