from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin
from django.core.exceptions import ValidationError
from .models import User, Administrator, Employee, Service, Appointment

# --- Admin para o modelo base User ---


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informações Pessoais', {
         'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Permissões e Papel', {
         'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Datas Importantes', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(Administrator)
class AdministratorAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name',
                    'is_staff', 'is_superuser')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

    def get_queryset(self, request):
        return super().get_queryset(request).filter(role=User.Role.ADMIN)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

    def get_queryset(self, request):
        return super().get_queryset(request).filter(role=User.Role.EMPLOYEE)


class ServiceAdminForm(forms.ModelForm):
    class Meta:
        model = Service
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'created_by' in self.fields:
            self.fields['created_by'].queryset = User.objects.filter(
                role=User.Role.ADMIN)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    form = ServiceAdminForm
    list_display = ('name', 'duration', 'price')
    search_fields = ('name',)

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class AppointmentAdminForm(forms.ModelForm):
    class Meta:
        model = Appointment
        fields = '__all__'
        widgets = {
            'start_time': forms.DateTimeInput(attrs={'type': 'datetime-local'}, format='%Y-%m-%dT%H:%M'),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['employee'].queryset = User.objects.filter(
            role=User.Role.EMPLOYEE, is_active=True)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    form = AppointmentAdminForm
    list_display = ('client_name', 'service',
                    'employee', 'start_time', 'status')
    list_filter = ('status', 'employee__username', 'service__name')
    search_fields = ('client_name', 'client_contact')
    readonly_fields = ('end_time', 'created_at', 'updated_at')
    ordering = ('-start_time',)
    actions = ['mark_as_completed', 'cancel_appointments']

    def mark_as_completed(self, request, queryset):
        for appointment in queryset:
            try:
                appointment.complete()
            except ValidationError as e:
                self.message_user(
                    request, f"Erro no agendamento de '{appointment.client_name}': {e}", level='ERROR')
    mark_as_completed.short_description = "Marcar selecionados como Concluído"

    def cancel_appointments(self, request, queryset):
        for appointment in queryset:
            try:
                appointment.cancel()
            except ValidationError as e:
                self.message_user(
                    request, f"Erro no agendamento de '{appointment.client_name}': {e}", level='ERROR')
    cancel_appointments.short_description = "Cancelar agendamentos selecionados"
