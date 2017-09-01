# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bodybuilding', '0004_auto_20161025_0734'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='weightexercise',
            options={'ordering': ['name']},
        ),
        migrations.AlterModelOptions(
            name='workoutsession',
            options={'ordering': ['-id']},
        ),
    ]
