#!/bin/bash

echo "🔄 Restauration schwager.fr..."

# Lister les backups disponibles
echo "📦 Backups disponibles :"
ls -lt /var/www/schwager.fr-backup-* | head -10

# Demander confirmation
echo ""
read -p "Voulez-vous restaurer le backup le plus récent ? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    # Backup le plus récent
    LATEST_BACKUP=$(ls -dt /var/www/schwager.fr-backup-* | head -n 1)
    echo "📁 Restauration depuis : $LATEST_BACKUP"
    
    # Sauvegarder l'état actuel
    CURRENT_BACKUP="/var/www/schwager.fr-before-restore-$(date +%Y%m%d-%H%M%S)"
    echo "💾 Sauvegarde de l'état actuel vers : $CURRENT_BACKUP"
    sudo cp -r /var/www/schwager.fr "$CURRENT_BACKUP"
    
    # Restaurer
    sudo rm -rf /var/www/schwager.fr
    sudo cp -r "$LATEST_BACKUP" /var/www/schwager.fr
    
    # Permissions
    sudo chown -R www-data:www-data /var/www/schwager.fr
    
    # Recharger Nginx
    sudo systemctl reload nginx
    
    echo "✅ Restauration terminée avec succès !"
    echo "🌐 Vérifiez : https://schwager.fr"
else
    echo "❌ Restauration annulée"
fi
