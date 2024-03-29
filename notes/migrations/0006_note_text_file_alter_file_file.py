# Generated by Django 4.1.2 on 2024-02-18 08:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notes', '0005_alter_file_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='note',
            name='text_file',
            field=models.FileField(null=True, upload_to='notes'),
        ),
        migrations.AlterField(
            model_name='file',
            name='file',
            field=models.FileField(upload_to='notes/files'),
        ),
    ]
