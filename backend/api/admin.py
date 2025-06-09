from django.contrib import admin
from .models import Service

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """
    Admin interface for the Service model.
    Allows management of services through the Django admin panel.
    """
    list_display = ['name', 'duration', 'price']
    search_fields = ['name']
