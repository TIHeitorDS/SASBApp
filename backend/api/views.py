from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Service, Appointment, User
from .serializers import ServiceSerializer, AdministratorSerializer, EmployeeSerializer, AppointmentSerializer, UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Usuários (Administradores e Funcionários).
    Permite filtrar por papel: /api/v1/users/?role=EMPLOYEE
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all().order_by('first_name')
        role = self.request.query_params.get('role')
        if role:
            if role.upper() in User.Role.values:
                queryset = queryset.filter(role=role.upper())
        return queryset


class AdministratorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Administradores.
    - Permite criar, listar, atualizar e excluir administradores.
    - Apenas usuários autenticados com permissão de administrador podem acessar.
    """
    serializer_class = AdministratorSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(role=User.Role.ADMIN).order_by('first_name')


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Funcionários.
    - Permite criar, listar, atualizar e excluir funcionários.
    - Apenas usuários autenticados com permissão de administrador podem acessar.
    """
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(role=User.Role.EMPLOYEE).order_by('first_name')

    def destroy(self, request, *args, **kwargs):
        employee = self.get_object()

        # Verifica se há agendamentos pendentes
        if Appointment.objects.filter(employee=employee, status='PENDENTE').exists():
            return Response(
                {"detail": "Não é possível remover funcionário com agendamentos pendentes."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().destroy(request, *args, **kwargs)


class ServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Serviços.
    - Usuários anônimos veem apenas serviços ativos.
    - Administradores veem todos os serviços.
    - Define automaticamente o 'created_by' ao criar um serviço.
    """
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Service.objects.all()
        return Service.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Agendamentos.
    - Apenas administradores podem ver todos e gerenciar.
    - Adiciona ações para 'cancelar' e 'concluir' agendamentos.
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Appointment.objects.select_related('service', 'employee')

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_appointment(self, request, pk=None):
        appointment = self.get_object()
        try:
            appointment.cancel()
            return Response({'status': 'Agendamento cancelado com sucesso.'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='complete')
    def complete_appointment(self, request, pk=None):
        appointment = self.get_object()
        try:
            appointment.complete()
            return Response({'status': 'Agendamento concluído com sucesso.'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
