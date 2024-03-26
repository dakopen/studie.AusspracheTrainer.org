from django.contrib import admin
from .models import School, Teacher, Student, Course


# Optional: Customize the admin interface
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'email', 'sex', 'age')
    search_fields = ('student_id', 'email')

class TeacherAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'school')
    search_fields = ('username', 'email', 'school')
    list_filter = ('school',)

class CourseAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'language')
    search_fields = ('teacher__username', 'teacher__email', 'teacher__school', 'language')
    list_filter = ('teacher', 'language')

class SchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'federal_land')
    search_fields = ('name', 'federal_land')

# Register your models with custom admin classes
admin.site.register(Student, StudentAdmin)
admin.site.register(Teacher, TeacherAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(School, SchoolAdmin)
