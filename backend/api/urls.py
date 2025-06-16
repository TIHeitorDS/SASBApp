from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, AppointmentViewSet, AppointmentTimeViewSet, CollaboratorViewSet

router = DefaultRouter()
router.register(r'collaborators', CollaboratorViewSet, basename='collaborator')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'appointment-times', AppointmentTimeViewSet, basename='appointmenttime')

urlpatterns = [
    path('', include(router.urls)),
]