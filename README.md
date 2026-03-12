# MBN Global Education — Full-Stack React + Django

## Structure du projet

```
MBN-Global-Education/
├── backend/                    ← Django REST Framework
│   ├── mbn_backend/            ← Config Django (settings, urls)
│   ├── api/                    ← App principale (models, views, serializers, urls)
│   ├── manage.py
│   ├── seed.py                 ← Script pour remplir la DB avec données de test
│   └── requirements.txt
├── frontend/                   ← React 18 + Vite
│   ├── src/
│   │   ├── components/         ← Navbar, Layout, Notification
│   │   ├── pages/              ← Landing, Login, Register, Dashboard, Profile, Messages
│   │   ├── context/            ← AuthContext, ThemeContext (mode sombre)
│   │   ├── services/           ← api.js (Axios + JWT)
│   │   └── styles/             ← index.css (design system complet)
│   ├── package.json
│   └── vite.config.js
└── .gitignore
```

---

## Lancement rapide

### 1. Backend Django

```bash
cd backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Installer les dépendances
pip install -r requirements.txt

# Créer la base de données + migrations
python3 manage.py makemigrations api
python3 manage.py migrate

# Remplir avec les données de test
python3 seed.py

# Lancer le serveur (port 8000)
python3 manage.py runserver
```

### 2. Frontend React

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur dev (port 5173)
npm run dev
```

### 3. Ouvrir l'application

→ **http://localhost:5173**

---

## Comptes de test

| Email               | Mot de passe  | Rôle       |
|---------------------|---------------|------------|
| sarah@mbn.edu       | password123   | Étudiant   |
| mboussi@mbn.edu     | password123   | Directeur  |
| aty@mbn.edu         | password123   | Professeur |
| ketsia.c@mbn.edu    | password123   | Étudiant   |
| sofia@mbn.edu       | password123   | Admin      |

---

## Fonctionnalités

- Authentification JWT (inscription, connexion, déconnexion)
- Dashboard avec profils, clubs et événements
- Messagerie privée en temps réel
- Gestion de profil (édition)
- Clubs : créer, rejoindre, quitter
- Événements : créer, participer, annuler
- Recherche d'utilisateurs
- **Mode sombre** (toggle dans la navbar)
- Design responsive mobile
- Effets glassmorphism modernes

---

## Technologies

**Frontend:** React 18, Vite, React Router v6, Axios, CSS Variables
**Backend:** Django 5, Django REST Framework, SimpleJWT, SQLite
**Design:** Glassmorphism, CSS Grid/Flexbox, Animations CSS, Mode sombre
