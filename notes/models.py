"""
Notes
"""
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

class Note(models.Model):
    """
    Note Model
    """
    create_date = models.DateField(default = timezone.now)
    name = models.CharField(max_length = 128, null = False)
    name_slug = models.SlugField(max_length = 128, null = False)
    text = models.TextField(max_length = 8192, null = False)
    text_file = models.FileField(upload_to='notes', null = True)
    is_private = models.BooleanField(default=False)

    @classmethod
    def get_notes(cls, user):
        if user.is_authenticated:
            return cls.objects.all()
        else:
            return cls.objects.filter(is_private=False)

    def get_text(self):
        if self.text_file:
            with self.text_file.open('r') as file:
                return file.read()

        if self.text:
            return self.text

        return ""

    def __str__(self):
        return str(self.name)

    def save(self, *args, **kwargs):
        self.name_slug = slugify(self.name)
        super(Note, self).save(*args, **kwargs)

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
    file = models.FileField(upload_to='notes/files', null = False)

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = self.file.name
        super().save(*args, **kwargs)
