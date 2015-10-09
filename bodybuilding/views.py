from django.core import serializers
from django.http import JsonResponse
from django.shortcuts import redirect
from django.shortcuts import render

from .models import DumbbellBenchPress

queries = { 'DumbbellBenchPress' : DumbbellBenchPress.objects.order_by('date', 'set') }

def bodybuilding(request):
    return render(request, 'bodybuilding/bodybuilding.html')

def exercise(request, exercise):
    try:
        if request.method == "POST":
            return JsonResponse(serializers.serialize("json", queries[exercise]), safe=False)
        else:
            return render(request, 'bodybuilding/bodybuilding.html', { "exercise" : exercise })
    except KeyError:
        return HttpResponseNotFound('<h1>Page not found</h1>')