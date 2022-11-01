from django.db import models
from django.utils import timezone

class Recipe(models.Model):
    createdate = models.DateField(default=timezone.now)
    name = models.CharField(max_length = 128, null = False)
    nameSlug = models.SlugField(max_length = 128, null = False)
    ingredientsText = models.TextField(max_length = 8192, null = False)
    directionsText = models.TextField(max_length = 8192, null = False)

    def __str__(self):
        return str(self.createdate)