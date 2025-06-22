# api/models
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        EMPLOYEE = 'EMPLOYEE', 'Funcionário'

    role = models.CharField(
        max_length=8,
        choices=Role.choices,
        default=Role.EMPLOYEE
    )
    phone = models.CharField(max_length=20, blank=True)
    is_staff = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        """Garante que admins sejam staff"""
        if self.role == self.Role.ADMIN:
            self.is_staff = True
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'


class Administrator(User):
    class Meta:
        proxy = True
        verbose_name = 'Administrador'
        verbose_name_plural = 'Administradores'

    def save(self, *args, **kwargs):
        self.role = User.Role.ADMIN
        self.is_staff = True
        super().save(*args, **kwargs)

    @classmethod
    def get_queryset(cls):
        return super().get_queryset().filter(role=User.Role.ADMIN)


class Employee(User):
    class Meta:
        proxy = True
        verbose_name = 'Funcionário'
        verbose_name_plural = 'Funcionários'

    def save(self, *args, **kwargs):
        self.role = User.Role.EMPLOYEE
        self.is_staff = False
        super().save(*args, **kwargs)

    @classmethod
    def get_queryset(cls):
        return super().get_queryset().filter(role=User.Role.EMPLOYEE)


class Service(models.Model):
    name = models.CharField(max_length=100, unique=True)
    duration = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(480)
        ],
        help_text="Duração em minutos (1-480)"
    )
    price = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal('0.01')),
            MaxValueValidator(Decimal('10000.00'))
        ]
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Appointment(models.Model):
    class Status(models.TextChoices):
        RESERVED = 'reserved', 'Reservado'
        CANCELLED = 'cancelled', 'Cancelado'
        COMPLETED = 'completed', 'Concluído'

    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='appointments'
    )
    employee = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        limit_choices_to={'role': User.Role.EMPLOYEE}
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(editable=False)
    client_name = models.CharField(max_length=100, blank=False)
    client_contact = models.CharField(max_length=100, blank=False)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.RESERVED
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()

        if not hasattr(self, 'service') or not self.service:
            raise ValidationError({'service': 'Serviço é obrigatório.'})

        if not hasattr(self, 'employee') or not self.employee:
            raise ValidationError({'employee': 'Funcionário é obrigatório.'})

        if not self.start_time:
            raise ValidationError({'start_time': 'Data e hora são obrigatórias.'})

        self.end_time = self.start_time + timedelta(minutes=self.service.duration)

        if self.status != self.Status.COMPLETED and self.start_time < timezone.now():
            raise ValidationError(
                {'start_time': "Não é possível agendar para horários passados."}
            )

        conflicting = Appointment.objects.filter(
            employee=self.employee,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
            status=Appointment.Status.RESERVED
        ).exclude(pk=getattr(self, 'pk', None))

        if conflicting.exists():
            raise ValidationError(
                {'start_time': "O funcionário já possui um agendamento neste horário."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def cancel(self, *args, **kwargs):
        if self.status != self.Status.RESERVED:
            raise ValidationError(
                "Só é possível cancelar agendamentos reservados.")
        if timezone.now() > self.start_time:
            raise ValidationError(
                "Não é possível cancelar agendamentos passados.")
        self.status = self.Status.CANCELLED
        self.save(*args, **kwargs)

    def complete(self, *args, **kwargs):
        if self.status != self.Status.RESERVED:
            raise ValidationError(
                "Só é possível concluir agendamentos reservados.")
        if timezone.now() < self.start_time:
            raise ValidationError(
                "Não é possível concluir agendamentos futuros.")
        self.status = self.Status.COMPLETED
        self.save(*args, **kwargs)

    def __str__(self):
        return f"{self.client_name} - {self.service.name} ({self.start_time.strftime('%d/%m/%Y %H:%M')})"
