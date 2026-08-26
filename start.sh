#!/bin/bash
# Inicia backend e frontend juntos para preview
set -e

cleanup() {
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "Iniciando backend em :3001 ..."
(cd backend && npm start) &
BACKEND_PID=$!

sleep 2
echo "Iniciando frontend em :5173 ..."
cd frontend && npm run dev
