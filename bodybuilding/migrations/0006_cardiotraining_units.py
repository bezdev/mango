# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bodybuilding', '0005_auto_20161104_0850'),
    ]

    operations = [
        migrations.AddField(
            model_name='cardiotraining',
            name='units',
            field=models.CharField(default='mi.', max_length=10),
            preserve_default=False,
        ),
    ]
