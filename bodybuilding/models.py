from django.db import models
from django.utils import timezone

class WorkoutSession(models.Model):
    date = models.DateField(default=timezone.now)
    weight = models.DecimalField(max_digits = 4, decimal_places = 1)
    startTime = models.PositiveSmallIntegerField()
    endTime = models.PositiveSmallIntegerField()

    def __str__(self):
        return unicode(self.date)

class WeightExercise(models.Model):
    name = models.CharField(max_length = 50)

    def __str__(self):
        return unicode(self.name)

class CardioExercise(models.Model):
    name = models.CharField(max_length = 20)

    def __str__(self):
        return unicode(self.name)

class WeightTraining(models.Model):
    workout = models.ForeignKey(WorkoutSession)
    exercise = models.ForeignKey(WeightExercise)

    def __str__(self):
        return unicode(self.workout) + " " + unicode(self.exercise)

class Set(models.Model):
    training = models.ForeignKey(WeightTraining)
    set = models.PositiveSmallIntegerField()
    weight = models.DecimalField(max_digits = 5, decimal_places = 1)
    reps = models.PositiveSmallIntegerField()

    def __str__(self):
        return unicode(self.training) + " Set: " + unicode(self.set) + " " + unicode(self.weight) + "x" + unicode(self.reps)

class CardioTraining(models.Model):
    workout = models.ForeignKey(WorkoutSession)
    exercise = models.ForeignKey(CardioExercise)
    time = models.DurationField()
    distance = models.DecimalField(max_digits = 4, decimal_places = 1)

    def __str__(self):
        return unicode(self.exercise) + " Time: " + unicode(self.time) + " Distance: " + unicode(self.distance) + "mi"