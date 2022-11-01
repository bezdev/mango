from django.db import models
from django.utils import timezone

class WorkoutSession(models.Model):
    date = models.DateField(default=timezone.now)
    weight = models.DecimalField(max_digits = 4, decimal_places = 1, blank = True, null = True)
    startTime = models.PositiveSmallIntegerField(blank = True, null = True)
    endTime = models.PositiveSmallIntegerField(blank = True, null = True)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return str(self.date)

class WeightExercise(models.Model):
    name = models.CharField(max_length = 50)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return str(self.name)

class CardioExercise(models.Model):
    name = models.CharField(max_length = 20)

    def __str__(self):
        return str(self.name)

class WeightTraining(models.Model):
    workout = models.ForeignKey(WorkoutSession, on_delete=models.PROTECT)
    exercise = models.ForeignKey(WeightExercise, on_delete=models.PROTECT)

    def __str__(self):
        return str(self.workout) + " " + str(self.exercise)

class Set(models.Model):
    training = models.ForeignKey(WeightTraining, on_delete=models.PROTECT)
    set = models.PositiveSmallIntegerField()
    weight = models.DecimalField(max_digits = 5, decimal_places = 1)
    reps = models.PositiveSmallIntegerField()

    def __str__(self):
        return str(self.training) + " Set: " + str(self.set) + " " + str(self.weight) + "x" + str(self.reps)

class CardioTraining(models.Model):
    workout = models.ForeignKey(WorkoutSession, on_delete=models.PROTECT)
    exercise = models.ForeignKey(CardioExercise, on_delete=models.PROTECT)
    time = models.DurationField(blank = True, null = True)
    distance = models.DecimalField(max_digits = 7, decimal_places = 2, blank = True, null = True)
    units = models.CharField(max_length = 10)

    def __str__(self):
        return str(self.exercise) + " Time: " + str(self.time) + " Distance: " + str(self.distance) + " " + self.units