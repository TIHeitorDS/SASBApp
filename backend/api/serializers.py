# serializers.py

from rest_framework import serializers
from django.db import transaction
from .models import User, Service, Appointment


class UserSerializer(serializers.ModelSerializer):
    """
    NOVO: Serializer para o modelo User.
    Lida com a criação segura de senhas e atualizações.
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'email', 'phone', 'role', 'password'
        ]
        read_only_fields = ['role']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 8}
        }

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            role=User.Role.COLLABORATOR
        )
        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        return super().update(instance, validated_data)


class ServiceSerializer(serializers.ModelSerializer):
    """
    ALTERADO: Serializer para o modelo Service.
    Mostra quem criou o serviço.
    """
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'duration', 'price',
            'is_active', 'created_by'
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    """
    REESCRITO: Serializer para o modelo Appointment.
    Alinhado com a nova estrutura e validações.
    """
    service = ServiceSerializer(read_only=True)
    collaborator = UserSerializer(read_only=True)

    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.filter(is_active=True),
        source='service',
        write_only=True
    )
    collaborator_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.COLLABORATOR),
        source='collaborator',
        write_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            'id', 'client_name', 'client_contact', 'notes', 'status',
            'start_time', 'end_time',
            'service', 'collaborator',
            'service_id', 'collaborator_id'
        ]
        read_only_fields = ['id', 'status', 'end_time']

    def validate(self, data):
        """
        Gatilho para as validações do modelo (clean).
        Essencial para verificar conflitos de horário e regras de negócio.
        """
        instance = Appointment(**data)

        try:
            instance.full_clean()
        except Exception as e:
            raise serializers.ValidationError(e.message_dict)

        return data
