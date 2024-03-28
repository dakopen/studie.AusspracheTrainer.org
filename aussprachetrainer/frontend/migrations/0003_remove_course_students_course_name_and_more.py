# Generated by Django 4.1.13 on 2024-03-28 20:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0002_alter_course_id_alter_school_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='students',
        ),
        migrations.AddField(
            model_name='course',
            name='name',
            field=models.CharField(default='Kurs vom <built-in method today of type object at 0x926860>', max_length=100),
        ),
        migrations.AddField(
            model_name='student',
            name='single_course',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='frontend.course'),
        ),
    ]