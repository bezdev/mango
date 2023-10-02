from django.shortcuts import render
from .models import Clip

def clip(request, code):
    return render(request, 'clips/clip.html', {'clip': Clip.objects.get(code=code)})
