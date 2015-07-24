from django.db import models

class DumbbellBenchPress(models.Model):
    date = models.DateField()
    set = models.PositiveSmallIntegerField()
    weight = models.PositiveSmallIntegerField()
    reps = models.PositiveSmallIntegerField()