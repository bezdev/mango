from django.db import models

class Weightlifting(models.Model):
    exercise = models.CharField(max_length = 50)
    date = models.DateField()
    set = models.PositiveSmallIntegerField()
    weight = models.PositiveSmallIntegerField()
    reps = models.PositiveSmallIntegerField()

    def __str__(self):
        return self.exercise + " " + unicode(self.date) + " " + unicode(self.set) + " " + unicode(self.reps) + "x" + unicode(self.weight) 

    class Meta:
        db_table = "weightlifting"