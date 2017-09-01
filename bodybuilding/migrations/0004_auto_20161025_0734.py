# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bodybuilding', '0003_auto_20161020_0921'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cardiotraining',
            name='distance',
            field=models.DecimalField(null=True, max_digits=7, decimal_places=2, blank=True),
        ),
    ]
