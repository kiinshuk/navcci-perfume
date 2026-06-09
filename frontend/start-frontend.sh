#!/bin/bash
# Start the Next.js dev server fully detached.
cd /home/kinshuk/luxe-perfume/frontend
exec </dev/null >/home/kinshuk/luxe-perfume/backend/logs/nextjs.log 2>&1
nohup npm run dev -- --port 3000 --hostname 0.0.0.0 &
disown
