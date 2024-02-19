from django import forms
from django.contrib import admin
from django.core.files.base import ContentFile
from django.db import models
from django.forms import Textarea
from django.template.defaultfilters import slugify
from notes.models import Note, Tag, File
from django.core.files.storage import default_storage

class TagInline(admin.TabularInline):
    model = Tag

class ImageInline(admin.StackedInline):
    model = File
    extra = 0

class NoteAdminForm(forms.ModelForm):
    text_area = forms.CharField(widget=forms.Textarea(attrs={'rows': 25, 'cols': 80}), required=False)

    class Meta:
        model = Note
        fields = ['create_date', 'name', 'text_file']

    def __init__(self, *args, **kwargs):
        super(NoteAdminForm, self).__init__(*args, **kwargs)
        if self.instance and self.instance.text_file:
            try:
                self.instance.text_file.open('r')
                self.fields['text_area'].initial = self.instance.text_file.read()
                self.instance.text_file.close()
            except Exception as e:
                self.fields['text_area'].initial = f"Error reading file: {e}"
        # TODO: remove
        elif self.instance and self.instance.text:
                self.fields['text_area'].initial = self.instance.text

    def save(self, commit=True):
        instance = super(NoteAdminForm, self).save(commit=False)
        text_data = self.cleaned_data.get('text_area')

        if text_data:
            filename = f"{instance.name_slug}.md"

            if instance.text_file and default_storage.exists(instance.text_file.name):
                default_storage.delete(instance.text_file.name)

            instance.text_file.save(filename, ContentFile(text_data), save=False)

        if commit:
            instance.save()
        return instance


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    form = NoteAdminForm
    fields = ('create_date', 'name', 'text_area')
    change_form_template = "notes/note_change_list.html"
    inlines = [
        TagInline,
        ImageInline
    ]
