from rest_framework import serializers
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for the Service model.
    This serializer converts Service instances to JSON and vice versa.
    """
    
    class Meta:
        model = Service
        fields = ['id', 'name', 'duration', 'price']
        read_only_fields = ['id']  # id is auto-generated, so it should be read-only