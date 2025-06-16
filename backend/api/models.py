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
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text="Indica se o colaborador está ativo")

    def __str__(self):
        return f"{self.name} ({self.username})"


class Service(models.Model):
    """
    Model representing a service that can be used by users.
    """
    name = models.CharField(max_length=255, unique=True)
    duration = models.IntegerField(help_text="Duração do serviço em minutos")
    price = models.CharField(max_length=20, help_text="Preço em reais")

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
    clientPhone = models.CharField(max_length=20, blank=True, null=True)
    collaborator = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pendente', 'Pendente'),
        ('confirmado', 'Confirmado'),
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