"""
Clips
"""
import random
import string

from django.db import models
from django.utils import timezone

class Clip(models.Model):
    """
    Clip
    """
    code = models.CharField(max_length=10)
    create_date = models.DateField(default=timezone.now)
    name = models.CharField(max_length=128, blank=True)
    file = models.FileField(upload_to='clips', null=False)

    def __str__(self):
        return str(self.name)

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = self.file.name

        unique_id = self.generate_id()
        while Clip.objects.filter(code=unique_id).exists():
            unique_id = self.generate_id()

        self.code = unique_id

        super().save(*args, **kwargs)

    def generate_id(self, length=5):
        return ''.join(random.choice(string.ascii_letters) for i in range(length))

class Tag(models.Model):
    """
    Tag
    """
    name = models.CharField(max_length=32, null=False)

class ClipTag(models.Model):
    """
    Clip Tag
    """
    clip = models.ForeignKey(Clip, on_delete=models.PROTECT)
    tag = models.ForeignKey(Tag, on_delete=models.PROTECT)
