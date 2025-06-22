#api/views
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Service, Appointment, User
from .serializers import ServiceSerializer, EmployeeSerializer, AppointmentSerializer, UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all().order_by('first_name')
        role = self.request.query_params.get('role')
        if role and role.upper() in User.Role.values:
            queryset = queryset.filter(role=role.upper())
        return queryset

class AdministratorViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(role=User.Role.ADMIN).order_by('first_name')

    def perform_create(self, serializer):
        serializer.save(role=User.Role.ADMIN, is_staff=True)

class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(role=User.Role.EMPLOYEE).order_by('first_name')

    def perform_create(self, serializer):
        serializer.save(role=User.Role.EMPLOYEE, is_staff=False)

    def destroy(self, request, *args, **kwargs):
        employee = self.get_object()
        
        if Appointment.objects.filter(
            employee=employee,
            start_time__gt=timezone.now(),
            status=Appointment.Status.RESERVED  
        ).exists():
            return Response(
                {"error": "employee_has_future_appointments", 
                "message": "Não é possível remover funcionário com agendamentos futuros"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        return super().destroy(request, *args, **kwargs)

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter] 
    search_fields = ['^name']  

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Service.objects.all()
        
        search_param = self.request.query_params.get('search', None)
        if search_param:
            queryset = queryset.filter(name__icontains=search_param)
        
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
            
        return queryset

    def destroy(self, request, *args, **kwargs):
        service = self.get_object()
        
        if service.appointments.filter(
            start_time__gt=timezone.now(),
            status=Appointment.Status.RESERVED
        ).exists():
            return Response(
                {"error": "service_has_future_appointments",
                "message": "Não é possível excluir serviço com agendamentos futuros"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        return super().destroy(request, *args, **kwargs)

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Appointment.objects.select_related('service', 'employee')

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        try:
            appointment.cancel()
            return Response({'status': 'success', 'message': 'Agendamento cancelado com sucesso'})
        except ValidationError as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        appointment = self.get_object()
        try:
            appointment.complete()
            return Response({'status': 'success', 'message': 'Agendamento concluído com sucesso'})
        except ValidationError as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)