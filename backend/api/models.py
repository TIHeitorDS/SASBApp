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
        """Garante que admins sejam staff e username seja minúsculo"""
        if self.username:
            self.username = self.username.lower()
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
        related_name='appointments',
        verbose_name='Serviço'
    )
    employee = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        limit_choices_to={'role': User.Role.EMPLOYEE},
        verbose_name='Funcionário'
    )
    start_time = models.DateTimeField('Data/Hora de Início')
    end_time = models.DateTimeField('Data/Hora de Término', editable=False)
    client_name = models.CharField('Nome do Cliente', max_length=100)
    client_contact = models.CharField('Contato do Cliente', max_length=100)
    status = models.CharField(
        'Status',
        max_length=10,
        choices=Status.choices,
        default=Status.RESERVED
    )
    notes = models.TextField('Observações', blank=True)
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        verbose_name = 'Agendamento'
        verbose_name_plural = 'Agendamentos'
        ordering = ['start_time']

    def save(self, *args, **kwargs):
        """Salva o agendamento com validações apropriadas"""
        skip_validation = kwargs.pop('skip_validation', False)
        
        if not skip_validation:
            self.full_clean()
        
        if not self.end_time:
            self.end_time = self.start_time + timedelta(minutes=self.service.duration)
        
        super().save(*args, **kwargs)

    def clean(self):
        """Validações completas do agendamento"""
        super().clean()

        if not self.service_id:
            raise ValidationError({'service': 'Serviço é obrigatório.'})

        if not self.employee_id:
            raise ValidationError({'employee': 'Funcionário é obrigatório.'})

        if not self.start_time:
            raise ValidationError({'start_time': 'Data e hora são obrigatórias.'})

        self.end_time = self.start_time + timedelta(minutes=self.service.duration)

        if self.status == self.Status.RESERVED:
            self._validate_reserved_appointment()
        elif self.status == self.Status.COMPLETED:
            self._validate_completed_appointment()
        elif self.status == self.Status.CANCELLED:
            self._validate_cancelled_appointment()

    def _validate_reserved_appointment(self):
        """Validações específicas para agendamentos reservados"""
        if (not self.pk and self.start_time < timezone.now()) or \
           (self.pk and self.status == self.Status.RESERVED and self.start_time < timezone.now()):
            raise ValidationError(
                {'start_time': "Não é possível agendar para horários passados."}
            )

        conflicting = Appointment.objects.filter(
            employee=self.employee,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
            status=self.Status.RESERVED
        ).exclude(pk=getattr(self, 'pk', None))

        if conflicting.exists():
            raise ValidationError(
                {'start_time': "O funcionário já possui um agendamento neste horário."}
            )

    def _validate_completed_appointment(self):
        """Validações específicas para agendamentos completos"""
        pass

    def _validate_cancelled_appointment(self):
        """Validações específicas para agendamentos cancelados"""
        pass

    def complete(self):
        """Marca o agendamento como concluído"""
        if self.status != self.Status.RESERVED:
            raise ValidationError("Só é possível concluir agendamentos reservados.")

        if timezone.now() < self.start_time:
            raise ValidationError("Não é possível concluir agendamentos futuros.")

        self.status = self.Status.COMPLETED
        self.save()

    def cancel(self):
        """Cancela o agendamento"""
        if self.status != self.Status.RESERVED:
            raise ValidationError("Só é possível cancelar agendamentos reservados.")

        if timezone.now() > self.start_time:
            raise ValidationError("Não é possível cancelar agendamentos passados.")

        self.status = self.Status.CANCELLED
        self.save()

    def __str__(self):
        return f"{self.client_name} - {self.service.name} ({self.start_time.strftime('%d/%m/%Y %H:%M')})"