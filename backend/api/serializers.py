# api/serializers
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from .models import User, Service, Appointment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name',
                  'email', 'phone', 'role', 'is_staff', 'is_active']
        read_only_fields = ['is_staff', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)


class EmployeeSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'role': {'read_only': True}
        }

    def create(self, validated_data):
        validated_data['role'] = User.Role.EMPLOYEE
        return super().create(validated_data)


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
        instance = Appointment(**data)
        try:
            instance.clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return data
