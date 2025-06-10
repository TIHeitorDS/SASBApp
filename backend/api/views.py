from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Service, Appointment, AppointmentTime
from .serializers import ServiceSerializer, AppointmentSerializer, AppointmentTimeSerializer

class isAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    Non-admin users can only read objects.
    """
    
    def has_permission(self, request, view):
        # Allow read-only access for non-authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        # Allow write access only for admin users
        return request.user and request.user.is_staff


class ServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Service instances.
    Provides CRUD operations for the Service model.
    """
    
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [isAdminOrReadOnly]


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Appointment instances.
    Provides CRUD operations for the Appointment model.
    """
    
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [isAdminOrReadOnly]


class AppointmentTimeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing AppointmentTime instances.
    Provides CRUD operations for the AppointmentTime model.
    """
    
    queryset = AppointmentTime.objects.all()
    serializer_class = AppointmentTimeSerializer
    permission_classes = [isAdminOrReadOnly]