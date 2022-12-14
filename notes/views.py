"""
Notes
"""
from django.http import JsonResponse
from django.shortcuts import render

from .models import Note

def notes(request):
    return render(request, 'notes/notes.html', { "notes" : Note.objects.all() })

def note(request, name_slug):
    return render(request, 'notes/note.html', { "note" : Note.objects.filter(name_slug=name_slug).first() })
