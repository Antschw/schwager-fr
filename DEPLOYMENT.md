# Schwager Plant Monitoring - Déploiement & CI/CD

Guide complet pour le déploiement automatisé de l'application Schwager sur VPS avec Docker et GitHub Actions.

## 📋 Table des matières

- [Architecture de déploiement](#-architecture-de-déploiement)
- [Configuration initiale](#-configuration-initiale)
- [Déploiement automatique](#-déploiement-automatique)
- [Gestion des conteneurs](#-gestion-des-conteneurs)
- [Monitoring et logs](#-monitoring-et-logs)
- [Dépannage](#-dépannage)

## 🏗 Architecture de déploiement

### Structure Docker

```
schwager-fr/
├── backend/
│   ├── Dockerfile              # Image backend Node.js
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # Image frontend React + Nginx
│   ├── nginx.conf              # Configuration Nginx frontend
│   └── .dockerignore
├── nginx/
│   ├── nginx.conf              # Configuration Nginx principal
│   └── conf.d/
│       └── schwager.conf       # Reverse proxy configuration
├── docker-compose.prod.yml     # Orchestration production
└── .github/workflows/
    └── deploy.yml              # CI/CD GitHub Actions
```

### Services Docker

1. **schwager-backend** - API Node.js/TypeScript
2. **schwager-frontend** - Application React avec Nginx
3. **schwager-proxy** - Reverse proxy Nginx
4. **Réseau** - schwager-network (bridge)
5. **Volume** - uploads_data (stockage persistant)

## ⚙️ Configuration initiale

### 1. Secrets GitHub

Configurez les secrets suivants dans GitHub → Settings → Secrets and variables → Actions :

```bash
VPS_HOST=your-vps-ip-or-domain
VPS_USER=your-ssh-user
VPS_SSH_KEY=your-private-ssh-key
GITHUB_TOKEN=ghp_xxxxxxxxxxxx  # Token avec packages:write
```

### 2. Préparation du VPS

```bash
# Se connecter au VPS
ssh user@your-vps

# Installer Docker et Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Créer le répertoire de déploiement
sudo mkdir -p /var/www/schwager-fr
sudo chown $USER:$USER /var/www/schwager-fr
cd /var/www/schwager-fr

# Cloner le repository
git clone https://github.com/your-username/schwager-fr.git .

# Configurer l'environnement de production
cp backend/.env.production backend/.env
```

### 3. Configuration DNS (optionnel)

```bash
# Configuration Nginx pour domaine personnalisé
sudo apt install nginx
sudo nano /etc/nginx/sites-available/schwager.fr

# Rediriger le port 80 vers Docker
server {
    listen 80;
    server_name schwager.fr www.schwager.fr;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🚀 Déploiement automatique

### Workflow CI/CD

Le déploiement s'active automatiquement sur chaque push vers `main` :

1. **Détection des changements** - Identifie les composants modifiés
2. **Build conditionnel** - Compile uniquement les parties modifiées
3. **Push vers registry** - Pousse les images vers GitHub Container Registry
4. **Déploiement VPS** - Met à jour les services concernés

### Déclencheurs de déploiement

| Changement | Action |
|------------|--------|
| `backend/**` | Rebuild et redéploie backend uniquement |
| `frontend/**` | Rebuild et redéploie frontend uniquement |
| `nginx/**` | Redémarre reverse proxy |
| `docker-compose.prod.yml` | Redéploie tous les services |
| Les deux | Redéploie backend + frontend |

### Commandes manuelles

```bash
# Déploiement manuel complet
cd /var/www/schwager-fr
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Déploiement backend seul
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# Déploiement frontend seul
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
```

## 🐳 Gestion des conteneurs

### Commandes utiles

```bash
# Voir les services actifs
docker-compose -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart backend

# Mettre à jour les images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Nettoyer les images non utilisées
docker image prune -f
docker system prune -f
```

### Health Checks

Chaque service dispose d'un health check :

```bash
# Vérifier l'état des services
docker-compose -f docker-compose.prod.yml ps

# Tester manuellement
curl http://localhost:4000/api/auth/me  # Backend
curl http://localhost:3000/health       # Frontend
curl http://localhost:80/health         # Reverse proxy
```

## 📊 Monitoring et logs

### Logs centralisés

```bash
# Logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f

# Logs d'un service spécifique
docker logs schwager-backend -f
docker logs schwager-frontend -f
docker logs schwager-proxy -f

# Logs avec timestamps
docker-compose -f docker-compose.prod.yml logs -t
```

### Monitoring des ressources

```bash
# Utilisation des ressources
docker stats

# Espace disque des volumes
docker system df

# Informations détaillées
docker inspect schwager-backend
```

## 🔧 Dépannage

### Problèmes courants

#### Service ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs service-name

# Vérifier la configuration
docker-compose -f docker-compose.prod.yml config

# Redémarrer complètement
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

#### Base de données inaccessible

```bash
# Vérifier la connectivité réseau
docker network ls
docker network inspect schwager-fr_schwager-network

# Tester la connexion depuis le backend
docker exec schwager-backend npx prisma db pull
```

#### Images non trouvées

```bash
# Se reconnecter au registry
echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin

# Nettoyer le cache
docker image prune -a
docker-compose -f docker-compose.prod.yml pull
```

#### Problèmes de permissions

```bash
# Vérifier les permissions des volumes
docker exec schwager-backend ls -la /app/public/uploads

# Recréer les volumes si nécessaire
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### Rollback

```bash
# Revenir à la version précédente
git log --oneline -5
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Revenir au main
git checkout main
```

### Maintenance

```bash
# Mise à jour régulière
docker system prune -f                    # Nettoyer weekly
docker image ls | grep "<none>"           # Vérifier images orphelines
docker volume ls | grep schwager          # Vérifier volumes

# Backup des uploads
docker cp schwager-backend:/app/public/uploads ./uploads-backup-$(date +%Y%m%d)
```

## 🔗 URLs de production

- **Frontend** : https://schwager.fr
- **API Backend** : https://schwager.fr/api
- **Documentation** : https://schwager.fr/api-docs
- **Health Check** : https://schwager.fr/health

---

**Schwager Plant Monitoring System** - CI/CD & Deployment Guide