"""
Notes
"""
from django.db import models
from django.utils import timezone

class Note(models.Model):
    """
    Note Model
    """
    create_date = models.DateField(default = timezone.now)
    name = models.CharField(max_length = 128, null = False)
    name_slug = models.SlugField(max_length = 128, null = False)
    text = models.TextField(max_length = 8192, null = False)

    def __str__(self):
        return str(self.name)

class Tag(models.Model):
    """
    Tag Model
    """
    note = models.ForeignKey(Note, on_delete = models.CASCADE)
    name = models.CharField(max_length = 128, null = False)

class File(models.Model):
    """
    File Model
    """
    create_date = models.DateField(default = timezone.now)
    note = models.ForeignKey(Note, on_delete = models.CASCADE)
    name = models.CharField(max_length = 128, blank = True)
    file = models.FileField(upload_to='notes', null = False)

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = self.file.name
        super().save(*args, **kwargs)
