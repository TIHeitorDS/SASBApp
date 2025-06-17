# admin.py

from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin
from django.core.exceptions import ValidationError
from .models import User, Administrator, Collaborator, Service, Appointment

# --- Admin para o modelo base User ---
# Este admin mostra TODOS os usuários e é útil para uma visão geral.
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informações Pessoais', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        # O campo 'role' é útil aqui para ver e talvez mudar o papel de um usuário.
        ('Permissões e Papel', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Datas Importantes', {'fields': ('last_login', 'date_joined')}),
    )

# --- Admin específico para o Proxy Model Administrator ---
@admin.register(Administrator)
class AdministratorAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'is_staff', 'is_superuser')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    
    def get_queryset(self, request):
        # A MÁGICA ACONTECE AQUI: Filtra para mostrar apenas usuários com o papel ADMIN.
        return super().get_queryset(request).filter(role=User.Role.ADMIN)

# --- Admin específico para o Proxy Model Collaborator ---
@admin.register(Collaborator)
class CollaboratorAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    
    def get_queryset(self, request):
        # Filtra para mostrar apenas usuários com o papel COLLABORATOR.
        return super().get_queryset(request).filter(role=User.Role.COLLABORATOR)

# --- Formulários e Admins para Service e Appointment (Seu código já estava ótimo) ---

class ServiceAdminForm(forms.ModelForm):
    class Meta:
        model = Service
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filtra para que apenas Admins possam ser selecionados como 'created_by'
        if 'created_by' in self.fields:
            self.fields['created_by'].queryset = User.objects.filter(role=User.Role.ADMIN)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    form = ServiceAdminForm
    list_display = ('name', 'duration', 'price', 'is_active', 'created_by')
    list_editable = ('is_active',)
    list_filter = ('is_active', 'created_by__username')
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
        # Filtra para que apenas Colaboradores possam ser selecionados para um agendamento
        self.fields['collaborator'].queryset = User.objects.filter(role=User.Role.COLLABORATOR, is_active=True)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    form = AppointmentAdminForm
    list_display = ('client_name', 'service', 'collaborator', 'start_time', 'status')
    list_filter = ('status', 'collaborator__username', 'service__name')
    search_fields = ('client_name', 'client_contact')
    readonly_fields = ('end_time', 'created_at', 'updated_at')
    ordering = ('-start_time',)
    actions = ['mark_as_completed', 'cancel_appointments']
    
    def mark_as_completed(self, request, queryset):
        for appointment in queryset:
            try:
                appointment.complete()
            except ValidationError as e:
                self.message_user(request, f"Erro no agendamento de '{appointment.client_name}': {e}", level='ERROR')
    mark_as_completed.short_description = "Marcar selecionados como Concluído"
    
    def cancel_appointments(self, request, queryset):
        for appointment in queryset:
            try:
                appointment.cancel()
            except ValidationError as e:
                self.message_user(request, f"Erro no agendamento de '{appointment.client_name}': {e}", level='ERROR')
    cancel_appointments.short_description = "Cancelar agendamentos selecionados"

