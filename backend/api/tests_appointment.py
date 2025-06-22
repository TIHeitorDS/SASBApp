from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Service, Appointment
from django.utils import timezone
from datetime import timedelta, datetime
import decimal


class AppointmentCreationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.appointment_url = reverse('appointment-list')

        self.admin = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com',
            role=User.Role.ADMIN
        )

        self.employee = User.objects.create_user(
            username='employee',
            password='employee123',
            email='employee@example.com',
            role=User.Role.EMPLOYEE
        )

        self.employee2 = User.objects.create_user(
            username='employee2',
            password='employee123',
            email='employee2@example.com',
            role=User.Role.EMPLOYEE
        )

        self.active_service = Service.objects.create(
            name='Corte de Cabelo',
            duration=30,
            price=50.00,
            is_active=True
        )

        self.inactive_service = Service.objects.create(
            name='Hidratação',
            duration=60,
            price=80.00,
            is_active=False
        )

        self.valid_appointment_data = {
            'client_name': 'Cliente Teste',
            'client_contact': '11999999999',
            'service_id': self.active_service.id,
            'employee_id': self.employee.id,
            'start_time': (timezone.now() + timedelta(days=1)).isoformat(),
            'notes': 'Observações do teste'
        }

    def test_create_appointment_as_employee_success(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.post(
            self.appointment_url, self.valid_appointment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 1)
        appointment = Appointment.objects.first()
        self.assertEqual(appointment.client_name,
                         self.valid_appointment_data['client_name'])
        self.assertEqual(appointment.status, Appointment.Status.RESERVED)

    def test_create_appointment_unauthenticated_fails(self):
        response = self.client.post(
            self.appointment_url, self.valid_appointment_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Appointment.objects.count(), 0)

    def test_create_appointment_with_missing_required_fields_fails(self):
        self.client.force_authenticate(user=self.employee)
        required_fields = ['client_name', 'client_contact',
                           'service_id', 'employee_id', 'start_time']

        for field in required_fields:
            invalid_data = self.valid_appointment_data.copy()
            invalid_data.pop(field)
            response = self.client.post(self.appointment_url, invalid_data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn(field, response.data)
            self.assertEqual(Appointment.objects.count(), 0)

    def test_create_appointment_with_empty_required_fields_fails(self):
        self.client.force_authenticate(user=self.employee)
        required_fields = ['client_name', 'client_contact']

        for field in required_fields:
            invalid_data = self.valid_appointment_data.copy()
            invalid_data[field] = ''
            response = self.client.post(self.appointment_url, invalid_data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn(field, response.data)
            self.assertEqual(Appointment.objects.count(), 0)

    def test_create_appointment_with_inactive_service_fails(self):
        self.client.force_authenticate(user=self.employee)
        invalid_data = self.valid_appointment_data.copy()
        invalid_data['service_id'] = self.inactive_service.id
        response = self.client.post(self.appointment_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('service_id', response.data)
        self.assertEqual(Appointment.objects.count(), 0)

    def test_create_appointment_with_inactive_employee_fails(self):
        self.client.force_authenticate(user=self.employee)
        self.employee.is_active = False
        self.employee.save()

        response = self.client.post(
            self.appointment_url, self.valid_appointment_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('employee_id', response.data)
        self.assertEqual(Appointment.objects.count(), 0)

    def test_create_appointment_with_past_date_fails(self):
        self.client.force_authenticate(user=self.employee)
        invalid_data = self.valid_appointment_data.copy()
        invalid_data['start_time'] = (
            timezone.now() - timedelta(days=1)).isoformat()
        response = self.client.post(self.appointment_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('start_time', response.data)
        self.assertEqual(Appointment.objects.count(), 0)

    def test_create_appointment_with_conflicting_time_fails(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.post(
            self.appointment_url, self.valid_appointment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        conflicting_data = self.valid_appointment_data.copy()
        start_time_obj = datetime.fromisoformat(
            self.valid_appointment_data['start_time'])
        conflicting_time = start_time_obj + timedelta(minutes=15)
        conflicting_data['start_time'] = conflicting_time.isoformat()

        response = self.client.post(self.appointment_url, conflicting_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('start_time', response.data)
        self.assertEqual(Appointment.objects.count(), 1)

    def test_create_appointment_with_different_employee_same_time_success(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.post(
            self.appointment_url, self.valid_appointment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        different_employee_data = self.valid_appointment_data.copy()
        different_employee_data['employee_id'] = self.employee2.id
        response = self.client.post(
            self.appointment_url, different_employee_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 2)

    def test_appointment_end_time_calculated_correctly(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.post(
            self.appointment_url, self.valid_appointment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        appointment = Appointment.objects.first()
        start_time_obj = datetime.fromisoformat(
            self.valid_appointment_data['start_time'])
        expected_end_time = start_time_obj + \
            timedelta(minutes=self.active_service.duration)
        self.assertEqual(appointment.end_time, expected_end_time)


class AppointmentUpdateTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.employee = User.objects.create_user(
            username='employee',
            password='employee123',
            email='employee@example.com',
            role=User.Role.EMPLOYEE
        )
        self.client.force_authenticate(user=self.employee)

        self.employee2 = User.objects.create_user(
            username='employee2',
            password='employee123',
            email='employee2@example.com',
            role=User.Role.EMPLOYEE
        )

        self.service1 = Service.objects.create(
            name='Corte de Cabelo',
            duration=30,
            price=50.00,
            is_active=True
        )

        self.service2 = Service.objects.create(
            name='Barba',
            duration=20,
            price=30.00,
            is_active=True
        )

        now = timezone.now()

        self.reserved_appointment = Appointment.objects.create(
            service=self.service1,
            employee=self.employee,
            start_time=now + timedelta(days=1),
            end_time=now + timedelta(days=1, minutes=30),
            client_name='Cliente Original',
            client_contact='11999999999',
            status=Appointment.Status.RESERVED
        )

        self.cancelled_appointment = Appointment.objects.create(
            service=self.service1,
            employee=self.employee,
            start_time=now + timedelta(days=2),
            end_time=now + timedelta(days=2, minutes=30),
            client_name='Cliente Cancelado',
            client_contact='11888888888',
            status=Appointment.Status.CANCELLED
        )

        self.completed_appointment = Appointment.objects.create(
            service=self.service1,
            employee=self.employee,
            start_time=now - timedelta(days=1),
            end_time=now - timedelta(days=1, minutes=30),
            client_name='Cliente Concluído',
            client_contact='11777777777',
            status=Appointment.Status.COMPLETED
        )

        self.url = reverse('appointment-detail',
                           args=[self.reserved_appointment.id])

    def test_update_reserved_appointment_success(self):
        self.client.force_authenticate(user=self.employee)
        updated_data = {
            'client_name': 'Novo Nome',
            'client_contact': '11988888888',
            'service_id': self.service2.id,
            'employee_id': self.employee2.id,
            'start_time': (timezone.now() + timedelta(days=3)).isoformat()
        }
        response = self.client.patch(self.url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.reserved_appointment.refresh_from_db()
        self.assertEqual(
            self.reserved_appointment.client_name, 'Novo Nome')
        self.assertEqual(self.reserved_appointment.service, self.service2)
        self.assertEqual(
            self.reserved_appointment.employee, self.employee2)
        self.assertEqual(self.reserved_appointment.status,
                         Appointment.Status.RESERVED)

    def test_update_with_no_changes_fails(self):
        response = self.client.patch(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Nenhuma alteração detectada', response.data['message'])

    def test_update_cancelled_appointment_fails(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('appointment-detail',
                      args=[self.cancelled_appointment.id])
        response = self.client.patch(url, {'client_name': 'Tentativa'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)
        self.assertIn('não pode ser alterado', response.data['message'])

    def test_update_completed_appointment_fails(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('appointment-detail',
                      args=[self.completed_appointment.id])
        response = self.client.patch(url, {'client_name': 'Tentativa'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)
        self.assertIn('não pode ser alterado', response.data['message'])

    def test_update_with_inactive_service_fails(self):
        self.client.force_authenticate(user=self.employee)
        self.service2.is_active = False
        self.service2.save()

        updated_data = {'service_id': self.service2.id}
        response = self.client.patch(self.url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('service_id', response.data)

    def test_update_with_inactive_employee_fails(self):
        self.client.force_authenticate(user=self.employee)
        self.employee2.is_active = False
        self.employee2.save()

        updated_data = {'employee_id': self.employee2.id}
        response = self.client.patch(self.url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('employee_id', response.data)

    def test_update_with_conflicting_time_fails(self):
        conflicting_appointment = Appointment.objects.create(
            service=self.service1,
            employee=self.employee,
            start_time=timezone.now() + timedelta(days=3),
            end_time=timezone.now() + timedelta(days=3, minutes=30),
            client_name='Conflito',
            client_contact='11666666666',
            status=Appointment.Status.RESERVED
        )

        updated_data = {
            'client_name': self.reserved_appointment.client_name,
            'client_contact': self.reserved_appointment.client_contact,
            'service_id': self.service1.id,
            'employee_id': self.employee.id,
            'start_time': (timezone.now() + timedelta(days=3)).isoformat()
        }
        response = self.client.patch(self.url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('start_time', response.data)

    def test_update_with_past_date_fails(self):
        updated_data = {
            'client_name': self.reserved_appointment.client_name,
            'client_contact': self.reserved_appointment.client_contact,
            'service_id': self.service1.id,
            'employee_id': self.employee.id,
            'start_time': (timezone.now() - timedelta(days=1)).isoformat()
        }
        response = self.client.patch(self.url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('start_time', response.data)

    def test_unauthenticated_access_fails(self):
        self.client.logout()  # Garante que não há usuário autenticado
        response = self.client.patch(self.url, {'client_name': 'Tentativa'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class AppointmentCancellationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Criar employee
        self.employee = User.objects.create_user(
            username='employee',
            password='employee123',
            email='employee@example.com',
            role=User.Role.EMPLOYEE
        )

        # Criar serviço
        self.service = Service.objects.create(
            name='Corte de Cabelo',
            duration=30,
            price=50.00,
            is_active=True
        )

        now = timezone.now()

        # Criar agendamento reservado futuro
        self.future_reserved = Appointment(
            service=self.service,
            employee=self.employee,
            start_time=now + timedelta(days=1),
            end_time=now + timedelta(days=1, minutes=30),
            client_name='Cliente Futuro',
            client_contact='11999999999',
            status=Appointment.Status.RESERVED
        )
        self.future_reserved.save()  # Salva com validação (data futura é válida)

        # Criar agendamento reservado passado (usando skip_validation)
        self.past_reserved = Appointment(
            service=self.service,
            employee=self.employee,
            start_time=now - timedelta(days=1),
            end_time=now - timedelta(days=1, minutes=30),
            client_name='Cliente Passado',
            client_contact='11888888888',
            status=Appointment.Status.RESERVED
        )
        # Pula validação para data passada
        self.past_reserved.save(skip_validation=True)

        # Criar agendamento cancelado
        self.cancelled = Appointment(
            service=self.service,
            employee=self.employee,
            start_time=now + timedelta(days=2),
            end_time=now + timedelta(days=2, minutes=30),
            client_name='Cliente Cancelado',
            client_contact='11777777777',
            status=Appointment.Status.CANCELLED
        )
        self.cancelled.save(skip_validation=True)

        # Criar agendamento concluído
        self.completed = Appointment(
            service=self.service,
            employee=self.employee,
            start_time=now - timedelta(days=2),
            end_time=now - timedelta(days=2, minutes=30),
            client_name='Cliente Concluído',
            client_contact='11666666666',
            status=Appointment.Status.COMPLETED
        )
        self.completed.save(skip_validation=True)

    def test_cancel_future_reserved_appointment_success(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('appointment-cancel', args=[self.future_reserved.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.future_reserved.refresh_from_db()
        self.assertEqual(self.future_reserved.status,
                         Appointment.Status.CANCELLED)
        self.assertIn('success', response.data['status'])
        self.assertIn('cancelado', response.data['message'])

    def test_cancel_past_reserved_appointment_fails(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('appointment-cancel', args=[self.past_reserved.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.past_reserved.refresh_from_db()
        self.assertEqual(self.past_reserved.status,
                         Appointment.Status.RESERVED)
        self.assertIn('error', response.data['status'])
        # A mensagem exata pode variar, mas deve indicar o erro
        self.assertIn('passados', response.data['message'])

    def test_cancel_already_cancelled_appointment_fails(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('appointment-cancel', args=[self.cancelled.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data['status'])
        self.assertIn('cancelar', response.data['message'])

    def test_cancel_completed_appointment_fails(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('appointment-cancel', args=[self.completed.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data['status'])
        self.assertIn('cancelar', response.data['message'])

    def test_cancel_nonexistent_appointment_fails(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('appointment-cancel', args=[999])  # ID inexistente
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_access_fails(self):
        url = reverse('appointment-cancel', args=[self.future_reserved.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class AppointmentCompletionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Criar employee
        self.employee = User.objects.create_user(
            username='employee',
            password='employee123',
            email='employee@example.com',
            role=User.Role.EMPLOYEE
        )

        # Criar serviço
        self.service = Service.objects.create(
            name='Corte de Cabelo',
            duration=30,
            price=50.00,
            is_active=True
        )

        now = timezone.now()

        self.past_reserved = Appointment(
            service=self.service,
            employee=self.employee,
            start_time=now - timedelta(hours=1),
            end_time=now - timedelta(minutes=30),
            client_name='Cliente Passado',
            client_contact='11999999999',
            status=Appointment.Status.RESERVED
        )
        self.past_reserved.save(skip_validation=True)

        self.future_reserved = Appointment(
            service=self.service,
            employee=self.employee,
            start_time=now + timedelta(days=1),
            end_time=now + timedelta(days=1, minutes=30),
            client_name='Cliente Futuro',
            client_contact='11888888888',
            status=Appointment.Status.RESERVED
        )
        self.future_reserved.save()

        self.cancelled = Appointment(
            service=self.service,
            employee=self.employee,
            start_time=now - timedelta(days=1),
            end_time=now - timedelta(days=1, minutes=30),
            client_name='Cliente Cancelado',
            client_contact='11777777777',
            status=Appointment.Status.CANCELLED
        )
        self.cancelled.save(skip_validation=True)

        self.completed = Appointment(
            service=self.service,
            employee=self.employee,
            start_time=now - timedelta(days=2),
            end_time=now - timedelta(days=2, minutes=30),
            client_name='Cliente Concluído',
            client_contact='11666666666',
            status=Appointment.Status.COMPLETED
        )
        self.completed.save(skip_validation=True)

        # Autenticar o usuário
        self.client.force_authenticate(user=self.employee)

    def test_complete_past_reserved_appointment_success(self):
        url = reverse('appointment-complete', args=[self.past_reserved.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.past_reserved.refresh_from_db()
        self.assertEqual(self.past_reserved.status,
                         Appointment.Status.COMPLETED)

    def test_complete_future_reserved_appointment_fails(self):
        url = reverse('appointment-complete', args=[self.future_reserved.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.future_reserved.refresh_from_db()
        self.assertEqual(self.future_reserved.status,
                         Appointment.Status.RESERVED)

    def test_complete_cancelled_appointment_fails(self):
        url = reverse('appointment-complete', args=[self.cancelled.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.cancelled.refresh_from_db()
        self.assertEqual(self.cancelled.status, Appointment.Status.CANCELLED)

    def test_complete_already_completed_appointment_fails(self):
        url = reverse('appointment-complete', args=[self.completed.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.completed.refresh_from_db()
        self.assertEqual(self.completed.status, Appointment.Status.COMPLETED)

    def test_complete_nonexistent_appointment_fails(self):
        url = reverse('appointment-complete', args=[999])  # ID inexistente
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_access_fails(self):
        self.client.logout()
        url = reverse('appointment-complete', args=[self.past_reserved.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class AppointmentListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        self.employee = User.objects.create_user(
            username='employee',
            password='employee123',
            email='employee@example.com',
            role=User.Role.EMPLOYEE
        )
        
        self.admin = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com',
            role=User.Role.ADMIN
        )
        
        self.service = Service.objects.create(
            name='Corte de Cabelo',
            duration=30,
            price=50.00,
            is_active=True
        )
        
        now = timezone.now()
        
        self.reserved_appointment = Appointment.objects.create(
            service=self.service,
            employee=self.employee,
            start_time=now + timedelta(days=1),
            end_time=now + timedelta(days=1, minutes=30),
            client_name='Cliente Reservado',
            client_contact='11999999999',
            status=Appointment.Status.RESERVED
        )
        
        self.cancelled_appointment = Appointment.objects.create(
            service=self.service,
            employee=self.employee,
            start_time=now + timedelta(days=2),
            end_time=now + timedelta(days=2, minutes=30),
            client_name='Cliente Cancelado',
            client_contact='11888888888',
            status=Appointment.Status.CANCELLED
        )
        
        self.completed_appointment = Appointment.objects.create(
            service=self.service,
            employee=self.employee,
            start_time=now - timedelta(days=1),
            end_time=now - timedelta(days=1, minutes=30),
            client_name='Cliente Concluído',
            client_contact='11777777777',
            status=Appointment.Status.COMPLETED
        )
        
        self.url = reverse('appointment-list')

    def test_list_appointments_as_employee_success(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_filter_appointments_by_status_reserved(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {'status': 'reserved'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'reserved')
        self.assertEqual(response.data[0]['id'], self.reserved_appointment.id)

    def test_filter_appointments_by_status_cancelled(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {'status': 'cancelled'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'cancelled')
        self.assertEqual(response.data[0]['id'], self.cancelled_appointment.id)

    def test_filter_appointments_by_status_completed(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {'status': 'completed'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'completed')
        self.assertEqual(response.data[0]['id'], self.completed_appointment.id)

    def test_filter_appointments_by_invalid_status(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {'status': 'invalid'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)

    def test_list_appointments_with_client_details(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('client_name', response.data[0])
        self.assertIn('client_contact', response.data[0])

    def test_list_appointments_with_service_details(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('service', response.data[0])
        self.assertEqual(response.data[0]['service']['id'], self.service.id)

    def test_list_appointments_with_employee_details(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('employee', response.data[0])
        self.assertEqual(response.data[0]['employee']['id'], self.employee.id)

    def test_unauthenticated_access_fails(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)