# Generated by Django 4.0.5 on 2022-07-13 07:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0002_recipe_slugname'),
    ]

    operations = [
        migrations.RenameField(
            model_name='recipe',
            old_name='slugName',
            new_name='nameSlug',
        ),
    ]