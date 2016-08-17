# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CardioExercise',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='CardioTraining',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('time', models.DurationField()),
                ('distance', models.FloatField()),
                ('exercise', models.ForeignKey(to='bodybuilding.CardioExercise')),
            ],
        ),
        migrations.CreateModel(
            name='Set',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('set', models.PositiveSmallIntegerField()),
                ('weight', models.PositiveSmallIntegerField()),
                ('reps', models.PositiveSmallIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='WeightExercise',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='WeightTraining',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('exercise', models.ForeignKey(to='bodybuilding.WeightExercise')),
            ],
        ),
        migrations.CreateModel(
            name='WorkoutSession',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date', models.DateField(default=django.utils.timezone.now)),
            ],
        ),
        migrations.AddField(
            model_name='weighttraining',
            name='workout',
            field=models.ForeignKey(to='bodybuilding.WorkoutSession'),
        ),
        migrations.AddField(
            model_name='set',
            name='training',
            field=models.ForeignKey(to='bodybuilding.WeightTraining'),
        ),
        migrations.AddField(
            model_name='cardiotraining',
            name='workout',
            field=models.ForeignKey(to='bodybuilding.WorkoutSession'),
        ),
    ]
