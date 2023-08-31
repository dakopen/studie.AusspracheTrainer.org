from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from faker import Faker

class Command(BaseCommand):
    help = 'Creates fake users in the database.'

    def add_arguments(self, parser):
        parser.add_argument('total', type=int, help='Indicates the number of users to be created')

    def handle(self, *args, **kwargs):
        fake = Faker()
        total = kwargs['total']
        
        for i in range(total):
            User.objects.create(
                username=fake.unique.user_name(),
                email=fake.email(),
                password=fake.password(),
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully created user {i+1}'))
