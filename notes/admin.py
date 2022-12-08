from django.contrib import admin
from django.db import models
from django.forms import Textarea
from notes.models import Note, Tag
from django.template.defaultfilters import slugify

class TagInline(admin.TabularInline):
    model = Tag

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    change_form_template = "notes/note_change_list.html"

    fields = ('create_date', 'name', 'text')

    inlines = [
        TagInline,
    ]

    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows':25, 'cols':80})},
    }

    def save_model(self, request, obj, form, change):
        obj.name_slug = slugify(obj.name)
        obj.save()
