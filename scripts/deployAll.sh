#!/bin/bash

echo "🚀 Déploiement complet de schwager.fr en cours..."

# === Variables ===
SOURCE="/home/dev/projects/schwager-fr"
TARGET="/var/www/schwager.fr"
AUTH_TARGET="$TARGET/auth-api"
BACKUP_DIR="/var/www"
BACKUP="${BACKUP_DIR}/schwager.fr-backup-$(date +%Y%m%d-%H%M%S)"

# Authentification sudo
echo "🔐 Authentification sudo requise..."
sudo -v

# === Étape 1 : Arrêt de l'ancien backend ===
echo "🛑 Étape 1 : Arrêt de l'ancienne API..."
sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 delete auth-api 2>/dev/null || true

# === Étape 2 : Backup de l'ancien déploiement ===
echo "📦 Étape 2 : Backup de l'ancien site et API..."
if [ -d "$TARGET" ]; then
  sudo cp -r "$TARGET" "$BACKUP"
  echo "✅ Backup créé : $BACKUP"
else
  echo "⚠️ Aucun déploiement existant à sauvegarder"
fi

# === Étape 3 : Configuration des .env en production ===
# Backend
echo "📋 Étape 3.1 : Configuration .env (Backend)..."
if [ -f "$SOURCE/backend/auth-api/.env.production" ]; then
  cp "$SOURCE/backend/auth-api/.env.production" "$SOURCE/backend/auth-api/.env"
  echo "✅ .env backend configuré"
else
  echo "❌ .env.production introuvable pour le backend"
  exit 1
fi

# Frontend
echo "📋 Étape 3.2 : Configuration .env (Frontend)..."
if [ -f "$SOURCE/frontend/.env.production" ]; then
  cp "$SOURCE/frontend/.env.production" "$SOURCE/frontend/.env"
  echo "✅ .env frontend configuré"
else
  echo "⚠️ .env.production introuvable pour le frontend, utilisation des valeurs par défaut"
fi

# === Étape 4 : Installation et build du backend ===
echo "📦 Étape 4 : Installation et build du Backend..."
cd "$SOURCE/backend/auth-api"
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run build

if [ ! -f "dist/server.js" ]; then
  echo "❌ Build backend échoué"
  exit 1
fi
echo "✅ Build backend réussi"

# === Étape 5 : Installation et build du frontend ===
echo "🌐 Étape 5 : Installation et build du Frontend..."
cd "$SOURCE/frontend"
npm install
npx vite build 2>/dev/null || npx vite build

if [ ! -d "dist" ]; then
  echo "❌ Build frontend échoué"
  exit 1
fi
echo "✅ Build frontend réussi"

# === Étape 6 : Déploiement du backend ===
echo "📁 Étape 6 : Déploiement du Backend..."
sudo mkdir -p "$AUTH_TARGET"
sudo rsync -av --delete \
  --exclude '.git' \
  --exclude '*.log' \
  --exclude '.env.local' \
  "$SOURCE/backend/auth-api/" "$AUTH_TARGET/"

echo "🔐 Ajustement des permissions (Backend)..."
sudo chown -R www-data:www-data "$AUTH_TARGET"
sudo find "$AUTH_TARGET" -type f -exec chmod 644 {} \;
sudo find "$AUTH_TARGET" -type d -exec chmod 755 {} \;

echo "🚀 Démarrage de l'API avec PM2..."
cd "$AUTH_TARGET"
sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 start dist/server.js --name "auth-api" --env production
sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 save
sleep 3

# Vérification de l'API
echo "🧪 Test de l'API..."
if curl -s http://localhost:4000/auth-api/healthcheck | grep -q "OK"; then
  echo "✅ API répond correctement"
else
  echo "❌ API ne répond pas comme attendu"
  sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 logs auth-api --lines 10 --nostream
  exit 1
fi

# === Étape 7 : Déploiement du Frontend ===
echo "📁 Étape 7 : Déploiement du Frontend..."
sudo mkdir -p "$TARGET"
sudo rm -rf "$TARGET"/*
# -- Option A (rsync) --
sudo rsync -av --delete "$SOURCE/frontend/dist/." "$TARGET/" \
    || {
      echo "⚠️ rsync a échoué, bascule en cp"
      sudo cp -r "$SOURCE/frontend/dist/"* "$TARGET/"
    }

echo "🔐 Ajustement des permissions (Frontend)..."
sudo chown -R www-data:www-data "$TARGET"
sudo find "$TARGET" -type f -exec chmod 644 {} \;
sudo find "$TARGET" -type d -exec chmod 755 {} \;

echo "🔄 Reload Nginx..."
sudo systemctl reload nginx

# Vérification du frontend
echo "🧪 Test du Frontend..."
if [ -f "$TARGET/index.html" ]; then
  echo "✅ Frontend accessible"
else
  echo "❌ Frontend non trouvé"
  exit 1
fi

# === Étape 8 : Nettoyage et fin ===
echo "🔄 Étape 8 : Nettoyage des anciens backups (les 5 plus anciens)..."
sudo find "$BACKUP_DIR" -maxdepth 1 -type d -name "schwager.fr-backup-*" | sort | head -n -5 | xargs sudo rm -rf

echo ""
echo "🎉 ========== DÉPLOIEMENT RÉUSSI =========="
echo "🌐 Site : https://schwager.fr"
echo "🔧 API  : https://schwager.fr/auth-api-docs"
exit 0
