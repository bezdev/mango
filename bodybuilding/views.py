from django.core import serializers
from django.http import JsonResponse
from django.shortcuts import redirect
from django.shortcuts import render

from .models import Weightlifting

exercises = Weightlifting.objects.values_list('exercise', flat=True).distinct()

def bodybuilding(request):
    return render(request, 'bodybuilding/bodybuilding.html', { "exercises" : exercises })

def exercise(request, exercise):
    try:
        if request.method == "POST":
            if exercise == "Overall":
                return JsonResponse(serializers.serialize("json", Weightlifting.objects.all().order_by('date', 'set')), safe=False)
            else:
                return JsonResponse(serializers.serialize("json", Weightlifting.objects.filter(exercise = exercise).order_by('date', 'set')), safe=False)
        else:
            return render(request, 'bodybuilding/bodybuilding.html', { "exercises" : exercises, "exercise" : exercise })
    except KeyError:
        return HttpResponseNotFound('<h1>Page not found</h1>')