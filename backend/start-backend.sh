#!/bin/bash
# Fully detach from the launching shell by using setsid + double fork.
# This makes the server survive even when the parent bash exits.
cd /home/kinshuk/luxe-perfume/backend
export DJANGO_SETTINGS_MODULE=config.settings_local
LOG=/home/kinshuk/luxe-perfume/backend/logs/django.log

# Truncate log
: > "$LOG"

# Start a new session and run in the background
setsid bash -c "exec python3 manage.py runserver 0.0.0.0:8000 --noreload >> '$LOG' 2>&1" </dev/null &
disown
exit 0
