from rest_framework import serializers
from .models import Service, Appointment, AppointmentTime, Collaborator

class CollaboratorSerializer(serializers.ModelSerializer):
    """
    Serializer for the Collaborator model.
    This serializer converts Collaborator instances to JSON and vice versa.
    """

    name = serializers.CharField(max_length=100)
    password = serializers.CharField(min_length=6)
    
    class Meta:
        model = Collaborator
        fields = ['id', 'name', 'email', 'password']
        read_only_fields = ['id']  # id is auto-generated, so it should be read-only

class ServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for the Service model.
    This serializer converts Service instances to JSON and vice versa.
    """
    duration = serializers.IntegerField(min_value=1, max_value=480)
    price = serializers.FloatField(min_value=0, max_value=10000)
    
    class Meta:
        model = Service
        fields = ['id', 'name', 'duration', 'price']
        read_only_fields = ['id']  # id is auto-generated, so it should be read-only


class AppointmentTimeSerializer(serializers.ModelSerializer):
    """
    Serializer for the AppointmentTime model.
    This serializer converts AppointmentTime instances to JSON and vice versa.
    """
    
    class Meta:
        model = AppointmentTime
        fields = ['id', 'start_time', 'end_time']
        read_only_fields = ['id']  # id is auto-generated, so it should be read-only


class AppointmentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Appointment model.
    This serializer converts Appointment instances to JSON and vice versa.
    """
    
    class Meta:
        model = Appointment
        fields = ['id', 'client',  'service', 'appointment_time', 'client_phone', 'professional', 'created_at', 'status']
        read_only_fields = ['id', 'created_at']  # id and created_at are auto-generated, so they should be read-only