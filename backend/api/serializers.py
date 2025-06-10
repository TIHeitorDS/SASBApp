from rest_framework import serializers
from .models import Service, Appointment, AppointmentTime

class ServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for the Service model.
    This serializer converts Service instances to JSON and vice versa.
    """
    
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
        fields = ['id', 'userName', 'service', 'appointment_time', 'created_at']
        read_only_fields = ['id', 'created_at']  # id and created_at are auto-generated, so they should be read-only