from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Custom User model that extends Django's AbstractUser.
    This allows for additional fields or methods in the future.
    """

    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True, blank=False, null=False)
    password = models.CharField(max_length=128, blank=False, null=False)

    class Meta:
        abstract = True
    
    def is_authenticated(self):
        """
        Override the is_authenticated method to return True.
        This is necessary for compatibility with Django's authentication system.
        """
        return True
    
    def __str__(self):
        return self.username


class Collaborator(User):
    """
    Model representing a collaborator who can provide services.
    Inherits from the custom User model.
    """

    class Meta:
        # Add these to avoid clashes with auth.User
        permissions = [
            # your custom permissions here
        ]
        
    def __str__(self):
        return f"{self.name} ({self.username})"

    # If you need to customize the related_name for groups and user_permissions
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name="collaborator_groups",
        related_query_name="collaborator",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="collaborator_permissions",
        related_query_name="collaborator",
    )


class Service(models.Model):
    """
    Model representing a service that can be used by users.
    """
    name = models.CharField(max_length=255, unique=True)
    duration = models.IntegerField(help_text="Duração do serviço em minutos")
    price = models.FloatField(help_text="Preço em reais")

    def __str__(self):
        return self.name
    

class AppointmentTime(models.Model):
    """
    Model representing an appointment time for a service.
    """
    service = models.ForeignKey(Service, on_delete=models.CASCADE, null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return f"{self.service.name} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"


class Appointment(models.Model):
    """
    Model representing an appointment for a user.
    """
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    appointment_time = models.ForeignKey(AppointmentTime, on_delete=models.CASCADE)
    client = models.CharField(max_length=255, blank=True, null=True)
    client_phone = models.CharField(max_length=20, blank=True, null=True)
    professional = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pendente', 'Pendente'),
        ('reservado', 'Reservado'),
        ('cancelado', 'Cancelado'),
    ])

    def update_status(self, new_status):
        """
        Update the status of the appointment.
        """
        if new_status in dict(self._meta.get_field('status').choices):
            self.status = new_status
            self.save()
        else:
            raise ValueError("Invalid status value")
        
    def verify_disponibility(self):
        """
        Check if the appointment time is available.
        Returns True if available, False otherwise.
        """
        overlapping_appointments = Appointment.objects.filter(
            appointment_time=self.appointment_time,
            status__in=['pendente', 'confirmado']
        )
        return not overlapping_appointments.exists()

    def __str__(self):
        return f"{self.client} - {self.service.name} at {self.appointment_time.start_time.strftime('%Y-%m-%d %H:%M')}"