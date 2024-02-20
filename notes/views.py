"""
Notes
"""
from django.http import JsonResponse
from django.shortcuts import render

from .models import Note

def notes(request):
    notes = Note.get_notes(request.user)
    return render(request, 'notes/notes.html', {"notes": notes})

def note(request, name_slug):
    notes = Note.get_notes(request.user)
    note = notes.filter(name_slug=name_slug).first()

    if not note:
        return redirect('notes')

    return render(request, 'notes/note.html', {"note": note})
