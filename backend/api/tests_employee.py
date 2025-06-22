""" from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Appointment, Service
from django.utils import timezone
from datetime import timedelta
import json
from django.db import DatabaseError
from unittest.mock import patch


class EmployeeRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com',
            role=User.Role.ADMIN
        )
        self.existing_employee = User.objects.create_user(
            username='existing',
            password='employee123',
            email='existing@example.com',
            role=User.Role.EMPLOYEE
        )
        self.url = reverse('employee-list')
        self.valid_data = {
            'username': 'newemployee',
            'first_name': 'Maria',
            'last_name': 'Santos',
            'email': 'maria.santos@example.com',
            'password': 'senha123'
        }

    def test_successful_employee_registration_by_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_employee = User.objects.get(email=self.valid_data['email'])
        self.assertEqual(new_employee.role, User.Role.EMPLOYEE)
        self.assertFalse(new_employee.is_staff)

    def test_registration_without_authentication(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_registration_as_non_admin(self):
        self.client.force_authenticate(user=self.existing_employee)
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_duplicate_email_registration(self):
        self.client.force_authenticate(user=self.admin)
        duplicate_data = self.valid_data.copy()
        duplicate_data['email'] = self.existing_employee.email

        response = self.client.post(
            self.url,
            data=json.dumps(duplicate_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertEqual(response.data['email'][0].code, 'unique')

    def test_missing_name(self):
        self.client.force_authenticate(user=self.admin)
        data = self.valid_data.copy()
        data['first_name'] = ''
        data['last_name'] = ''

        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('first_name', response.data)
        self.assertEqual(response.data['first_name'][0].code, 'blank')

    def test_short_password(self):
        self.client.force_authenticate(user=self.admin)
        data = self.valid_data.copy()
        data['password'] = '123'

        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
        self.assertIn('pelo menos 6 caracteres',
                      str(response.data['password']))


class EmployeeDeletionTests(TestCase):
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
        self.service = Service.objects.create(
            name="Corte de Cabelo",
            duration=30,
            price=50.00
        )

    def test_successful_employee_deletion(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('employee-detail', args=[self.employee.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.employee.id).exists())

    def test_deletion_without_authentication(self):
        url = reverse('employee-detail', args=[self.employee.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_deletion_as_non_admin(self):
        other_employee = User.objects.create_user(
            username='other',
            password='employee123',
            email='other@example.com',
            role=User.Role.EMPLOYEE
        )
        self.client.force_authenticate(user=other_employee)
        url = reverse('employee-detail', args=[self.employee.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_deletion_of_nonexistent_employee(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('employee-detail', args=[999])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
 """