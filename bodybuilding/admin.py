from django.contrib import admin
from bodybuilding.models import Weightlifting

class WeightliftingAdmin(admin.ModelAdmin):
    date_hierarchy = 'date'

admin.site.register(Weightlifting, WeightliftingAdmin)
