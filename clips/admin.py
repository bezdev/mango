from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from clips.models import Clip, Tag, ClipTag

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ['name']

class ClipTagInline(admin.TabularInline):
    model = ClipTag
    extra = 1

@admin.register(Clip)
class ClipAdmin(admin.ModelAdmin):
    readonly_fields = ('clip_link',)
    fields = ('create_date', 'name', 'file', 'clip_link')

    inlines = [
        ClipTagInline,
    ]

    def clip_link(self, obj):
        if not obj.code:
            return None
        url = reverse('clips:clips clip', args=[obj.code])
        return format_html('<a href="{}">{}</a>', url, obj.code)

    clip_link.short_description = 'link'
