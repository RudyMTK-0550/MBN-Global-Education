"""Seed script to populate the database with test data."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mbn_backend.settings')
django.setup()

from api.models import User, Club, ClubMember, Event, EventParticipant, Message
from django.utils import timezone
from datetime import timedelta


def seed():
    print("Seeding database...")

    # Clear existing data
    Message.objects.all().delete()
    EventParticipant.objects.all().delete()
    Event.objects.all().delete()
    ClubMember.objects.all().delete()
    Club.objects.all().delete()
    User.objects.all().delete()

    # Create users
    users_data = [
        {'email': 'mboussi@mbn.edu', 'nom': 'MBOUSSI', 'prenom': 'Marc', 'ecole': 'ESIIA',
         'formation': 'Direction', 'campus': 'Lyon', 'role': 'directeur',
         'photo_profil': 'https://i.pinimg.com/736x/0a/19/7e/0a197ef908d97424b1e18b9b52552eb5.jpg'},
        {'email': 'ketsia.c@mbn.edu', 'nom': 'CHOUTEAU', 'prenom': 'Ketsia', 'ecole': 'ESIIA',
         'formation': 'Informatique', 'niveau': '2ème année', 'campus': 'Lyon', 'role': 'etudiant',
         'photo_profil': 'https://i.pinimg.com/1200x/9d/7f/cd/9d7fcd869c90540afb95b5f0d9b0508c.jpg'},
        {'email': 'aty@mbn.edu', 'nom': 'ATY', 'prenom': 'Antoine', 'ecole': 'ESIIA',
         'formation': 'Relation Client', 'campus': 'Lyon', 'role': 'professeur',
         'photo_profil': 'https://i.pinimg.com/736x/aa/2f/a1/aa2fa1e0011e89985c448b1b34c964e9.jpg'},
        {'email': 'sarah@mbn.edu', 'nom': 'MARTINEZ', 'prenom': 'Sarah', 'ecole': 'ESIIA',
         'formation': 'Informatique', 'niveau': '2ème année', 'campus': 'Lyon', 'role': 'etudiant',
         'photo_profil': 'https://i.pinimg.com/736x/7d/ba/e2/7dbae2ef3c2e477d1721004644f55bbd.jpg'},
        {'email': 'stiven@mbn.edu', 'nom': 'LAURENT', 'prenom': 'Stiven', 'ecole': 'EMSP',
         'formation': 'Management', 'niveau': '1ère année', 'campus': 'Évry', 'role': 'etudiant',
         'photo_profil': 'https://i.pinimg.com/736x/94/8f/7b/948f7bc2e77391cba732ffc86225f049.jpg'},
        {'email': 'blanche@mbn.edu', 'nom': 'DUBOIS', 'prenom': 'Blanche', 'ecole': 'ESIIA',
         'formation': 'DCG', 'niveau': '2ème année', 'campus': 'Lyon', 'role': 'etudiant',
         'photo_profil': 'https://i.pinimg.com/736x/8d/44/d1/8d44d1bbc56cdbfce842848fc002ab08.jpg'},
        {'email': 'sofia@mbn.edu', 'nom': 'BENALI', 'prenom': 'Sofia',
         'formation': 'Recrutement', 'campus': 'Lyon', 'role': 'admin',
         'photo_profil': 'https://i.pinimg.com/736x/f2/63/37/f26337907cce687a3fbfed7f13651975.jpg'},
    ]

    users = []
    for data in users_data:
        user = User.objects.create_user(password='password123', **data)
        users.append(user)
        print(f"  Created user: {user.email}")

    mboussi, ketsia, aty, sarah, stiven, blanche, sofia = users

    # Create clubs
    club1 = Club.objects.create(
        nom='Club Créatifs & Artistiques',
        description='Théâtre, danse, dessin & peinture',
        type='creatif',
        created_by=ketsia
    )
    club2 = Club.objects.create(
        nom='Club Événementiel',
        description='Journée culturelle, talent show & sorties extra scolaires',
        type='evenementiel',
        created_by=ketsia
    )
    club3 = Club.objects.create(
        nom='Club Recherche Alternance & Stage',
        description="Aide à la rédaction de CV, simulation d'entretiens & partage d'offres entre élèves",
        type='professionnel',
        created_by=aty
    )
    print("  Created 3 clubs")

    # Add club members
    for club, members in [
        (club1, [ketsia, sarah, blanche]),
        (club2, [ketsia, stiven, blanche]),
        (club3, [ketsia, aty, sarah, stiven]),
    ]:
        for member in members:
            ClubMember.objects.get_or_create(club=club, user=member)

    # Create events
    now = timezone.now()
    event1 = Event.objects.create(
        titre='Journée Culturelle',
        description='Une journée dédiée à la découverte des différentes cultures présentes au sein de MBN',
        date_event=now + timedelta(days=12),
        lieu='Amphithéâtre Principal',
        campus='Lyon',
        created_by=mboussi
    )
    event2 = Event.objects.create(
        titre='Activité Extra Scolaire',
        description='Sortie au musée et activités de team building',
        date_event=now + timedelta(days=25),
        lieu='Musée des Confluences',
        campus='Lyon',
        created_by=mboussi
    )
    event3 = Event.objects.create(
        titre='Conférence Innovation Tech',
        description='Rencontre avec des professionnels de la tech',
        date_event=now + timedelta(days=40),
        lieu='Salle de Conférence',
        campus='Évry',
        created_by=sofia
    )
    print("  Created 3 events")

    # Add event participants
    for event, parts in [
        (event1, [ketsia, sarah, stiven, blanche]),
        (event2, [ketsia, sarah, stiven]),
        (event3, [ketsia, aty, stiven]),
    ]:
        for p in parts:
            EventParticipant.objects.get_or_create(event=event, user=p)

    # Create messages
    messages_data = [
        (mboussi, sarah, 'Bonjour, vous êtes disponible ?', True),
        (sarah, mboussi, 'Oui bien sûr', True),
        (mboussi, sarah, 'Parfait, on se voit à 14h', False),
        (ketsia, sarah, 'Merci pour ton aide', True),
        (sarah, ketsia, 'Avec plaisir !', True),
        (aty, sarah, 'Le projet est validé', True),
        (sarah, aty, 'Merci beaucoup', True),
    ]
    for sender, receiver, content, is_read in messages_data:
        Message.objects.create(sender=sender, receiver=receiver, content=content, is_read=is_read)
    print("  Created 7 messages")

    print("\nDatabase seeded successfully!")
    print(f"  Users: {User.objects.count()}")
    print(f"  Clubs: {Club.objects.count()}")
    print(f"  Events: {Event.objects.count()}")
    print(f"  Messages: {Message.objects.count()}")
    print("\nTest credentials: any user email with password 'password123'")


if __name__ == '__main__':
    seed()
