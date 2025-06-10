#!/bin/bash
echo "🚀 Déploiement via IDE..."

# Variables
SOURCE="/home/dev/projects/schwager-fr"
TARGET="/var/www/schwager.fr"

# Vérifier que le dossier source existe
if [ ! -d "$SOURCE" ]; then
    echo "❌ Erreur: Dossier source $SOURCE introuvable"
    exit 1
fi

# Synchronisation simple sans changer les permissions
echo "📁 Synchronisation des fichiers..."
rsync -av --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.idea' \
    --exclude '*.log' \
    --no-perms \
    --no-owner \
    --no-group \
    "$SOURCE/" "$TARGET/"

# Vérifier que les fichiers sont bien là
if [ -f "$TARGET/index.html" ]; then
    echo "✅ Synchronisation terminée avec succès !"
    echo "🌐 Site accessible sur : https://schwager.fr"
else
    echo "❌ Erreur lors de la synchronisation"
    exit 1
fi
