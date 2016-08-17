from django.contrib import admin
from bodybuilding.models import WorkoutSession, WeightExercise, CardioExercise, WeightTraining, Set, CardioTraining

class WeightTrainingInline(admin.TabularInline):
    model = WeightTraining

class CardioTrainingInline(admin.TabularInline):
    model = CardioTraining
    extra = 1

class SetInline(admin.TabularInline):
    model = Set
    extra = 4

@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    inlines = [
        WeightTrainingInline,
        CardioTrainingInline
    ]

@admin.register(WeightExercise)
class WeightExerciseAdmin(admin.ModelAdmin):
    pass

@admin.register(CardioExercise)
class CardioExerciseAdmin(admin.ModelAdmin):
    pass

@admin.register(WeightTraining)
class WeightTrainingAdmin(admin.ModelAdmin):
    inlines = [
        SetInline
    ]

@admin.register(Set)
class SetAdmin(admin.ModelAdmin):
    pass

@admin.register(CardioTraining)
class CardioTrainingAdmin(admin.ModelAdmin):
    pass
