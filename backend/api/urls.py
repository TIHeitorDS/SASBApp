# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdministratorViewSet, CollaboratorViewSet, ServiceViewSet, AppointmentViewSet, UserViewSet

router = DefaultRouter()

router.register(r'users', UserViewSet, basename='user')
router.register(r'administrators', AdministratorViewSet, basename='administrator')
router.register(r'collaborators', CollaboratorViewSet, basename='collaborator')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
]