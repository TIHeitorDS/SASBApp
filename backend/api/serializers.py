# api/serializers
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.db import transaction
from django.utils import timezone
from .models import User, Service, Appointment
from datetime import timedelta  
from django.core.exceptions import ValidationError


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name',
                 'email', 'phone', 'role', 'is_staff', 'is_active']
        read_only_fields = ['is_staff', 'is_active', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': False,
                'min_length': 6,
                'error_messages': {
                    'min_length': 'A senha deve ter pelo menos 6 caracteres.'
                }
            },
            'email': {
                'required': True,
                'validators': [UniqueValidator(queryset=User.objects.all())]
            },
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, data):
        errors = {}

        required_fields = ['first_name', 'last_name', 'email']
        for field in required_fields:
            if field in self.Meta.extra_kwargs.get('required_fields', []) and not data.get(field):
                errors[field] = 'Este campo é obrigatório.'

        if 'password' in data:
            if len(data['password']) < 6:
                errors['password'] = 'A senha deve ter pelo menos 6 caracteres.'

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class EmployeeSerializer(UserSerializer):
    first_name = serializers.CharField(required=True)  # Força a validação

    def validate(self, data):
        if not data.get('first_name'):
            raise serializers.ValidationError({"first_name": "Este campo é obrigatório"})
        
        if 'username' in data:
            username = data['username'].lower()
            instance = getattr(self, 'instance', None)
            # Verifica se já existe outro usuário com o mesmo username (case-insensitive)
            if User.objects.filter(username__iexact=username).exclude(pk=instance.pk if instance else None).exists():
                raise serializers.ValidationError({"username": "Este nome de usuário já está em uso"})
            data['username'] = username
        
        # Validação específica para senha
        is_create = self.instance is None
        if is_create and not data.get('password'):
            raise serializers.ValidationError({"password": "Senha é obrigatória no cadastro"})
        
        if 'password' in data and len(data['password']) < 6:
            raise serializers.ValidationError({"password": "A senha deve ter pelo menos 6 caracteres"})
        
        return data

    class Meta(UserSerializer.Meta):
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone', 'password']
        extra_kwargs = {
            **UserSerializer.Meta.extra_kwargs,
            'username': {
                'required': True,
                'validators': [UniqueValidator(queryset=User.objects.all())]
            },
            'password': {
                'write_only': True,
                'required': False,
                'min_length': 6,
                'error_messages': {
                    'min_length': 'A senha deve ter pelo menos 6 caracteres.'
                }
            }
        }

    def create(self, validated_data):
        validated_data['role'] = User.Role.EMPLOYEE
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class ServiceSerializer(serializers.ModelSerializer):
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'name', 'duration', 'price', 'is_active', 'can_delete']

    def get_can_delete(self, obj):
        return not obj.appointments.filter(
            start_time__gt=timezone.now(),
            status=Appointment.Status.RESERVED
        ).exists()

    def validate_duration(self, value):
        if not 1 <= value <= 480:
            raise serializers.ValidationError(
                "Duração deve ser entre 1 e 480 minutos")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Valor deve ser positivo")
        if value > 10000:
            raise serializers.ValidationError("Valor máximo é R$ 10.000,00")
        return value


class AppointmentSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    employee = UserSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.filter(is_active=True),
        source='service',
        write_only=True
    )
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.EMPLOYEE, is_active=True),
        source='employee',
        write_only=True
    )

    class Meta:
        model = Appointment
        fields = ['id', 'client_name', 'client_contact', 'start_time',
                'end_time', 'status', 'notes', 'service', 'employee',
                'service_id', 'employee_id']
        read_only_fields = ['end_time', 'status']

    def validate(self, data):
        required_fields = ['client_name', 'client_contact', 'service', 'employee', 'start_time']
        for field in required_fields:
            if field not in data or not data[field]:
                raise serializers.ValidationError({field: "Este campo é obrigatório."})

        instance = Appointment(**data)
        instance.end_time = instance.start_time + timedelta(minutes=instance.service.duration)
        
        try:
            instance.clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        
        return data

    def create(self, validated_data):
        validated_data['status'] = Appointment.Status.RESERVED
        return super().create(validated_data)