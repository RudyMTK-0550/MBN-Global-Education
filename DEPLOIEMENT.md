# Déployer MBN Global Education — Guide complet

## Prérequis
- Un compte GitHub (gratuit)
- Un compte Render (gratuit) → https://render.com
- Un compte Vercel (gratuit) → https://vercel.com

---

## ÉTAPE 1 : Mettre le projet sur GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau repo nommé `MBN-Global-Education`
3. Dans votre terminal VS Code :

```bash
cd ~/Desktop/MBN-Global-Education
git init
git add .
git commit -m "Projet MBN Global Education - React + Django"
git branch -M main
git remote add origin https://github.com/VOTRE-PSEUDO/MBN-Global-Education.git
git push -u origin main
```

---

## ÉTAPE 2 : Déployer le Backend sur Render (gratuit)

### 2.1 — Créer une base PostgreSQL
1. Allez sur https://dashboard.render.com
2. Cliquez **New** → **PostgreSQL**
3. Nom : `mbn-database`
4. Plan : **Free**
5. Cliquez **Create Database**
6. Copiez l'**Internal Database URL** (vous en aurez besoin)

### 2.2 — Déployer l'API Django
1. Cliquez **New** → **Web Service**
2. Connectez votre repo GitHub `MBN-Global-Education`
3. Configurez :
   - **Name** : `mbn-api`
   - **Root Directory** : `backend`
   - **Runtime** : `Python 3`
   - **Build Command** : `./build.sh`
   - **Start Command** : `gunicorn mbn_backend.wsgi:application`
   - **Plan** : **Free**

4. Ajoutez ces **Variables d'environnement** :

| Clé | Valeur |
|-----|--------|
| `DATABASE_URL` | *(collez l'Internal Database URL de l'étape 2.1)* |
| `DJANGO_SECRET_KEY` | *(inventez une clé longue et aléatoire)* |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | `.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://votre-app.vercel.app` |
| `PYTHON_VERSION` | `3.11.5` |

5. Cliquez **Create Web Service**
6. Attendez le déploiement (~5 min)
7. Notez l'URL de votre API : `https://mbn-api-xxxx.onrender.com`

---

## ÉTAPE 3 : Déployer le Frontend sur Vercel (gratuit)

1. Allez sur https://vercel.com/new
2. Importez votre repo GitHub `MBN-Global-Education`
3. Configurez :
   - **Framework Preset** : `Vite`
   - **Root Directory** : `frontend`

4. Ajoutez cette **Variable d'environnement** :

| Clé | Valeur |
|-----|--------|
| `VITE_API_URL` | `https://mbn-api-xxxx.onrender.com/api` |

*(Remplacez par votre vraie URL Render de l'étape 2)*

5. Cliquez **Deploy**
6. En ~1 minute votre site est en ligne !

---

## ÉTAPE 4 : Connecter les deux

Après le déploiement Vercel, vous aurez une URL comme `https://mbn-global-education.vercel.app`

Retournez sur Render et mettez à jour la variable :
- `CORS_ALLOWED_ORIGINS` → `https://mbn-global-education.vercel.app`

Cliquez **Save** → Render va redéployer automatiquement.

---

## C'est fait !

Votre site est maintenant accessible par tout le monde sur :
**https://mbn-global-education.vercel.app** (ou le nom que Vercel vous donne)

### Comptes de test :
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| sarah@mbn.edu | password123 | Étudiant |
| mboussi@mbn.edu | password123 | Directeur |
| aty@mbn.edu | password123 | Professeur |
| ketsia.c@mbn.edu | password123 | Étudiant |
| sofia@mbn.edu | password123 | Admin |

---

## Notes importantes

- **Render gratuit** : le serveur se met en veille après 15 min d'inactivité. La première requête prend ~30 sec pour le réveiller.
- **Vercel** : pas de mise en veille, toujours rapide.
- Pour un nom de domaine personnalisé (ex: mbn-education.com), vous pouvez le configurer gratuitement dans Vercel.
