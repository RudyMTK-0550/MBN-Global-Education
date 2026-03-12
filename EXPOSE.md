# EXPOSÉ — MBN Global Education
## Plateforme Web Full-Stack pour la Communauté Éducative

---

## 1. PRÉSENTATION DU PROJET

**MBN Global Education** est une plateforme web destinée aux étudiants, enseignants et administrateurs du groupe MBN. Elle permet de :
- Gérer son profil et se connecter avec la communauté
- Rejoindre des clubs et participer à des événements
- Échanger des messages (texte, vocal, fichiers)
- Organiser ses tâches (Todo List)

C'est une application **Full-Stack** : le frontend (ce que voit l'utilisateur) et le backend (le serveur qui gère les données) sont deux projets séparés qui communiquent via une **API REST**.

---

## 2. ARCHITECTURE DU PROJET

```
┌─────────────────────┐         ┌─────────────────────┐
│                     │  HTTP   │                     │
│   FRONTEND          │ ◄─────► │   BACKEND           │
│   React + Vite      │  /api   │   Django + DRF      │
│   Port 5173         │         │   Port 8000         │
│                     │         │                     │
│  ┌──────────────┐   │         │  ┌──────────────┐   │
│  │ Pages React  │   │         │  │ API REST     │   │
│  │ Composants   │   │         │  │ 30+ endpoints│   │
│  │ CSS Design   │   │         │  │ JWT Auth     │   │
│  └──────────────┘   │         │  └──────┬───────┘   │
│                     │         │         │           │
└─────────────────────┘         │  ┌──────▼───────┐   │
                                │  │  SQLite      │   │
                                │  │  Base de     │   │
                                │  │  données     │   │
                                │  └──────────────┘   │
                                └─────────────────────┘
```

**Principe :** Le frontend envoie des requêtes HTTP (GET, POST, PUT, DELETE) au backend. Le backend traite la demande, interagit avec la base de données, et renvoie une réponse en **JSON**.

---

## 3. TECHNOLOGIES UTILISÉES

### 3.1 Backend — Django (Python)

| Technologie | Rôle |
|---|---|
| **Django 5.1** | Framework web Python. Il gère le serveur, les routes, les modèles de données et l'administration. |
| **Django REST Framework (DRF)** | Extension de Django pour créer des API REST. Il transforme les objets Python en JSON et vice-versa grâce aux **Serializers**. |
| **SimpleJWT** | Gestion de l'authentification par **JSON Web Token**. Quand un utilisateur se connecte, il reçoit un token qu'il envoie à chaque requête pour prouver son identité. |
| **django-cors-headers** | Permet au frontend (port 5173) de communiquer avec le backend (port 8000) malgré les restrictions de sécurité du navigateur (CORS). |
| **Pillow** | Bibliothèque Python pour le traitement d'images. Utilisée pour valider les photos de profil uploadées. |
| **SQLite** | Base de données intégrée. Un simple fichier `db.sqlite3` stocke toutes les données. Pas besoin d'installer un serveur de base de données. |

### 3.2 Frontend — React (JavaScript)

| Technologie | Rôle |
|---|---|
| **React 18** | Bibliothèque JavaScript pour construire l'interface utilisateur. Chaque page est un **composant** réutilisable. |
| **Vite 5.4** | Outil de build ultra-rapide. Il compile le code React, gère le rechargement automatique en développement, et crée le bundle optimisé pour la production. |
| **React Router 6** | Gestion de la navigation. Permet de passer d'une page à l'autre sans recharger le navigateur (Single Page Application). |
| **Axios** | Client HTTP pour envoyer des requêtes au backend. Il gère automatiquement les headers d'authentification JWT et la sérialisation JSON. |
| **CSS3 avec Variables** | Système de design complet avec mode sombre/clair grâce aux CSS Variables (`--accent: #046bd2`). |

---

## 4. BASE DE DONNÉES

### 4.1 Qu'est-ce que SQLite ?

SQLite est un **système de gestion de base de données relationnelle** qui stocke toutes les données dans un seul fichier (`db.sqlite3`). Contrairement à MySQL ou PostgreSQL, il ne nécessite pas de serveur séparé. C'est idéal pour le développement et les petits projets.

### 4.2 Les Modèles (Tables)

Django utilise un **ORM** (Object-Relational Mapping) : on écrit des classes Python et Django les transforme automatiquement en tables SQL.

#### Table USER (Utilisateurs)
```
┌──────────────────────────────────────────┐
│                  USER                     │
├──────────────┬───────────────────────────┤
│ id           │ Identifiant unique (auto) │
│ email        │ Email (unique, login)     │
│ password     │ Mot de passe (hashé)      │
│ nom          │ Nom de famille            │
│ prenom       │ Prénom                    │
│ ecole        │ ESIIA, EMSP, etc.         │
│ formation    │ Dev Web, IA, etc.         │
│ niveau       │ BTS 1, Bachelor 3, etc.   │
│ campus       │ Lyon, Paris-Torcy, etc.   │
│ role         │ etudiant/professeur/admin │
│ photo_profil │ URL de la photo           │
│ created_at   │ Date d'inscription        │
└──────────────┴───────────────────────────┘
```

#### Table CLUB
```
┌──────────────────────────────────────────┐
│                  CLUB                     │
├──────────────┬───────────────────────────┤
│ id           │ Identifiant unique        │
│ nom          │ Nom du club               │
│ description  │ Description               │
│ type         │ créatif/sport/pro/autre    │
│ created_by   │ → FK vers USER            │
│ created_at   │ Date de création          │
└──────────────┴───────────────────────────┘
       │
       │ ManyToMany (via CLUBMEMBER)
       ▼
┌──────────────────────────┐
│      CLUBMEMBER          │
├──────────┬───────────────┤
│ club_id  │ → FK CLUB     │
│ user_id  │ → FK USER     │
│ joined_at│ Date adhésion │
└──────────┴───────────────┘
```

#### Table EVENT (Événements)
```
┌──────────────────────────────────────────┐
│                 EVENT                     │
├──────────────┬───────────────────────────┤
│ id           │ Identifiant unique        │
│ titre        │ Nom de l'événement        │
│ description  │ Détails                   │
│ date_event   │ Date et heure             │
│ lieu         │ Lieu                      │
│ campus       │ Campus concerné           │
│ created_by   │ → FK vers USER            │
└──────────────┴───────────────────────────┘
       │
       │ ManyToMany (via EVENTPARTICIPANT)
       ▼
┌──────────────────────────┐
│    EVENTPARTICIPANT      │
├──────────┬───────────────┤
│ event_id │ → FK EVENT    │
│ user_id  │ → FK USER     │
│ joined_at│ Date          │
└──────────┴───────────────┘
```

#### Table MESSAGE
```
┌──────────────────────────────────────────┐
│                MESSAGE                    │
├────────────────┬─────────────────────────┤
│ id             │ Identifiant unique      │
│ sender         │ → FK USER (expéditeur)  │
│ receiver       │ → FK USER (destinataire)│
│ content        │ Texte du message        │
│ message_type   │ text / voice / file     │
│ file_name      │ Nom du fichier          │
│ file_size      │ Taille en octets        │
│ voice_duration │ Durée audio (secondes)  │
│ is_read        │ Lu ou non               │
│ created_at     │ Date d'envoi            │
└────────────────┴─────────────────────────┘
```

#### Table TODO (Tâches)
```
┌──────────────────────────────────────────┐
│                  TODO                     │
├────────────────┬─────────────────────────┤
│ id             │ Identifiant unique      │
│ user           │ → FK USER               │
│ titre          │ Titre de la tâche       │
│ description    │ Détails                 │
│ categorie      │ cours/devoir/examen/... │
│ priorite       │ basse/moyenne/haute/... │
│ completed      │ Terminée ou non         │
│ date_echeance  │ Date limite             │
│ created_at     │ Date de création        │
└────────────────┴─────────────────────────┘
```

### 4.3 Relations entre les tables

```
USER ──1────N──► MESSAGE (un user envoie plusieurs messages)
USER ──1────N──► TODO (un user a plusieurs tâches)
USER ──N────N──► CLUB (via CLUBMEMBER : un user peut être dans plusieurs clubs)
USER ──N────N──► EVENT (via EVENTPARTICIPANT : un user participe à plusieurs événements)
USER ──1────N──► CLUB (created_by : un user crée plusieurs clubs)
USER ──1────N──► EVENT (created_by : un user crée plusieurs événements)
```

---

## 5. AUTHENTIFICATION — JWT (JSON Web Token)

### Comment ça marche ?

```
1. L'utilisateur envoie email + mot de passe
        │
        ▼
2. Le serveur vérifie les identifiants
        │
        ▼
3. Si correct → Le serveur génère 2 tokens :
   ┌─────────────────────────────────────────┐
   │ ACCESS TOKEN  (valide 7 jours)          │
   │ → Envoyé à chaque requête dans le       │
   │   header : "Authorization: Bearer xxx"  │
   ├─────────────────────────────────────────┤
   │ REFRESH TOKEN (valide 30 jours)         │
   │ → Permet de renouveler l'access token   │
   │   quand il expire                       │
   └─────────────────────────────────────────┘
        │
        ▼
4. Le frontend stocke ces tokens dans localStorage
        │
        ▼
5. À chaque requête, Axios ajoute automatiquement
   le token dans les headers HTTP
        │
        ▼
6. Le backend vérifie le token et identifie l'utilisateur
```

### Pourquoi JWT et pas les sessions classiques ?

- **Stateless** : Le serveur ne stocke rien. Le token contient toutes les infos.
- **Adapté aux API REST** : Pas besoin de cookies.
- **Sécurisé** : Le token est signé avec une clé secrète. Impossible de le falsifier.

---

## 6. API REST — Les Endpoints

Une **API REST** suit des conventions :
- `GET` = Lire des données
- `POST` = Créer des données
- `PUT` = Modifier des données
- `DELETE` = Supprimer des données

### Exemple concret : Connexion

```
Requête :
POST /api/auth/login/
Body : { "email": "mboussi@mbn.edu", "password": "password123" }

Réponse :
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nom": "MBOUSSI",
    "prenom": "Marc",
    "ecole": "ESIIA",
    "role": "directeur"
  }
}
```

### Principaux endpoints de l'API

| Méthode | URL | Description |
|---|---|---|
| POST | `/api/auth/register/` | Inscription |
| POST | `/api/auth/login/` | Connexion |
| GET | `/api/auth/me/` | Mon profil |
| GET | `/api/users/` | Liste des utilisateurs |
| GET | `/api/users/search/?q=` | Recherche |
| PUT | `/api/users/{id}/update/` | Modifier profil |
| POST | `/api/users/upload-photo/` | Upload photo de profil |
| GET | `/api/clubs/` | Liste des clubs |
| POST | `/api/clubs/{id}/join/` | Rejoindre un club |
| GET | `/api/events/` | Liste des événements |
| POST | `/api/events/{id}/participate/` | Participer |
| GET | `/api/messages/conversations/` | Mes conversations |
| POST | `/api/messages/send/` | Envoyer un message |
| GET | `/api/todos/` | Mes tâches |
| POST | `/api/todos/create/` | Créer une tâche |
| POST | `/api/todos/{id}/toggle/` | Cocher/décocher |

---

## 7. FRONTEND — REACT

### 7.1 Qu'est-ce que React ?

React est une bibliothèque JavaScript développée par **Facebook (Meta)** pour construire des interfaces utilisateur. Le principe : l'interface est découpée en **composants** réutilisables.

### 7.2 Structure des pages

```
App.jsx (Router principal)
│
├── / ─────────────► Landing.jsx      (Page d'accueil publique)
├── /connexion ────► Login.jsx        (Formulaire de connexion)
├── /inscription ──► Register.jsx     (Formulaire d'inscription)
│
├── Layout.jsx (Navbar + contenu)
│   ├── /accueil ──► Dashboard.jsx    (Profils, clubs, événements)
│   ├── /profil ───► Profile.jsx      (Mon profil + upload photo)
│   ├── /messages ─► Messages.jsx     (Messagerie style WhatsApp)
│   └── /todos ────► Todos.jsx        (Gestion des tâches)
```

### 7.3 Concepts clés utilisés

| Concept | Explication |
|---|---|
| **Composants** | Chaque page est un composant React (fonction qui retourne du JSX) |
| **useState** | Hook pour gérer l'état local (formulaires, loading, erreurs) |
| **useEffect** | Hook pour charger les données au montage du composant |
| **useContext** | Hook pour accéder aux données globales (user connecté, thème) |
| **React Router** | Navigation SPA — pas de rechargement de page |
| **Axios** | Requêtes HTTP vers l'API Django |

### 7.4 Gestion de l'état global (Context API)

```
ThemeProvider (mode sombre/clair)
  └── AuthProvider (utilisateur connecté, token JWT)
        └── App (toutes les pages)
```

- **AuthContext** : Stocke l'utilisateur connecté, le token JWT, et fournit les fonctions `login()`, `register()`, `logout()`, `updateUser()`.
- **ThemeContext** : Gère le basculement entre mode clair et mode sombre. Détecte aussi la préférence système de l'utilisateur.

---

## 8. DESIGN ET INTERFACE

### 8.1 Système de Design

Le CSS utilise des **Variables CSS** pour gérer facilement les couleurs :

```css
/* Mode clair */
:root {
  --accent: #046bd2;        /* Bleu MBN */
  --bg-primary: #F0F5FA;    /* Fond gris clair */
  --text-primary: #1e293b;  /* Texte foncé */
}

/* Mode sombre — les mêmes variables changent */
[data-theme="dark"] {
  --accent: #3b8df5;        /* Bleu plus clair */
  --bg-primary: #0b1120;    /* Fond noir */
  --text-primary: #f1f5f9;  /* Texte blanc */
}
```

Quand on change de thème, **toutes les couleurs de l'application changent automatiquement** car elles utilisent ces variables.

### 8.2 Effets visuels

- **Glassmorphism** : Effet de verre flou sur les cartes (`backdrop-filter: blur()`)
- **Animations** : Transitions fluides, splash screen animé, particules flottantes
- **Responsive** : L'interface s'adapte au mobile, tablette et desktop
- **Les couleurs** sont inspirées du site officiel **mbnglobal.fr** (`#046bd2`)

---

## 9. SÉCURITÉ

| Mesure | Détail |
|---|---|
| **Mots de passe hashés** | Django utilise l'algorithme PBKDF2 + SHA256 pour stocker les mots de passe. Jamais en clair. |
| **JWT signé** | Les tokens sont signés avec une clé secrète. Impossible de les modifier. |
| **CORS** | Seul le frontend autorisé peut communiquer avec le backend. |
| **Validation upload** | Les photos de profil sont validées : type MIME (JPG/PNG/GIF/WebP) et taille max (5 MB). |
| **Permissions** | Un utilisateur ne peut modifier/supprimer que ses propres données. |
| **Expiration tokens** | Access token expire après 7 jours, refresh après 30 jours. |

---

## 10. FONCTIONNALITÉS COMPLÈTES

### Authentification
- Inscription avec choix d'école, formation, niveau, campus (13 écoles du groupe MBN)
- Connexion par email/mot de passe
- Déconnexion
- Splash screen animé à la première visite

### Profil
- Voir et modifier ses informations
- **Téléverser une photo de profil** (comme Instagram : cliquer sur l'avatar)
- Voir ses clubs et événements

### Clubs
- Créer un club
- Rejoindre / quitter un club
- Voir les membres

### Événements
- Créer un événement avec date, lieu et campus
- S'inscrire / se désinscrire
- Modifier / supprimer (créateur uniquement)

### Messagerie (style WhatsApp)
- Liste des conversations avec dernier message
- Messages texte, vocaux et fichiers
- Indicateur de messages non lus
- Coches de lecture (✓✓ bleu)

### Todo List
- Créer des tâches avec titre, description, catégorie, priorité et deadline
- 7 catégories : Cours, Devoir, Examen, Projet, Stage, Personnel, Autre
- 4 niveaux de priorité : Basse, Moyenne, Haute, Urgente
- Filtrer par catégorie et statut
- Barre de progression

### Mode sombre
- Basculer entre mode clair et mode sombre
- Détection automatique de la préférence système
- Sauvegardé dans le navigateur

---

## 11. COMMENT LANCER LE PROJET

```bash
# Terminal 1 — Backend
cd backend
python3 manage.py runserver 0.0.0.0:8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Ouvrir : **http://localhost:5173**

Identifiant test : `mboussi@mbn.edu` / `password123`

---

## 12. RÉSUMÉ TECHNIQUE

| | Technologie | Version |
|---|---|---|
| **Langage backend** | Python | 3.11+ |
| **Framework backend** | Django | 5.1 |
| **API** | Django REST Framework | 3.15 |
| **Authentification** | JWT (SimpleJWT) | 5.3 |
| **Base de données** | SQLite | 3 |
| **Langage frontend** | JavaScript (JSX) | ES2022 |
| **Framework frontend** | React | 18.3 |
| **Bundler** | Vite | 5.4 |
| **Routage** | React Router | 6.26 |
| **HTTP Client** | Axios | 1.7 |
| **Styling** | CSS3 Variables | — |
| **Protocole** | REST API (JSON) | — |

---

*MBN Global Education — Projet Full-Stack 2026*
