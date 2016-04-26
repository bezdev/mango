# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Weightlifting',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('exercise', models.CharField(max_length=50)),
                ('date', models.DateField()),
                ('set', models.PositiveSmallIntegerField()),
                ('weight', models.PositiveSmallIntegerField()),
                ('reps', models.PositiveSmallIntegerField()),
            ],
            options={
                'db_table': 'weightlifting',
                'managed': False,
            },
        ),
    ]
