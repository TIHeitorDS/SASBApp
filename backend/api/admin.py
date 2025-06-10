from django.contrib import admin
from .models import Service, Appointment, AppointmentTime

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """
    Admin interface for the Service model.
    Allows management of services through the Django admin panel.
    """
    list_display = ['name', 'duration', 'price']
    search_fields = ['name']


@admin.register(Appointment)
class Appointment(admin.ModelAdmin):
    """
    Admin interface for the Appointment model.
    Allows management of appointments through the Django admin panel.
    """
    list_display = ['userName', 'service', 'appointment_time', 'created_at']
    search_fields = ['userName', 'service__name']
    list_filter = ['created_at']


@admin.register(AppointmentTime)
class AppointmentTimeAdmin(admin.ModelAdmin):
    """
    Admin interface for the AppointmentTime model.
    Allows management of appointment times through the Django admin panel.
    """
    list_display = ['start_time', 'end_time']
    search_fields = ['start_time', 'end_time']
    list_filter = ['start_time', 'end_time']