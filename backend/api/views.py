import os
import uuid
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Count
from django.utils import timezone
from django.conf import settings

from .models import User, Club, ClubMember, Event, EventParticipant, Message, Todo
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, UserUpdateSerializer,
    ClubSerializer, ClubCreateSerializer,
    EventSerializer, EventCreateSerializer,
    MessageSerializer, ConversationSerializer,
    TodoSerializer
)


# ─── AUTH ────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'message': 'Inscription réussie',
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'message': 'Connexion réussie',
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })


class MeView(APIView):
    def get(self, request):
        return Response({
            'success': True,
            'user': UserSerializer(request.user).data
        })


# ─── USERS ───────────────────────────────────────────

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        limit = int(self.request.query_params.get('limit', 50))
        return User.objects.all()[:limit]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'users': serializer.data})


class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        q = self.request.query_params.get('q', '')
        if len(q) < 2:
            return User.objects.none()
        return User.objects.filter(
            Q(nom__icontains=q) | Q(prenom__icontains=q) |
            Q(email__icontains=q) | Q(ecole__icontains=q) |
            Q(formation__icontains=q)
        )[:20]

    def list(self, request, *args, **kwargs):
        q = request.query_params.get('q', '')
        if len(q) < 2:
            return Response({
                'success': False,
                'message': 'Le terme de recherche doit contenir au moins 2 caractères'
            }, status=status.HTTP_400_BAD_REQUEST)
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'users': serializer.data})


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({'success': True, 'user': serializer.data})


class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer

    def update(self, request, *args, **kwargs):
        if request.user.pk != int(kwargs['pk']):
            return Response({
                'success': False,
                'message': 'Vous ne pouvez modifier que votre propre profil'
            }, status=status.HTTP_403_FORBIDDEN)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'success': True,
            'message': 'Profil mis à jour avec succès',
            'user': UserSerializer(instance).data
        })


class UploadPhotoView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        photo = request.FILES.get('photo')
        if not photo:
            return Response({'success': False, 'message': 'Aucune photo envoyée'}, status=400)

        # Vérifier le type
        allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if photo.content_type not in allowed:
            return Response({'success': False, 'message': 'Format non supporté. Utilisez JPG, PNG, GIF ou WebP'}, status=400)

        # Vérifier la taille (max 5MB)
        if photo.size > 5 * 1024 * 1024:
            return Response({'success': False, 'message': 'La photo ne doit pas dépasser 5 MB'}, status=400)

        # Créer le dossier media/avatars si nécessaire
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
        os.makedirs(upload_dir, exist_ok=True)

        # Nom unique
        ext = photo.name.split('.')[-1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(upload_dir, filename)

        # Sauvegarder
        with open(filepath, 'wb+') as f:
            for chunk in photo.chunks():
                f.write(chunk)

        # URL accessible
        photo_url = f"{request.scheme}://{request.get_host()}/media/avatars/{filename}"

        # Mettre à jour l'utilisateur
        request.user.photo_profil = photo_url
        request.user.save()

        return Response({
            'success': True,
            'message': 'Photo mise à jour',
            'photo_url': photo_url,
            'user': UserSerializer(request.user).data
        })


# ─── CLUBS ───────────────────────────────────────────

class ClubListView(generics.ListAPIView):
    serializer_class = ClubSerializer

    def get_queryset(self):
        return Club.objects.annotate(member_count=Count('members'))

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'clubs': serializer.data})


class ClubDetailView(generics.RetrieveAPIView):
    serializer_class = ClubSerializer

    def get_queryset(self):
        return Club.objects.annotate(member_count=Count('members'))

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({'success': True, 'club': serializer.data})


class ClubCreateView(generics.CreateAPIView):
    serializer_class = ClubCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        club = serializer.save(created_by=request.user)
        ClubMember.objects.create(club=club, user=request.user)
        club_serializer = ClubSerializer(
            Club.objects.annotate(member_count=Count('members')).get(pk=club.pk),
            context={'request': request}
        )
        return Response({
            'success': True,
            'message': 'Club créé avec succès',
            'club': club_serializer.data
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def join_club(request, pk):
    try:
        club = Club.objects.get(pk=pk)
    except Club.DoesNotExist:
        return Response({'success': False, 'message': 'Club non trouvé'}, status=404)
    _, created = ClubMember.objects.get_or_create(club=club, user=request.user)
    if not created:
        return Response({'success': False, 'message': 'Vous êtes déjà membre de ce club'}, status=400)
    return Response({'success': True, 'message': 'Vous avez rejoint le club avec succès'})


@api_view(['POST'])
def leave_club(request, pk):
    deleted, _ = ClubMember.objects.filter(club_id=pk, user=request.user).delete()
    if not deleted:
        return Response({'success': False, 'message': "Vous n'êtes pas membre de ce club"}, status=400)
    return Response({'success': True, 'message': 'Vous avez quitté le club avec succès'})


@api_view(['GET'])
def club_members(request, pk):
    members = User.objects.filter(
        clubmember__club_id=pk
    ).values('id', 'nom', 'prenom', 'email', 'photo_profil', 'ecole', 'formation')
    return Response({'success': True, 'members': list(members)})


@api_view(['GET'])
def my_clubs(request):
    clubs = Club.objects.filter(members=request.user).annotate(member_count=Count('members'))
    serializer = ClubSerializer(clubs, many=True, context={'request': request})
    return Response({'success': True, 'clubs': serializer.data})


# ─── EVENTS ──────────────────────────────────────────

class EventListView(generics.ListAPIView):
    serializer_class = EventSerializer

    def get_queryset(self):
        upcoming = self.request.query_params.get('upcoming', 'false')
        qs = Event.objects.annotate(participant_count=Count('participants'))
        if upcoming.lower() == 'true':
            qs = qs.filter(date_event__gte=timezone.now())
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'events': serializer.data})


class EventDetailView(generics.RetrieveAPIView):
    serializer_class = EventSerializer

    def get_queryset(self):
        return Event.objects.annotate(participant_count=Count('participants'))

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({'success': True, 'event': serializer.data})


class EventCreateView(generics.CreateAPIView):
    serializer_class = EventCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = serializer.save(created_by=request.user)
        EventParticipant.objects.create(event=event, user=request.user)
        event_serializer = EventSerializer(
            Event.objects.annotate(participant_count=Count('participants')).get(pk=event.pk),
            context={'request': request}
        )
        return Response({
            'success': True,
            'message': 'Événement créé avec succès',
            'event': event_serializer.data
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def participate_event(request, pk):
    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response({'success': False, 'message': 'Événement non trouvé'}, status=404)
    _, created = EventParticipant.objects.get_or_create(event=event, user=request.user)
    if not created:
        return Response({'success': False, 'message': 'Vous participez déjà à cet événement'}, status=400)
    return Response({'success': True, 'message': 'Vous participez maintenant à cet événement'})


@api_view(['POST'])
def cancel_event(request, pk):
    deleted, _ = EventParticipant.objects.filter(event_id=pk, user=request.user).delete()
    if not deleted:
        return Response({'success': False, 'message': "Vous ne participez pas à cet événement"}, status=400)
    return Response({'success': True, 'message': 'Participation annulée avec succès'})


@api_view(['GET'])
def event_participants(request, pk):
    participants = User.objects.filter(
        eventparticipant__event_id=pk
    ).values('id', 'nom', 'prenom', 'email', 'photo_profil', 'ecole')
    return Response({'success': True, 'participants': list(participants)})


@api_view(['GET'])
def my_events(request):
    events = Event.objects.filter(participants=request.user).annotate(participant_count=Count('participants'))
    serializer = EventSerializer(events, many=True, context={'request': request})
    return Response({'success': True, 'events': serializer.data})


@api_view(['PUT'])
def update_event(request, pk):
    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response({'success': False, 'message': 'Événement non trouvé'}, status=404)
    if event.created_by != request.user:
        return Response({'success': False, 'message': "Vous n'êtes pas autorisé"}, status=403)
    serializer = EventCreateSerializer(event, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    event_data = EventSerializer(
        Event.objects.annotate(participant_count=Count('participants')).get(pk=pk),
        context={'request': request}
    ).data
    return Response({'success': True, 'message': 'Événement mis à jour', 'event': event_data})


@api_view(['DELETE'])
def delete_event(request, pk):
    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response({'success': False, 'message': 'Événement non trouvé'}, status=404)
    if event.created_by != request.user:
        return Response({'success': False, 'message': "Vous n'êtes pas autorisé"}, status=403)
    event.delete()
    return Response({'success': True, 'message': 'Événement supprimé avec succès'})


# ─── MESSAGES ────────────────────────────────────────

@api_view(['GET'])
def conversations(request):
    user = request.user
    all_messages = Message.objects.filter(Q(sender=user) | Q(receiver=user))
    partner_ids = set()
    for msg in all_messages:
        partner_ids.add(msg.sender_id if msg.sender_id != user.id else msg.receiver_id)

    result = []
    for pid in partner_ids:
        partner = User.objects.get(pk=pid)
        last_msg = Message.objects.filter(
            (Q(sender=user, receiver_id=pid) | Q(sender_id=pid, receiver=user))
        ).order_by('-created_at').first()
        unread = Message.objects.filter(sender_id=pid, receiver=user, is_read=False).count()
        if last_msg:
            preview = last_msg.content
            if last_msg.message_type == 'voice':
                preview = 'Message vocal'
            elif last_msg.message_type == 'file':
                preview = last_msg.file_name or 'Fichier'
            result.append({
                'user_id': pid,
                'nom': partner.nom,
                'prenom': partner.prenom,
                'email': partner.email,
                'photo_profil': partner.photo_profil,
                'last_message': preview,
                'last_message_time': last_msg.created_at,
                'unread_count': unread
            })

    result.sort(key=lambda x: x['last_message_time'], reverse=True)
    serializer = ConversationSerializer(result, many=True)
    return Response({'success': True, 'conversations': serializer.data})


@api_view(['GET'])
def messages_with_user(request, user_id):
    messages = Message.objects.filter(
        (Q(sender=request.user, receiver_id=user_id) |
         Q(sender_id=user_id, receiver=request.user))
    ).select_related('sender', 'receiver').order_by('created_at')[:100]

    Message.objects.filter(
        sender_id=user_id, receiver=request.user, is_read=False
    ).update(is_read=True)

    serializer = MessageSerializer(messages, many=True)
    return Response({'success': True, 'messages': serializer.data})


@api_view(['POST'])
def send_message(request):
    receiver_id = request.data.get('receiver_id')
    content = request.data.get('content', '').strip()
    message_type = request.data.get('message_type', 'text')
    file_name = request.data.get('file_name', '')
    file_url = request.data.get('file_url', '')
    file_size = request.data.get('file_size', 0)
    voice_duration = request.data.get('voice_duration', 0)

    if not receiver_id:
        return Response({'success': False, 'message': 'receiver_id est requis'}, status=400)

    if message_type == 'text' and not content:
        return Response({'success': False, 'message': 'Le contenu est requis'}, status=400)

    if int(receiver_id) == request.user.id:
        return Response({'success': False, 'message': 'Vous ne pouvez pas vous envoyer un message'}, status=400)

    try:
        receiver = User.objects.get(pk=receiver_id)
    except User.DoesNotExist:
        return Response({'success': False, 'message': 'Destinataire non trouvé'}, status=404)

    message = Message.objects.create(
        sender=request.user,
        receiver=receiver,
        content=content,
        message_type=message_type,
        file_name=file_name,
        file_url=file_url,
        file_size=int(file_size),
        voice_duration=float(voice_duration),
    )
    serializer = MessageSerializer(message)
    return Response({
        'success': True,
        'message': 'Message envoyé',
        'data': serializer.data
    }, status=201)


@api_view(['DELETE'])
def delete_message(request, pk):
    deleted, _ = Message.objects.filter(pk=pk, sender=request.user).delete()
    if not deleted:
        return Response({'success': False, 'message': 'Message non trouvé'}, status=404)
    return Response({'success': True, 'message': 'Message supprimé'})


@api_view(['GET'])
def unread_count(request):
    count = Message.objects.filter(receiver=request.user, is_read=False).count()
    return Response({'success': True, 'count': count})


# ─── TODOS ───────────────────────────────────────────

@api_view(['GET'])
def todo_list(request):
    filter_cat = request.query_params.get('categorie', '')
    filter_done = request.query_params.get('completed', '')
    qs = Todo.objects.filter(user=request.user)
    if filter_cat:
        qs = qs.filter(categorie=filter_cat)
    if filter_done == 'true':
        qs = qs.filter(completed=True)
    elif filter_done == 'false':
        qs = qs.filter(completed=False)
    serializer = TodoSerializer(qs, many=True)
    return Response({'success': True, 'todos': serializer.data})


@api_view(['POST'])
def todo_create(request):
    serializer = TodoSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)
    return Response({'success': True, 'message': 'Tâche créée', 'todo': serializer.data}, status=201)


@api_view(['PUT'])
def todo_update(request, pk):
    try:
        todo = Todo.objects.get(pk=pk, user=request.user)
    except Todo.DoesNotExist:
        return Response({'success': False, 'message': 'Tâche non trouvée'}, status=404)
    serializer = TodoSerializer(todo, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({'success': True, 'message': 'Tâche mise à jour', 'todo': serializer.data})


@api_view(['DELETE'])
def todo_delete(request, pk):
    deleted, _ = Todo.objects.filter(pk=pk, user=request.user).delete()
    if not deleted:
        return Response({'success': False, 'message': 'Tâche non trouvée'}, status=404)
    return Response({'success': True, 'message': 'Tâche supprimée'})


@api_view(['POST'])
def todo_toggle(request, pk):
    try:
        todo = Todo.objects.get(pk=pk, user=request.user)
    except Todo.DoesNotExist:
        return Response({'success': False, 'message': 'Tâche non trouvée'}, status=404)
    todo.completed = not todo.completed
    todo.save()
    serializer = TodoSerializer(todo)
    return Response({'success': True, 'todo': serializer.data})


# ─── HEALTH ──────────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({
        'status': 'OK',
        'message': 'API MBN Global Education',
        'version': '2.0.0',
        'timestamp': timezone.now().isoformat()
    })
