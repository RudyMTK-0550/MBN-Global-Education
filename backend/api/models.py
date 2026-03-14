from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('etudiant', 'Étudiant'),
        ('professeur', 'Professeur'),
        ('admin', 'Administrateur'),
        ('directeur', 'Directeur'),
    ]

    email = models.EmailField(unique=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    ecole = models.CharField(max_length=100, blank=True, default='')
    formation = models.CharField(max_length=100, blank=True, default='')
    niveau = models.CharField(max_length=50, blank=True, default='')
    campus = models.CharField(max_length=100, blank=True, default='')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='etudiant')
    photo_profil = models.URLField(
        max_length=500,
        blank=True,
        default='https://i.pinimg.com/736x/7d/ba/e2/7dbae2ef3c2e477d1721004644f55bbd.jpg'
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nom} {self.prenom} ({self.email})"

    @property
    def full_name(self):
        return f"{self.nom} {self.prenom}"


class Club(models.Model):
    TYPE_CHOICES = [
        ('creatif', 'Créatif'),
        ('evenementiel', 'Événementiel'),
        ('professionnel', 'Professionnel'),
        ('sport', 'Sport'),
        ('autre', 'Autre'),
    ]

    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='autre')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_clubs')
    members = models.ManyToManyField(User, through='ClubMember', related_name='clubs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.nom



class ClubMember(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('club', 'user')

    def __str__(self):
        return f"{self.user.full_name} - {self.club.nom}"


class Event(models.Model):
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    date_event = models.DateTimeField()
    lieu = models.CharField(max_length=200)
    campus = models.CharField(max_length=100, blank=True, default='')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    participants = models.ManyToManyField(User, through='EventParticipant', related_name='events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date_event']

    def __str__(self):
        return self.titre

    @property
    def participant_count(self):
        return self.participants.count()


class EventParticipant(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('event', 'user')

    def __str__(self):
        return f"{self.user.full_name} - {self.event.titre}"


class Message(models.Model):
    MESSAGE_TYPES = [
        ('text', 'Texte'),
        ('voice', 'Vocal'),
        ('file', 'Fichier'),
    ]

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField(blank=True, default='')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    file_name = models.CharField(max_length=255, blank=True, default='')
    file_url = models.URLField(max_length=500, blank=True, default='')
    file_size = models.IntegerField(default=0)
    voice_duration = models.FloatField(default=0)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.full_name} -> {self.receiver.full_name}: {self.content[:50]}"


class Todo(models.Model):
    PRIORITY_CHOICES = [
        ('basse', 'Basse'),
        ('moyenne', 'Moyenne'),
        ('haute', 'Haute'),
        ('urgente', 'Urgente'),
    ]
    CATEGORY_CHOICES = [
        ('cours', 'Cours'),
        ('devoir', 'Devoir'),
        ('examen', 'Examen'),
        ('projet', 'Projet'),
        ('stage', 'Stage'),
        ('personnel', 'Personnel'),
        ('autre', 'Autre'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='todos')
    titre = models.CharField(max_length=300)
    description = models.TextField(blank=True, default='')
    categorie = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='autre')
    priorite = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='moyenne')
    completed = models.BooleanField(default=False)
    date_echeance = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['completed', '-priorite', '-created_at']

    def __str__(self):
        return f"[{'x' if self.completed else ' '}] {self.titre}"
