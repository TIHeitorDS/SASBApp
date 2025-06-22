#api/admin
from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin
from django.core.exceptions import ValidationError
from .models import User, Administrator, Employee, Service, Appointment
from django.utils.translation import gettext_lazy as _

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
        (_('Role'), {'fields': ('role',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'role'),
        }),
    )

class AdministratorAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'is_staff', 'is_superuser')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    
    def get_queryset(self, request):
        return User.objects.filter(role=User.Role.ADMIN)
    
    def save_model(self, request, obj, form, change):
        obj.role = User.Role.ADMIN
        obj.is_staff = True
        super().save_model(request, obj, form, change)

class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    
    def get_queryset(self, request):
        return User.objects.filter(role=User.Role.EMPLOYEE)
    
    def save_model(self, request, obj, form, change):
        obj.role = User.Role.EMPLOYEE
        obj.is_staff = False
        super().save_model(request, obj, form, change)

class ServiceAdminForm(forms.ModelForm):
    class Meta:
        model = Service
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'created_by' in self.fields:
            self.fields['created_by'].queryset = User.objects.filter(role=User.Role.ADMIN)

class ServiceAdmin(admin.ModelAdmin):
    form = ServiceAdminForm
    list_display = ('name', 'duration', 'price', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('name',)
    list_filter = ('is_active',)
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:  # Se for uma criação
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
        self.fields['employee'].queryset = User.objects.filter(role=User.Role.EMPLOYEE, is_active=True)
        self.fields['service'].queryset = Service.objects.filter(is_active=True)

class AppointmentAdmin(admin.ModelAdmin):
    form = AppointmentAdminForm
    list_display = ('client_name', 'service', 'employee', 'start_time', 'status')
    list_filter = ('status', 'employee', 'service')
    search_fields = ('client_name', 'client_contact')
    readonly_fields = ('end_time', 'created_at', 'updated_at')
    ordering = ('-start_time',)
    actions = ['mark_as_completed', 'cancel_appointments']
    
    def mark_as_completed(self, request, queryset):
        updated = 0
        for appointment in queryset:
            try:
                appointment.complete()
                updated += 1
            except ValidationError as e:
                self.message_user(request, 
                    f"Erro no agendamento {appointment.id}: {e}", 
                    level='ERROR')
        self.message_user(request, f"{updated} agendamentos marcados como concluídos.")
    mark_as_completed.short_description = _("Marcar como concluído")
    
    def cancel_appointments(self, request, queryset):
        updated = 0
        for appointment in queryset:
            try:
                appointment.cancel()
                updated += 1
            except ValidationError as e:
                self.message_user(request, 
                    f"Erro no agendamento {appointment.id}: {e}", 
                    level='ERROR')
        self.message_user(request, f"{updated} agendamentos cancelados.")
    cancel_appointments.short_description = _("Cancelar agendamentos")

admin.site.register(User, CustomUserAdmin)
admin.site.register(Administrator, AdministratorAdmin)
admin.site.register(Employee, EmployeeAdmin)
admin.site.register(Service, ServiceAdmin)
admin.site.register(Appointment, AppointmentAdmin)