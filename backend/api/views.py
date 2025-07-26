# api/views
from django.http import Http404
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import DatabaseError, IntegrityError
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Service, Appointment, User
from .serializers import ServiceSerializer, EmployeeSerializer, ProfessionalSerializer, AppointmentSerializer, UserSerializer
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all().order_by('first_name')
        roles_param = self.request.query_params.get('role')
        if roles_param:
            roles_list = [r.strip().upper() for r in roles_param.split(',') if r.strip().upper() in User.Role.values]
            if roles_list:
                queryset = queryset.filter(role__in=roles_list)
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


class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProfessionalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role=User.Role.PROFESSIONAL).order_by('first_name')

    def perform_create(self, serializer):
        serializer.save(role=User.Role.PROFESSIONAL, is_staff=False)

    def destroy(self, request, *args, **kwargs):
        professional = self.get_object()

        if Appointment.objects.filter(
            employee=professional,
            start_time__gt=timezone.now(),
            status=Appointment.Status.RESERVED
        ).exists():
            return Response(
                {"error": "professional_has_future_appointments",
                 "message": "Não é possível remover profissional com agendamentos futuros"},
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
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return super().handle_exception(exc)


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
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['client_name', 'client_contact']
    filterset_fields = ['status', 'employee', 'service']

    def get_queryset(self):
        queryset = Appointment.objects.select_related('service', 'employee')
        
        # Filtro por status
        status = self.request.query_params.get('status')
        if status:
            if status not in dict(Appointment.Status.choices):
                raise ValidationError({'status': 'Status inválido'})
            queryset = queryset.filter(status=status)
        
        # Filtros para não-admins
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(employee=self.request.user) |
                Q(status=Appointment.Status.RESERVED)
            )
        
        return queryset.order_by('start_time')

    def handle_exception(self, exc):
        if isinstance(exc, ValidationError):
            return Response(
                {'status': 'error', 'message': exc.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().handle_exception(exc)

    def get_permissions(self):
        if self.action == 'create' and self.request.user.role == User.Role.PROFESSIONAL:
            self.permission_denied(self.request, message='Profissionais não podem criar agendamentos.')
        
        if self.action in ['create', 'list', 'retrieve', 'update', 'partial_update', 'cancel', 'complete']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        user = self.request.user
        queryset = Appointment.objects.select_related('service', 'employee')

        if not user.is_staff:
            if user.role == User.Role.PROFESSIONAL:
                # Profissionais veem apenas seus próprios agendamentos
                queryset = queryset.filter(employee=user)
            else:
                pass

        # Filtro por status
        status = self.request.query_params.get('status')
        if status:
            if status not in dict(Appointment.Status.choices):
                raise ValidationError({'status': 'Status inválido'})
            queryset = queryset.filter(status=status)
            
        return queryset.order_by('start_time')

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if not request.data:
            return Response(
                {'status': 'error', 'message': 'Nenhuma alteração detectada'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user.role == User.Role.PROFESSIONAL and instance.employee != request.user:
            return Response(
                {'status': 'error',
                    'message': 'Profissionais só podem editar seus próprios agendamentos.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if instance.status != Appointment.Status.RESERVED:
            return Response(
                {'status': 'error', 'message': f'Agendamento não pode ser alterado. O status atual é "{instance.get_status_display()}" e apenas agendamentos "Reservado" podem ser modificados.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = request.data.copy()
        if 'client_name' not in data:
            data['client_name'] = instance.client_name
        if 'client_contact' not in data:
            data['client_contact'] = instance.client_contact

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        appointment = self.get_object()

        try:
            if request.user.role == User.Role.PROFESSIONAL and appointment.employee != request.user:
                return Response(
                    {'status': 'error', 'message': 'Permissão negada. Profissionais só podem cancelar seus próprios agendamentos.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            appointment.cancel()

            return Response(
                {'status': 'success', 'message': 'Agendamento cancelado com sucesso.'},
                status=status.HTTP_200_OK
            )

        except ValidationError as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        try:
            appointment = self.get_object()  
            if request.user.role == User.Role.PROFESSIONAL and appointment.employee != request.user:
                return Response(
                    {'status': 'error', 'message': 'Permissão negada. Profissionais só podem concluir seus próprios agendamentos.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            appointment.complete()
            
            return Response(
                {'status': 'success', 'message': 'Agendamento concluído com sucesso.'},
                status=status.HTTP_200_OK
            )
                
        except Http404:
            return Response(
                {'status': 'error', 'message': 'Agendamento não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'status': 'error', 'message': 'Erro ao concluir agendamento'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)