#!/bin/bash

echo "🚀 Déploiement schwager.fr en cours..."

# Variables
SOURCE="/home/dev/projects/schwager-fr"
TARGET="/var/www/schwager.fr"
AUTH_TARGET="/var/www/schwager.fr/auth-api"
BACKUP="/var/www/schwager.fr-backup-$(date +%Y%m%d-%H%M%S)"

# Vérifier que le dossier source existe
if [ ! -d "$SOURCE" ]; then
    echo "❌ Erreur: Dossier source $SOURCE introuvable"
    exit 1
fi

# Demander le mot de passe sudo une seule fois au début
echo "🔐 Authentification sudo requise..."
sudo -v

# === ETAPE 1 : Configuration de l'environnement Backend ===
echo "📋 Étape 1: Configuration de l'environnement de production (Backend)..."
cd "$SOURCE/backend/auth-api"
if [ -f ".env.production" ]; then
    cp .env.production .env
    echo "✅ Fichier .env backend configuré pour la production"
else
    echo "❌ Erreur: backend/auth-api/.env.production introuvable"
    exit 1
fi

# === ETAPE 2 : Installation et build du Backend ===
echo "📦 Étape 2: Installation des dépendances npm (Backend)..."
npm install

echo "🗄️ Étape 2.1: Gestion de la base de données..."
echo "🔧 Génération du client Prisma..."
npm run prisma:generate

echo "🔄 Exécution des migrations de base de données..."
npm run prisma:migrate

echo "🌱 Initialisation de la base de données..."
npm run prisma:seed

echo "🏗️ Étape 2.2: Build du backend..."
npm run build

# Vérifier que le build a réussi
if [ ! -f "dist/server.js" ]; then
    echo "❌ Erreur: Build backend échoué, dist/server.js introuvable"
    exit 1
fi
echo "✅ Build backend réussi"

# === ETAPE 3 : Configuration et build du Frontend ===
echo "🌐 Étape 3: Configuration et build du frontend..."
cd "$SOURCE/frontend"

# Configurer les variables d'environnement pour la production
if [ -f ".env.production" ]; then
    cp .env.production .env
    echo "✅ Fichier .env frontend configuré pour la production"
else
    echo "⚠️ Pas de .env.production pour le frontend, utilisation des variables par défaut"
fi

echo "📦 Installation des dépendances npm (Frontend)..."
npm install

echo "🏗️ Build du frontend..."
npx vite build 2>/dev/null || {
    echo "⚠️ Build avec TypeScript échoué, tentative avec Vite seul..."
    npx vite build
}

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Build frontend échoué, dossier dist introuvable"
    exit 1
fi
echo "✅ Build frontend réussi"

# === ETAPE 4 : Arrêt de l'ancienne API ===
echo "🛑 Étape 4: Arrêt de l'ancienne API..."
sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 delete auth-api 2>/dev/null || true
echo "✅ Ancienne API arrêtée"

# === ETAPE 5 : Backup de l'ancien site et API ===
echo "📦 Étape 5: Backup de l'ancien site et API..."
if [ -d "$TARGET" ]; then
    sudo cp -r "$TARGET" "$BACKUP"
    echo "✅ Backup créé: $BACKUP"
else
    echo "⚠️ Aucun site existant à sauvegarder"
fi

# === ETAPE 6 : Copie du nouveau frontend ===
echo "📁 Étape 6: Déploiement du nouveau frontend..."

# Créer le dossier target s'il n'existe pas
sudo mkdir -p "$TARGET"

# Copier le frontend buildé vers la racine du site
echo "🌐 Synchronisation du frontend..."
sudo rsync -av --delete \
    "$SOURCE/frontend/dist/" "$TARGET/"

echo "✅ Frontend déployé"

# === ETAPE 7 : Copie de l'API ===
echo "📁 Étape 7: Déploiement de l'API..."

# Création du dossier auth-api
sudo mkdir -p "$AUTH_TARGET"

# Copie de l'API complète (avec node_modules et dist)
echo "🔧 Synchronisation de l'API..."
sudo rsync -av --delete \
    --exclude '.git' \
    --exclude '.idea' \
    --exclude '*.log' \
    --exclude '.env.local' \
    --exclude 'docker-compose.yml' \
    --exclude 'README.md' \
    "$SOURCE/backend/auth-api/" "$AUTH_TARGET/"

echo "✅ API synchronisée"

# === ETAPE 8 : Modification des permissions ===
echo "🔐 Étape 8: Ajustement des permissions..."
sudo chown -R www-data:www-data "$TARGET"
sudo find "$TARGET" -type f -exec chmod 644 {} \;
sudo find "$TARGET" -type d -exec chmod 755 {} \;
echo "✅ Permissions ajustées"

# === ETAPE 9 : Démarrage de l'application avec PM2 ===
echo "🚀 Étape 9: Démarrage de l'application avec PM2..."
cd "$AUTH_TARGET"

# Démarrer l'API avec PM2
sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 start dist/server.js --name "auth-api" --env production

# Sauvegarder la configuration PM2
sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 save

echo "⏳ Attente de 3 secondes pour le démarrage..."
sleep 3

# === ETAPE 10 : Test de l'API ===
echo "🧪 Étape 10: Test de l'API..."
if curl -s http://localhost:4000/auth-api/healthcheck | grep -q "OK"; then
    echo "✅ API répond correctement"
    API_STATUS="success"
else
    echo "⚠️ API ne répond pas comme attendu"
    echo "📋 Logs PM2:"
    sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 logs auth-api --lines 10 --nostream
    API_STATUS="failed"
fi

# === ETAPE 11 : Test du frontend ===
echo "🧪 Étape 11: Test du frontend..."
if [ -f "$TARGET/index.html" ]; then
    echo "✅ Frontend déployé correctement"
    FRONTEND_STATUS="success"
else
    echo "❌ Frontend non trouvé"
    FRONTEND_STATUS="failed"
fi

# === ETAPE 12 : Gestion post-déploiement ===
echo "🔄 Étape 12: Gestion post-déploiement..."

if [ "$API_STATUS" == "success" ] && [ "$FRONTEND_STATUS" == "success" ]; then
    echo "✅ Déploiement réussi, nettoyage des anciens backups..."
    
    # Redémarrer Nginx
    if systemctl is-active --quiet nginx; then
        echo "🔄 Rechargement Nginx..."
        sudo systemctl reload nginx
    fi
    
    # Nettoyer les anciens backups (garder seulement les 5 derniers)
    sudo find /var/www/ -name "schwager.fr-backup-*" -type d | sort | head -n -5 | sudo xargs rm -rf
    
    echo ""
    echo "🎉 ========== DÉPLOIEMENT RÉUSSI =========="
    echo "🌐 Site principal    : https://schwager.fr"
    echo "🔧 API auth-api      : https://schwager.fr/auth-api/healthcheck"
    echo "📚 Documentation API : https://schwager.fr/auth-api-docs"
    echo ""
    echo "📊 Commandes utiles :"
    echo "   Status PM2        : sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 status"
    echo "   Logs PM2          : sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 logs auth-api"
    echo "   Restart API       : sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 restart auth-api"
    echo ""
    echo "📦 Backup créé       : $BACKUP"
    echo "🧹 Anciens backups   : $(sudo find /var/www/ -name "schwager.fr-backup-*" -type d | wc -l) gardés (max 5)"
    
else
    echo "❌ Déploiement échoué, restauration du backup..."
    
    # Vérifier que le script de restauration existe
    if [ -f "/home/dev/restore.sh" ]; then
        echo "🔄 Exécution du script de restauration..."
        /home/dev/restore.sh
        echo "✅ Restauration terminée"
    else
        echo "⚠️ Script de restauration non trouvé (/home/dev/restore.sh)"
        echo "💡 Restauration manuelle nécessaire avec: sudo cp -r $BACKUP/* $TARGET/"
    fi
    
    echo ""
    echo "❌ ========== DÉPLOIEMENT ÉCHOUÉ =========="
    echo "📦 Backup disponible : $BACKUP"
    echo "📋 Vérifiez les logs : sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 logs auth-api"
    echo "🔄 Status PM2        : sudo -u www-data PM2_HOME=/var/www/.pm2 pm2 status"
    
    exit 1
fi
