# Generated by Django 4.1.10 on 2024-01-19 18:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0005_remove_pronunciationassessmentresult_word_assessment'),
    ]

    operations = [
        migrations.CreateModel(
            name='SynthesizedAudioFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language', models.CharField(max_length=5)),
                ('text', models.TextField()),
                ('filename', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
