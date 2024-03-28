import datetime
from django.contrib.auth.models import AbstractBaseUser, AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.db import models
from django.contrib.auth.models import Group, Permission


# Custom manager for Student
class MyUserManager(BaseUserManager):
    def create_user(self, student_id, email=None, sex=None, age=None, password=None):
        if not student_id:
            raise ValueError('Students must have an ID')
        
        user = self.model(
            student_id=student_id,
            email=self.normalize_email(email),
            sex=sex,
            age=age,
        )

        user.set_unusable_password()  # Students do not have a password initially
        user.save(using=self._db)
        return user



# Student model
class Student(AbstractBaseUser):
    alphanumeric_validator = RegexValidator(r'^[0-9A-Z]*$', 'Only alphanumeric characters are allowed for student ID.')
    
    student_id = models.CharField(max_length=8, unique=True, validators=[alphanumeric_validator])
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True)
    sex = models.CharField(max_length=1, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    single_course = models.ForeignKey('Course', on_delete=models.CASCADE, null=True, blank=True)

    objects = MyUserManager()

    USERNAME_FIELD = 'student_id'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.student_id

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True


class Teacher(AbstractUser):
    school = models.ForeignKey('School', on_delete=models.CASCADE, null=True, blank=True)
    # Specify related_name for user_permissions and groups to avoid conflict
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="teacher_user",
        related_query_name="teacher",
    )
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="teacher_group",
        related_query_name="teacher",
    )


# School model
class School(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    federal_land = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# Course model
class Course(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, default=f"Kurs vom {datetime.date.today}")
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    language = models.CharField(max_length=2)

    def __str__(self):
        return f'{self.language} by {self.teacher.username}'
