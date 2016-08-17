# execfile('bodybuilding/tests/addDummyBodybuildingData.py')

import datetime
from django.utils import timezone
from bodybuilding.models import WorkoutSession, WeightExercise, CardioExercise, WeightTraining, Set, CardioTraining

def AddWeightTraining(workoutDate, exerciseName, setsData):
    workoutSession = WorkoutSession.objects.filter(date=workoutDate).distinct()
    if not workoutSession.exists():
        workoutSession = WorkoutSession(date=workoutDate)
        workoutSession.save()
    else:
        workoutSession = workoutSession[0]

    weightExercise = WeightExercise.objects.filter(name=exerciseName)
    if not weightExercise.exists():
        weightExercise = WeightExercise(name=exerciseName)
        weightExercise.save()
    else:
        weightExercise = weightExercise[0]

    weightTraining = WeightTraining(workout=workoutSession, exercise=weightExercise)
    weightTraining.save()

    setNum = 1
    for setData in setsData:
        set = Set(training=weightTraining, set=setNum, weight=setData[0], reps=setData[1])
        set.save()
        setNum += 1

def AddCardioTraining(workoutDate, exerciseName, time, distance):
    workoutSession = WorkoutSession.objects.filter(date=workoutDate).distinct()
    if not workoutSession.exists():
        workoutSession = WorkoutSession(date=workoutDate)
        workoutSession.save()
    else:
        workoutSession = workoutSession[0]

    cardioExercise = CardioExercise.objects.filter(name=exerciseName)
    if not cardioExercise.exists():
        cardioExercise = CardioExercise(name=exerciseName)
        cardioExercise.save()
    else:
        cardioExercise = cardioExercise[0]

    cardioTraining = CardioTraining(workout=workoutSession, exercise=cardioExercise, time=time, distance=distance)
    cardioTraining.save()

AddWeightTraining(timezone.now(),                              'Dumbbell Bench Press', [(50, 12),(55,10),(60,8),(65,5),(40,5)])
AddWeightTraining(timezone.now() ,                             'Low Row',              [(100, 12),(110,10),(120,8),(100,5)])
AddWeightTraining(timezone.now() + datetime.timedelta(days=2), 'Dumbbell Bench Press', [(55, 12),(60,10),(65,7),(70,3),(45,5)])
AddWeightTraining(timezone.now() + datetime.timedelta(days=2), 'Low Row',              [(110, 12),(120,10),(130,5),(110,5)])
AddWeightTraining(timezone.now() + datetime.timedelta(days=4), 'Dumbbell Bench Press', [(55, 12),(60,10),(65,8),(70,5),(45,5)])
AddWeightTraining(timezone.now() + datetime.timedelta(days=4), 'Low Row',              [(110, 12),(120,10),(130,7),(110,5)])
AddWeightTraining(timezone.now() + datetime.timedelta(days=6), 'Dumbbell Bench Press', [(60, 12),(65,10),(70,5),(75,1),(50,5)])
AddWeightTraining(timezone.now() + datetime.timedelta(days=8), 'Dumbbell Bench Press', [(60, 12),(65,10),(70,6),(75,3),(50,5)])
AddWeightTraining(timezone.now() + datetime.timedelta(days=8), 'Low Row',              [(120, 12),(130,10),(140,7),(120,5)])

AddCardioTraining(timezone.now() ,                             'Run', datetime.timedelta(minutes=10), 2.54)
AddCardioTraining(timezone.now() + datetime.timedelta(days=1), 'Run', datetime.timedelta(minutes=10), 2.6)
AddCardioTraining(timezone.now() + datetime.timedelta(days=2), 'Run', datetime.timedelta(minutes=10), 2.2)
AddCardioTraining(timezone.now() + datetime.timedelta(days=3), 'Run', datetime.timedelta(minutes=10), 2.7)
AddCardioTraining(timezone.now() + datetime.timedelta(days=4), 'Run', datetime.timedelta(minutes=10), 2.5)
AddCardioTraining(timezone.now() + datetime.timedelta(days=5), 'Run', datetime.timedelta(minutes=10), 2.9)
AddCardioTraining(timezone.now() + datetime.timedelta(days=6), 'Run', datetime.timedelta(minutes=10), 3.0)
AddCardioTraining(timezone.now() + datetime.timedelta(days=7), 'Run', datetime.timedelta(minutes=10), 3.4)
