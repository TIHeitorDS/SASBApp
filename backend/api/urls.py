from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, AdministratorViewSet, 
    EmployeeViewSet, ProfessionalViewSet, ServiceViewSet, 
    AppointmentViewSet,
    me
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'administrators', AdministratorViewSet, basename='administrator')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'professionals', ProfessionalViewSet, basename='professional')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', me, name='me'),
]