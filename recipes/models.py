"""
Recipes
"""
from django.db import models
from django.utils import timezone

class Recipe(models.Model):
    """
    Recipe Model
    """
    create_date = models.DateField(default=timezone.now)
    name = models.CharField(max_length = 128, null = False)
    name_slug = models.SlugField(max_length = 128, null = False)
    ingredient_text = models.TextField(max_length = 8192, null = False)
    direction_text = models.TextField(max_length = 8192, null = False)

    def __str__(self):
        return f'{str(self.create_date)},{self.name},{self.name_slug},{self.ingredient_text},{self.direction_text}'
