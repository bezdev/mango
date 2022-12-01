"""
Notes
"""
from django.db import models
from django.utils import timezone

class Note(models.Model):
    """
    Note Model
    """
    create_date = models.DateField(default=timezone.now)
    name = models.CharField(max_length = 128, null = False)
    name_slug = models.SlugField(max_length = 128, null = False)
    text = models.TextField(max_length = 8192, null = False)

    def __str__(self):
        return f'{str(self.create_date)},{self.name},{self.name_slug},{self.text}'

class Tag(models.Model):
    """
    Tag Model
    """
    note = models.ForeignKey(Note, on_delete=models.PROTECT)
    name = models.CharField(max_length = 128, null = False)
