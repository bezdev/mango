import datetime
from django.utils import timezone
from bodybuilding.models import WorkoutSession, WeightExercise, CardioExercise, WeightTraining, Set, CardioTraining

sets = Set.objects.all().order_by('training__workout__date', 'training__exercise', 'set').select_related()

list = []

for set in sets:
    list.append({'date' : str(set.training.workout.date), 'name' : set.training.exercise.name, 'set' : set.set, 'weight' : set.weight, 'reps' : set.reps})