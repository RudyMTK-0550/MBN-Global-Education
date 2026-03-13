#!/usr/bin/env bash
set -o errexit

# Installer dans le MEME Python qui lancera gunicorn
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py makemigrations api
python manage.py migrate

# Seed si la base est vide
python -c "
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mbn_backend.settings')
django.setup()
from api.models import User
if User.objects.count() == 0:
    exec(open('seed.py').read())
    print('Database seeded!')
else:
    print('Database already has data, skipping seed.')
"
