from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from django.conf import settings


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        COLLABORATOR = 'COLLAB', 'Colaborador'

    role = models.CharField(
        max_length=6, choices=Role.choices, default=Role.COLLABORATOR)
    phone = models.CharField(max_length=20, blank=True)

    def is_admin(self):
        return self.role == self.Role.ADMIN

    def is_collaborator(self):
        return self.role == self.Role.COLLABORATOR


class Administrator(User):
    class Meta:
        proxy = True
        verbose_name = 'Administrador'
        verbose_name_plural = 'Administradores'

    def save(self, *args, **kwargs):
        self.role = User.Role.ADMIN
        self.is_staff = True
        super().save(*args, **kwargs)


class Collaborator(User):
    class Meta:
        proxy = True
        verbose_name = 'Colaborador'
        verbose_name_plural = 'Colaboradores'

    def save(self, *args, **kwargs):
        self.role = User.Role.COLLABORATOR
        self.is_staff = False
        super().save(*args, **kwargs)


class Service(models.Model):
    name = models.CharField(max_length=100, unique=True)
    duration = models.PositiveIntegerField(
        validators=[
            MinValueValidator(15, message="Duração mínima de 15 minutos"),
            MaxValueValidator(480, message="Duração máxima de 8 horas")
        ],
        help_text="Duração em minutos"
    )
    price = models.DecimalField(max_digits=7, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='services_created')

    def __str__(self):
        return self.name


class Appointment(models.Model):
    class Status(models.TextChoices):
        RESERVED = 'reserved', 'Reservado'
        CANCELLED = 'cancelled', 'Cancelado'
        COMPLETED = 'completed', 'Concluído'

    service = models.ForeignKey(Service, on_delete=models.PROTECT)
    collaborator = models.ForeignKey(Collaborator, on_delete=models.PROTECT)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(editable=False)
    client_name = models.CharField(max_length=100)
    client_contact = models.CharField(max_length=100)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.RESERVED)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()

        if not self.service or not self.start_time:
            return

        # 1. Cálculo do horário final
        self.end_time = self.start_time + \
            timedelta(minutes=self.service.duration)

        # 2. Validação de horário no futuro
        if self.start_time < timezone.now():
            raise ValidationError(
                {'start_time': "Não é possível agendar para horários passados."}
            )

        # 3. Validação de conflitos
        conflicting = Appointment.objects.filter(
            collaborator=self.collaborator,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
            status=Appointment.Status.RESERVED
        ).exclude(pk=self.pk)

        if conflicting.exists():
            raise ValidationError(
                {'start_time': "O colaborador já possui um agendamento neste horário."}
            )

        # 4. validacao de status
        if self.pk and self.status != self.Status.RESERVED:
            original = Appointment.objects.get(pk=self.pk)

        def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def cancel(self):
        if self.status == self.Status.RESERVED and self.start_time > timezone.now():
            self.status = self.Status.CANCELLED
            self.save(update_fields=['status', 'updated_at'])
        else:
            raise ValidationError(
                "Apenas agendamentos futuros e reservados podem ser cancelados.")

    def complete(self):
        if self.status == self.Status.RESERVED:
            self.status = self.Status.COMPLETED
            self.save(update_fields=['status', 'updated_at'])  
        else:
            raise ValidationError(
                "Apenas agendamentos reservados podem ser concluídos.")

    def __str__(self):
        return f"{self.client_name} - {self.service.name} ({self.start_time.strftime('%d/%m/%Y %H:%M')})"
