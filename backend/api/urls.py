# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
# ALTERADO: Trocamos CollaboratorViewSet pelo novo UserViewSet
from .views import ServiceViewSet, AppointmentViewSet, UserViewSet

router = DefaultRouter()

# ALTERADO: Registramos o UserViewSet no endpoint 'users' em vez de 'collaborators'
router.register(r'users', UserViewSet, basename='user')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
]