#!/bin/bash

echo "🚀 Déploiement ultra-simple schwager.fr..."

# Variables
SOURCE="/home/dev/projects/schwager-fr"
TARGET="/var/www/schwager.fr"

# Authentification sudo
sudo -v

# 1. Arrêt ancien
echo "🛑 Arrêt ancien..."
sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 delete auth-api 2>/dev/null || true

# 2. Copie nouveau
echo "📁 Copie nouveau..."
sudo rm -rf "$TARGET"/*
sudo rsync -av "$SOURCE/" "$TARGET/"
sudo cp -r "$TARGET/frontend/dist/"* "$TARGET/"


# 3. Permissions
echo "🔐 Permissions..."
sudo chown -R www-data:www-data "$TARGET"

# 4. Lancement backend
echo "🚀 Lancement backend..."
cd "$TARGET/backend/auth-api"
sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 start dist/server.js --name "auth-api"

# 5. Lancement frontend (déjà copié)
echo "🔄 Reload Nginx..."
sudo systemctl reload nginx

echo "✅ Terminé !"
