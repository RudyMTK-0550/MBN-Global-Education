from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Club, ClubMember, Event, EventParticipant, Message


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'nom', 'prenom', 'role', 'campus', 'is_active')
    list_filter = ('role', 'campus', 'ecole', 'is_active')
    search_fields = ('email', 'nom', 'prenom')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations', {'fields': ('nom', 'prenom', 'ecole', 'formation', 'niveau', 'campus', 'role', 'photo_profil')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nom', 'prenom', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('nom', 'type', 'created_by', 'member_count', 'created_at')
    list_filter = ('type',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('titre', 'date_event', 'lieu', 'campus', 'created_by', 'participant_count')
    list_filter = ('campus', 'date_event')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'content', 'is_read', 'created_at')
    list_filter = ('is_read',)
