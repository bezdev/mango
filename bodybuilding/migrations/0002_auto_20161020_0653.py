# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bodybuilding', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cardiotraining',
            name='distance',
            field=models.DecimalField(null=True, max_digits=4, decimal_places=1, blank=True),
        ),
        migrations.AlterField(
            model_name='cardiotraining',
            name='time',
            field=models.DurationField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='workoutsession',
            name='endTime',
            field=models.PositiveSmallIntegerField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='workoutsession',
            name='startTime',
            field=models.PositiveSmallIntegerField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='workoutsession',
            name='weight',
            field=models.DecimalField(null=True, max_digits=4, decimal_places=1, blank=True),
        ),
    ]
