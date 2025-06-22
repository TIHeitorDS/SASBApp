# api/views
from django.http import Http404
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import DatabaseError, IntegrityError
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Service, Appointment, User
from .serializers import ServiceSerializer, EmployeeSerializer, AppointmentSerializer, UserSerializer
from django.db.models import Q  


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all().order_by('first_name')
        role = self.request.query_params.get('role')
        if role and role.upper() in User.Role.values:
            queryset = queryset.filter(role=role.upper())
        return queryset

    def perform_create(self, serializer):
        """Garante que a senha seja tratada corretamente na criação"""
        user = serializer.save()
        if 'password' in serializer.validated_data:
            user.set_password(serializer.validated_data['password'])
            user.save()


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

        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:  
            return Response(
                {"error": "database_error",
                "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def handle_exception(self, exc):
        if isinstance(exc, (DatabaseError, IntegrityError)):
            return Response(
                {"error": "database_error",
                 "message": "Erro no banco de dados"},
                status = status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return super().handle_exception(exc)


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class= ServiceSerializer
    permission_classes= [permissions.IsAuthenticated]
    filter_backends= [filters.SearchFilter]
    search_fields= ['^name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset= Service.objects.all()

        search_param= self.request.query_params.get('search', None)
        if search_param:
            queryset= queryset.filter(name__icontains=search_param)

        if not self.request.user.is_staff:
            queryset= queryset.filter(is_active=True)

        return queryset

    def destroy(self, request, *args, **kwargs):
        service= self.get_object()

        if service.appointments.filter(
            start_time__gt = timezone.now(),
            status = Appointment.Status.RESERVED
        ).exists():
            return Response(
                {"error": "service_has_future_appointments",
                 "message": "Não é possível excluir serviço com agendamentos futuros"},
                status = status.HTTP_400_BAD_REQUEST
            )

        return super().destroy(request, *args, **kwargs)


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve', 'update', 'partial_update', 'cancel', 'complete']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = Appointment.objects.select_related('service', 'employee')
        
        # Filtros para não-admins
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(employee=self.request.user) |
                Q(status=Appointment.Status.RESERVED)
            )
        return queryset

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if not request.data:
            return Response(
                {'status': 'error', 'message': 'Nenhuma alteração detectada'},
                status=status.HTTP_400_BAD_REQUEST
            )
    

        # Verifica se o usuário tem permissão para editar
        if not request.user.is_staff and instance.employee != request.user:
            return Response(
                {'status': 'error', 'message': 'Você não tem permissão para editar este agendamento.'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Verifica se o agendamento pode ser alterado
        if instance.status != Appointment.Status.RESERVED:
            return Response(
                {'status': 'error', 'message': 'Agendamento não pode ser alterado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Mantém os valores originais para campos não fornecidos
        data = request.data.copy()
        if 'client_name' not in data:
            data['client_name'] = instance.client_name
        if 'client_contact' not in data:
            data['client_contact'] = instance.client_contact
            
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

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