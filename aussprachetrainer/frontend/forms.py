from django import forms
from .models import School, Course, Student

class SchoolForm(forms.ModelForm):
    class Meta:
        model = School
        fields = ['name', 'federal_land']


class CourseForm(forms.ModelForm):

    class Meta:
        model = Course
        fields = ['name', 'language']
