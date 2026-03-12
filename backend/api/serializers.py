from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Club, ClubMember, Event, EventParticipant, Message, Todo


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'nom', 'prenom', 'ecole', 'formation',
            'niveau', 'campus', 'role', 'photo_profil', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'confirm', 'nom', 'prenom',
            'ecole', 'formation', 'niveau', 'campus'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm']:
            raise serializers.ValidationError({
                'confirm': 'Les mots de passe ne correspondent pas'
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm')
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get('request'),
            username=attrs['email'],
            password=attrs['password']
        )
        if not user:
            raise serializers.ValidationError('Email ou mot de passe incorrect')
        if not user.is_active:
            raise serializers.ValidationError('Ce compte est désactivé')
        attrs['user'] = user
        return attrs


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['nom', 'prenom', 'email', 'ecole', 'formation', 'niveau', 'campus', 'photo_profil']

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError('Cet email est déjà utilisé')
        return value


class ClubSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)
    creator_nom = serializers.CharField(source='created_by.nom', read_only=True)
    creator_prenom = serializers.CharField(source='created_by.prenom', read_only=True)
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = [
            'id', 'nom', 'description', 'type', 'created_by',
            'creator_nom', 'creator_prenom', 'member_count',
            'is_member', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ClubMember.objects.filter(club=obj, user=request.user).exists()
        return False


class ClubCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = ['nom', 'description', 'type']


class EventSerializer(serializers.ModelSerializer):
    participant_count = serializers.IntegerField(read_only=True)
    creator_nom = serializers.CharField(source='created_by.nom', read_only=True)
    creator_prenom = serializers.CharField(source='created_by.prenom', read_only=True)
    is_participating = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'titre', 'description', 'date_event', 'lieu', 'campus',
            'created_by', 'creator_nom', 'creator_prenom',
            'participant_count', 'is_participating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_is_participating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return EventParticipant.objects.filter(event=obj, user=request.user).exists()
        return False


class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['titre', 'description', 'date_event', 'lieu', 'campus']


class MessageSerializer(serializers.ModelSerializer):
    sender_nom = serializers.CharField(source='sender.nom', read_only=True)
    sender_prenom = serializers.CharField(source='sender.prenom', read_only=True)
    sender_photo = serializers.URLField(source='sender.photo_profil', read_only=True)
    receiver_nom = serializers.CharField(source='receiver.nom', read_only=True)
    receiver_prenom = serializers.CharField(source='receiver.prenom', read_only=True)
    receiver_photo = serializers.URLField(source='receiver.photo_profil', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'receiver', 'content', 'message_type',
            'file_name', 'file_url', 'file_size', 'voice_duration',
            'is_read', 'created_at',
            'sender_nom', 'sender_prenom', 'sender_photo',
            'receiver_nom', 'receiver_prenom', 'receiver_photo'
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'created_at']


class ConversationSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    nom = serializers.CharField()
    prenom = serializers.CharField()
    email = serializers.EmailField()
    photo_profil = serializers.URLField()
    last_message = serializers.CharField()
    last_message_time = serializers.DateTimeField()
    unread_count = serializers.IntegerField()


class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = [
            'id', 'titre', 'description', 'categorie', 'priorite',
            'completed', 'date_echeance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
