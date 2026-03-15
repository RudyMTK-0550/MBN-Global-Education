# Déployer MBN Global Education — Guide complet

## Architecture

```
Utilisateur → Vercel (Frontend React) → Render (API Django) → PostgreSQL
```

- **Frontend** : React + Vite → hébergé sur **Vercel** (gratuit)
- **Backend** : Django REST Framework → hébergé sur **Render** (gratuit)
- **Base de données** : PostgreSQL → hébergé sur **Render** (gratuit)

## Prérequis

- Un compte GitHub (gratuit) → https://github.com
- Un compte Render (gratuit) → https://render.com
- Un compte Vercel (gratuit) → https://vercel.com

---

## ÉTAPE 1 : Mettre le projet sur GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau repo nommé `MBN-Global-Education`
3. **Ne cochez rien** (pas de README, pas de .gitignore)
4. Dans votre terminal VS Code :

```bash
cd ~/Desktop/MBN-Global-Education
git init
git add .
git commit -m "Projet MBN Global Education - React + Django"
git branch -M main
git remote add origin https://github.com/VOTRE-PSEUDO/MBN-Global-Education.git
git push -u origin main
```

> Remplacez `VOTRE-PSEUDO` par votre nom d'utilisateur GitHub.

---

## ÉTAPE 2 : Déployer le Backend sur Render (gratuit)

### 2.1 — Créer une base PostgreSQL

1. Allez sur https://dashboard.render.com
2. Cliquez **New** → **PostgreSQL**
3. Configurez :
   - **Name** : `mbn-database`
   - **Region** : `Frankfurt (EU Central)` (le plus proche de la France)
   - **Plan** : **Free**
4. Cliquez **Create Database**
5. Attendez que la base soit créée
6. Copiez l'**Internal Database URL** (vous en aurez besoin à l'étape suivante)

### 2.2 — Déployer l'API Django

1. Cliquez **New** → **Web Service**
2. Connectez votre repo GitHub `MBN-Global-Education`
3. Configurez :

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `mbn-api` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn mbn_backend.wsgi:application` |
| **Plan** | **Free** |

4. Dans la section **Environment Variables**, ajoutez :

| Clé | Valeur |
|-----|--------|
| `DATABASE_URL` | *(collez l'Internal Database URL de l'étape 2.1)* |
| `DJANGO_SECRET_KEY` | *(inventez une longue clé aléatoire, ex: `mbn-prod-s3cr3t-k3y-2026-xxxxx`)* |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | `.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://votre-app.vercel.app` |
| `PYTHON_VERSION` | `3.11.5` |

5. Cliquez **Create Web Service**
6. Attendez le déploiement (~5 min, le `build.sh` va installer les dépendances, créer les tables et remplir la base)
7. Notez l'URL de votre API, ex : `https://mbn-api-xxxx.onrender.com`
8. Testez : ouvrez `https://mbn-api-xxxx.onrender.com/api/health/` — vous devez voir `{"status": "ok"}`

---

## ÉTAPE 3 : Déployer le Frontend sur Vercel (gratuit)

1. Allez sur https://vercel.com/new
2. Importez votre repo GitHub `MBN-Global-Education`
3. Configurez :

| Paramètre | Valeur |
|-----------|--------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |

4. Dans **Environment Variables**, ajoutez :

| Clé | Valeur |
|-----|--------|
| `VITE_API_URL` | `https://mbn-api-xxxx.onrender.com/api` |

> Remplacez `mbn-api-xxxx` par votre vraie URL Render de l'étape 2.

5. Cliquez **Deploy**
6. En ~1 minute votre site est en ligne !
7. Notez l'URL, ex : `https://mbn-global-education.vercel.app`

---

## ÉTAPE 4 : Connecter les deux

Après le déploiement Vercel, retournez sur **Render** :

1. Allez dans votre Web Service `mbn-api`
2. Allez dans **Environment**
3. Modifiez la variable `CORS_ALLOWED_ORIGINS` :
   - Mettez l'URL exacte de votre site Vercel, ex : `https://mbn-global-education.vercel.app`
4. Cliquez **Save Changes**
5. Render va redéployer automatiquement (~2 min)

---

## C'est fait !

Votre site est maintenant accessible par tout le monde sur :
**https://mbn-global-education.vercel.app** (ou le nom que Vercel vous donne)

### Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| sarah@mbn.edu | password123 | Étudiant |
| mboussi@mbn.edu | password123 | Directeur |
| aty@mbn.edu | password123 | Professeur |
| ketsia.c@mbn.edu | password123 | Étudiant |
| sofia@mbn.edu | password123 | Admin |

---

## Notes importantes

### Render gratuit — mise en veille
Le serveur Render gratuit se met en **veille après 15 minutes d'inactivité**. La première requête après la veille prend ~30 secondes pour le réveiller. C'est normal. Vercel n'a pas ce problème.

### Mettre à jour le site
Pour mettre à jour le site après des modifications :

```bash
cd ~/Desktop/MBN-Global-Education
git add .
git commit -m "Description des changements"
git push
```

Render et Vercel redéployent **automatiquement** à chaque `git push`.

### Variables d'environnement résumé

**Render (Backend)** :
- `DATABASE_URL` — URL de connexion PostgreSQL
- `DJANGO_SECRET_KEY` — Clé secrète Django (ne jamais la partager)
- `DJANGO_DEBUG` — `False` en production
- `DJANGO_ALLOWED_HOSTS` — `.onrender.com`
- `CORS_ALLOWED_ORIGINS` — URL du frontend Vercel
- `PYTHON_VERSION` — `3.11.5`

**Vercel (Frontend)** :
- `VITE_API_URL` — URL de l'API Render + `/api`

### Nom de domaine personnalisé
Pour un nom de domaine personnalisé (ex: `mbn-education.com`) :
- Achetez le domaine chez un registrar (OVH, Namecheap, etc.)
- Configurez-le dans **Vercel** → Settings → Domains
- Mettez à jour `CORS_ALLOWED_ORIGINS` sur Render avec le nouveau domaine
