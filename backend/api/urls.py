from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, AppointmentViewSet, AppointmentTimeViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'appointment-times', AppointmentTimeViewSet, basename='appointmenttime')

urlpatterns = [
    path('', include(router.urls)),
]