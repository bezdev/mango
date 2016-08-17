import json
from django.core import serializers
from django.http import JsonResponse
from django.shortcuts import redirect
from django.shortcuts import render

from .models import WorkoutSession, WeightExercise, CardioExercise, WeightTraining, Set, CardioTraining

# Set.objects.filter(exercise__exercise__name__contains='Dumbbell Bench Press').order_by('exerice__workout__date', 'set')
# Set.objects.all().order_by('exercise__exercise', 'exercise__workout__date', 'set')
def bodybuilding(request):
    #workoutSessions = WorkoutSession.objects.all().order_by('date')
    #weightExercises = WeightExercise.objects.values_list('name', flat=True).distinct()
    #weightTrainings = WeightTraining.objects.all().order_by('exercise', 'workout__date')
    #sets = Set.objects.all().order_by('training__exercise', 'training__workout__date', 'set')

    #jsonWorkoutSessions = serializers.serialize("json", workoutSessions)
    #jsonWeightTrainings = serializers.serialize("json", weightTrainings)
    #jsonSets = serializers.serialize("json", sets)

    workoutSessions = WorkoutSession.objects.values_list('date', flat=True).order_by('date').distinct()
    workoutSessionsList = []
    for workoutSession in workoutSessions:
        workoutSessionsList.append({'date' : str(workoutSession)})
    workoutSessionsList
    jsonWorkoutSessions = json.dumps(workoutSessionsList)
    print jsonWorkoutSessions
    #weightExercises = WeightExercise.objects.values_list('name', flat=True).distinct()
    sets = Set.objects.all().order_by('training__workout__date', 'training__exercise', 'set').select_related()
    setsList = []
    for set in sets:
        setsList.append({'date' : str(set.training.workout.date), 'name' : set.training.exercise.name, 'set' : set.set, 'weight' : set.weight, 'reps' : set.reps})
    jsonSets = json.dumps(setsList)

    #cardioExercises = CardioExercise.objects.values_list('name', flat=True).distinct()
    cardioTrainings = CardioTraining.objects.all().order_by('workout__date', 'exercise').select_related()
    cardioTrainingsList = []
    for cardioTraining in cardioTrainings:
        cardioTrainingsList.append({'date' : str(cardioTraining.workout.date), 'name' : cardioTraining.exercise.name, 'time' : str(cardioTraining.time), 'distance' : cardioTraining.distance})
    jsonCardioTrainings = json.dumps(cardioTrainingsList)

    return render(request, 'bodybuilding/bodybuilding.html', { "workouts" : jsonWorkoutSessions, "sets" : jsonSets, "cardio" : jsonCardioTrainings })

def exercise(request, exercise):
    try:
        if request.method == "POST":
            if exercise == "Overall":
                return JsonResponse(serializers.serialize("json", WeightTraining.objects.all().order_by('date', 'set')), safe=False)
            else:
                return JsonResponse(serializers.serialize("json", WeightTraining.objects.filter(exercise = exercise).order_by('date', 'set')), safe=False)
        else:
            return render(request, 'bodybuilding/bodybuilding.html', { "exercises" : exercises, "exercise" : exercise })
    except KeyError:
        return HttpResponseNotFound('<h1>Page not found</h1>')