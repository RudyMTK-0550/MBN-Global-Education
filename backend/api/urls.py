from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Health
    path('health/', views.health_check, name='health'),

    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/me/', views.MeView.as_view(), name='me'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Users
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/search/', views.UserSearchView.as_view(), name='user-search'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/update/', views.UserUpdateView.as_view(), name='user-update'),
    path('users/upload-photo/', views.UploadPhotoView.as_view(), name='upload-photo'),

    # Clubs
    path('clubs/', views.ClubListView.as_view(), name='club-list'),
    path('clubs/create/', views.ClubCreateView.as_view(), name='club-create'),
    path('clubs/user/my-clubs/', views.my_clubs, name='my-clubs'),
    path('clubs/<int:pk>/', views.ClubDetailView.as_view(), name='club-detail'),
    path('clubs/<int:pk>/join/', views.join_club, name='club-join'),
    path('clubs/<int:pk>/leave/', views.leave_club, name='club-leave'),
    path('clubs/<int:pk>/members/', views.club_members, name='club-members'),

    # Events
    path('events/', views.EventListView.as_view(), name='event-list'),
    path('events/create/', views.EventCreateView.as_view(), name='event-create'),
    path('events/user/my-events/', views.my_events, name='my-events'),
    path('events/<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    path('events/<int:pk>/participate/', views.participate_event, name='event-participate'),
    path('events/<int:pk>/cancel/', views.cancel_event, name='event-cancel'),
    path('events/<int:pk>/participants/', views.event_participants, name='event-participants'),
    path('events/<int:pk>/update/', views.update_event, name='event-update'),
    path('events/<int:pk>/delete/', views.delete_event, name='event-delete'),

    # Messages
    path('messages/conversations/', views.conversations, name='conversations'),
    path('messages/unread/count/', views.unread_count, name='unread-count'),
    path('messages/send/', views.send_message, name='send-message'),
    path('messages/<int:pk>/delete/', views.delete_message, name='delete-message'),
    path('messages/<int:user_id>/', views.messages_with_user, name='messages-with-user'),

    # Todos
    path('todos/', views.todo_list, name='todo-list'),
    path('todos/create/', views.todo_create, name='todo-create'),
    path('todos/<int:pk>/update/', views.todo_update, name='todo-update'),
    path('todos/<int:pk>/delete/', views.todo_delete, name='todo-delete'),
    path('todos/<int:pk>/toggle/', views.todo_toggle, name='todo-toggle'),
]
