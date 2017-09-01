# execfile('bodybuilding/tests/addDummyBodybuildingData.py')

import datetime
import random
from django.utils import timezone
from bodybuilding.models import WorkoutSession, WeightExercise, CardioExercise, WeightTraining, Set, CardioTraining

def AddWeightTraining(workoutDate, exerciseName, setsData):
    workoutSession = WorkoutSession.objects.filter(date=workoutDate).distinct()
    if not workoutSession.exists():
        weight = 200.0 + float("{0:.1f}".format(random.random() * 10))
        startTime = random.randint(1, 2359)
        endTime = (startTime + random.randint(30,55)) % 2359
        workoutSession = WorkoutSession(date=workoutDate, weight=weight, startTime=startTime, endTime=endTime)
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

def GenerateRandomSets(weightSeed, repsSeed, numSets, burnoutSet):
    repsRange = 2
    sets = []
    for i in range(numSets):
        if i == numSets - 1 and burnoutSet:
            sets.append((weightSeed, 5 + random.randint(-1, 1)))
        else:
            sets.append((weightSeed + i * 5, int(repsSeed - (2.5 * i) + random.randint(-repsRange, repsRange))))

    return sets

def AddWorkoutSession(date, day, seed):
    if day == 1:
        AddWeightTraining(date, 'Dumbbell Bench Press', GenerateRandomSets(50 + 5 * seed, 12, 5, True))
        AddWeightTraining(date, 'Incline Dumbbell Bench Press', GenerateRandomSets(40 + 5 * seed, 10, 5, True))
        AddWeightTraining(date, 'Seated Row', GenerateRandomSets(100 + 5 * seed, 12, 4, True))
        AddWeightTraining(date, 'Dumbbell Flys', GenerateRandomSets(25 + 5 * seed, 12, 3, False))
        AddWeightTraining(date, 'Leg Press', GenerateRandomSets(100 + 5 * seed, 20, 3, False))
    elif day == 2:
        AddWeightTraining(date, 'Barbell Preacher Curl', GenerateRandomSets(55 + 5 * seed, 12, 4, True))
        AddWeightTraining(date, 'Crazy Triceps', GenerateRandomSets(55 + 5 * seed, 12, 3, False))
        AddWeightTraining(date, 'Dumbbell Curl', GenerateRandomSets(27.5 + 5 * seed, 12, 4, True))
        AddWeightTraining(date, 'Arnold Press', GenerateRandomSets(25 + 5 * seed, 12, 4, True))
        AddWeightTraining(date, 'Leg Press', GenerateRandomSets(100 + 5 * seed, 20, 3, False))

    AddCardioTraining(date, 'Run', datetime.timedelta(minutes=10), 2.0 + float("{0:.1f}".format(random.random() * 2)))


for i in range(20):
    AddWorkoutSession(timezone.now() + datetime.timedelta(days = 2 * i), 2 if i % 2 else 1, int(i/2))
