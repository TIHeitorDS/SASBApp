from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Service, Appointment
from django.utils import timezone
from datetime import timedelta
import decimal


class ServiceCreationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.service_url = reverse('service-list')

        # Criar admin
        self.admin = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com',
            role=User.Role.ADMIN
        )

        # Criar employee
        self.employee = User.objects.create_user(
            username='employee',
            password='employee123',
            email='employee@example.com',
            role=User.Role.EMPLOYEE
        )

        # Dados válidos para criação de serviço
        self.valid_service_data = {
            'name': 'Corte de Cabelo',
            'duration': 30,
            'price': '50.00',
            'is_active': True
        }

    def test_create_service_as_admin_success(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(self.service_url, self.valid_service_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Service.objects.count(), 1)
        service = Service.objects.first()
        self.assertEqual(service.name, self.valid_service_data['name'])
        self.assertEqual(service.duration, self.valid_service_data['duration'])
        self.assertEqual(service.price, decimal.Decimal(self.valid_service_data['price']))

    def test_create_service_unauthenticated_fails(self):
        response = self.client.post(self.service_url, self.valid_service_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Service.objects.count(), 0)

    def test_create_service_as_employee_fails(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.post(self.service_url, self.valid_service_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Service.objects.count(), 0)

    def test_create_service_with_empty_name_fails(self):
        self.client.force_authenticate(user=self.admin)
        invalid_data = self.valid_service_data.copy()
        invalid_data['name'] = ''
        response = self.client.post(self.service_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)
        self.assertEqual(Service.objects.count(), 0)

    def test_create_service_with_whitespace_name_fails(self):
        self.client.force_authenticate(user=self.admin)
        invalid_data = self.valid_service_data.copy()
        invalid_data['name'] = '   '
        response = self.client.post(self.service_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)
        self.assertEqual(Service.objects.count(), 0)

    def test_create_service_with_duplicate_name_fails(self):
        self.client.force_authenticate(user=self.admin)
        # Criar primeiro serviço
        Service.objects.create(
            name=self.valid_service_data['name'],
            duration=30,
            price=50.00
        )
        # Tentar criar serviço com mesmo nome
        response = self.client.post(self.service_url, self.valid_service_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)
        self.assertEqual(Service.objects.count(), 1)

    def test_create_service_with_min_duration_success(self):
        self.client.force_authenticate(user=self.admin)
        min_duration_data = self.valid_service_data.copy()
        min_duration_data['duration'] = 1
        response = self.client.post(self.service_url, min_duration_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Service.objects.first().duration, 1)

    def test_create_service_with_max_duration_success(self):
        self.client.force_authenticate(user=self.admin)
        max_duration_data = self.valid_service_data.copy()
        max_duration_data['duration'] = 480
        response = self.client.post(self.service_url, max_duration_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Service.objects.first().duration, 480)

    def test_create_service_with_duration_below_min_fails(self):
        self.client.force_authenticate(user=self.admin)
        invalid_data = self.valid_service_data.copy()
        invalid_data['duration'] = 0
        response = self.client.post(self.service_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('duration', response.data)
        self.assertEqual(Service.objects.count(), 0)

    def test_create_service_with_duration_above_max_fails(self):
        self.client.force_authenticate(user=self.admin)
        invalid_data = self.valid_service_data.copy()
        invalid_data['duration'] = 481
        response = self.client.post(self.service_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('duration', response.data)
        self.assertEqual(Service.objects.count(), 0)

    def test_create_service_with_min_price_success(self):
        self.client.force_authenticate(user=self.admin)
        min_price_data = self.valid_service_data.copy()
        min_price_data['price'] = '0.01'
        response = self.client.post(self.service_url, min_price_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Service.objects.first().price, decimal.Decimal('0.01'))

    def test_create_service_with_max_price_success(self):
        self.client.force_authenticate(user=self.admin)
        max_price_data = self.valid_service_data.copy()
        max_price_data['price'] = '10000.00'
        response = self.client.post(self.service_url, max_price_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Service.objects.first().price, decimal.Decimal('10000.00'))

    def test_create_service_with_price_zero_fails(self):
        self.client.force_authenticate(user=self.admin)
        invalid_data = self.valid_service_data.copy()
        invalid_data['price'] = '0.00'
        response = self.client.post(self.service_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)
        self.assertEqual(Service.objects.count(), 0)

    def test_create_service_with_price_above_max_fails(self):
        self.client.force_authenticate(user=self.admin)
        invalid_data = self.valid_service_data.copy()
        invalid_data['price'] = '10000.01'
        response = self.client.post(self.service_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)
        self.assertEqual(Service.objects.count(), 0)

    def test_create_service_with_invalid_decimal_places_fails(self):
        self.client.force_authenticate(user=self.admin)
        invalid_data = self.valid_service_data.copy()
        invalid_data['price'] = '50.123'
        response = self.client.post(self.service_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)
        self.assertEqual(Service.objects.count(), 0)

    def test_service_appears_in_list_immediately_after_creation(self):
        self.client.force_authenticate(user=self.admin)
        create_response = self.client.post(self.service_url, self.valid_service_data)
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        
        list_response = self.client.get(self.service_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['name'], self.valid_service_data['name'])


class ServiceListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
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
        
        # Criar serviços para teste
        Service.objects.create(
            name="Corte de Cabelo",
            duration=30,
            price=50.00,
            is_active=True
        )
        Service.objects.create(
            name="Barba",
            duration=20,
            price=30.00,
            is_active=True
        )
        Service.objects.create(
            name="Hidratação",
            duration=60,
            price=80.00,
            is_active=False
        )
        
        self.url = reverse('service-list')

    def test_employee_can_list_active_services(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Apenas os ativos
        names = [s['name'] for s in response.data]
        self.assertIn("Corte de Cabelo", names)
        self.assertIn("Barba", names)
        self.assertNotIn("Hidratação", names)

    def test_admin_can_see_all_services(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {'show_all': 'true'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # Todos os serviços

    def test_filter_services_by_name_case_insensitive(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.url, {'search': 'corTe'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Corte de Cabelo")

    def test_filter_services_no_results(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.url, {'search': 'inexistente'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_unauthenticated_access_fails(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ServiceUpdateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com',
            role=User.Role.ADMIN
        )
        self.employee = User.objects.create_user(
            username='employee',
            password='employee123',
            role=User.Role.EMPLOYEE
        )
        
        self.service = Service.objects.create(
            name="Serviço Teste",
            duration=30,
            price=50.00
        )
        self.url = reverse('service-detail', args=[self.service.id])

    def test_admin_can_update_service(self):
        self.client.force_authenticate(user=self.admin)
        updated_data = {"name": "Novo Nome", "price": "60.00"}
        response = self.client.patch(self.url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.service.refresh_from_db()
        self.assertEqual(self.service.name, "Novo Nome")
        self.assertEqual(self.service.price, decimal.Decimal('60.00'))

    def test_employee_cannot_update_service(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.patch(self.url, {"name": "Tentativa"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_with_empty_name_fails(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(self.url, {"name": ""})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)

    def test_update_with_duplicate_name_fails(self):
        self.client.force_authenticate(user=self.admin)
        # Criar outro serviço com nome diferente
        Service.objects.create(name="Outro Serviço", duration=20, price=40.00)
        # Tentar atualizar para nome duplicado
        response = self.client.patch(self.url, {"name": "Outro Serviço"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)

    def test_update_with_invalid_duration_fails(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(self.url, {"duration": 500})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('duration', response.data)

    def test_update_with_invalid_price_fails(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(self.url, {"price": "-10.00"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)

    def test_unauthenticated_access_fails(self):
        response = self.client.patch(self.url, {"name": "Tentativa"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ServiceDeletionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com',
            role=User.Role.ADMIN
        )
        self.employee = User.objects.create_user(
            username='employee',
            password='employee123',
            role=User.Role.EMPLOYEE
        )

        # Serviço sem agendamentos
        self.free_service = Service.objects.create(
            name="Serviço Livre",
            duration=30,
            price=50.00
        )

        # Serviço com agendamento futuro
        self.busy_service = Service.objects.create(
            name="Serviço Ocupado",
            duration=60,
            price=100.00
        )

        Appointment.objects.create(
            service=self.busy_service,
            employee=self.employee,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, minutes=60),
            client_name="Cliente Teste",
            client_contact="12345",
            status=Appointment.Status.RESERVED
        )

    def test_admin_can_delete_service_without_appointments(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('service-detail', args=[self.free_service.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(id=self.free_service.id).exists())

    def test_cannot_delete_service_with_future_appointments(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('service-detail', args=[self.busy_service.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(Service.objects.filter(id=self.busy_service.id).exists())
        self.assertIn('message', response.data)
        self.assertIn('agendamentos futuros', response.data['message'].lower())

    def test_employee_cannot_delete_service(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('service-detail', args=[self.free_service.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_access_fails(self):
        url = reverse('service-detail', args=[self.free_service.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_nonexistent_service_fails(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('service-detail', args=[999])  # ID inexistente
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)