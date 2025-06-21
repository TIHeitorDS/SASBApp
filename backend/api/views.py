# views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Service, Appointment, User 
from .serializers import ServiceSerializer, AppointmentSerializer, UserSerializer 



class UserViewSet(viewsets.ModelViewSet):
    """
    NOVO: ViewSet para gerenciar Usuários (Administradores e Colaboradores).
    Substitui o antigo CollaboratorViewSet.
    Permite filtrar por papel: /api/v1/users/?role=COLLAB
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser] # Apenas Admins podem gerenciar usuários

    def get_queryset(self):
        """
        Filtra o queryset de usuários com base no parâmetro 'role' na URL.
        """
        queryset = User.objects.all().order_by('first_name')
        role = self.request.query_params.get('role')
        if role:
            if role.upper() in User.Role.values:
                queryset = queryset.filter(role=role.upper())
        return queryset


class ServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Serviços.
    - Usuários anônimos veem apenas serviços ativos.
    - Administradores veem todos os serviços.
    - Define automaticamente o 'created_by' ao criar um serviço.
    """
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Apenas usuários autenticados podem criar/editar

    def get_queryset(self):
        if self.request.user.is_staff:
            return Service.objects.all()
        return Service.objects.filter(is_active=True)

    def perform_create(self, serializer):
        """
        APRIMORADO: Associa automaticamente o usuário que criou o serviço.
        """
        serializer.save(created_by=self.request.user)


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Agendamentos.
    - Apenas administradores podem ver todos e gerenciar.
    - Adiciona ações para 'cancelar' e 'concluir' agendamentos.
    - Performance otimizada com select_related.
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAdminUser] # Apenas admins podem gerenciar agendamentos

    def get_queryset(self):
        """
        CORRIGIDO: Otimiza a busca com os relacionamentos corretos.
        'appointment_time' não existe mais.
        """
        return Appointment.objects.select_related('service', 'collaborator')

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_appointment(self, request, pk=None):
        """
        AÇÃO: Cancela um agendamento usando a lógica do modelo.
        """
        appointment = self.get_object()
        try:
            appointment.cancel()
            return Response({'status': 'Agendamento cancelado com sucesso.'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='complete')
    def complete_appointment(self, request, pk=None):
        """
        AÇÃO: Conclui um agendamento usando a lógica do modelo.
        """
        appointment = self.get_object()
        try:
            appointment.complete()
            return Response({'status': 'Agendamento concluído com sucesso.'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

