from django.contrib.auth import get_user_model
from frontend.models import School, Teacher

School.objects.create(name='Testschule', federal_land='Hessen')

User = get_user_model()  # Get the custom user model, which should be Teacher based on your setup
school = School.objects.first()  # Assuming you want to associate with the first school, or use School.objects.get(id=YOUR_SCHOOL_ID)

teacher_user = User.objects.create_superuser(username='superuser', email='superuser@example.com', password='yourpassword')
teacher_user.school = school  # Associate the teacher with the school
teacher_user.save()
