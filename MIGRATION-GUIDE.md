# Guide de Migration vers Docker

Guide pour migrer ton déploiement actuel vers la nouvelle architecture Docker sans interrompre le service.

## 🎯 Stratégie de Migration

### Phase 1 : Préparation (sans interruption)
1. Setup GitHub secrets
2. Modifier configuration Nginx
3. Préparer l'environnement Docker

### Phase 2 : Migration (interruption minimale)
1. Arrêter les anciens services
2. Démarrer les nouveaux conteneurs Docker
3. Vérifier le fonctionnement

## 📋 Étapes détaillées

### 1. Configuration GitHub Secrets

Dans **GitHub** → **Settings** → **Secrets and variables** → **Actions** → **Repository secrets**, ajoute :

```bash
VPS_HOST=ton-ip-vps-ou-domaine
VPS_USER=ton-utilisateur-ssh
VPS_SSH_KEY=ta-clé-privée-ssh-complète
```

### 2. Modification Nginx sur le VPS

Remplace ta configuration dans `/etc/nginx/sites-available/schwager.fr` :

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name schwager.fr www.schwager.fr;
    return 301 https://schwager.fr$request_uri;
}

# Site principal HTTPS
server {
    listen 443 ssl http2;
    server_name schwager.fr www.schwager.fr;
    
    # Certificats SSL IONOS (inchangé)
    ssl_certificate /etc/nginx/ssl/schwager.fr.fullchain.crt;
    ssl_certificate_key /etc/nginx/ssl/schwager.fr.key;
    
    # Configuration SSL moderne (inchangé)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de sécurité (inchangé)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Client max body size pour uploads
    client_max_body_size 50M;

    # API - NOUVELLE CONFIGURATION (proxy vers conteneur)
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Documentation API - NOUVELLE CONFIGURATION
    location /api-docs {
        proxy_pass http://localhost:4000/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads - NOUVELLE CONFIGURATION
    location /uploads/ {
        proxy_pass http://localhost:4000/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # WebSocket support - NOUVEAU
    location /socket.io/ {
        proxy_pass http://localhost:4000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
    }

    # Frontend React - NOUVELLE CONFIGURATION (proxy vers conteneur)
    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle client-side routing
        proxy_intercept_errors on;
        error_page 404 = @fallback;
    }

    # Fallback pour React Router
    location @fallback {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Préparation sur le VPS

```bash
# Se connecter au VPS
ssh user@ton-vps

# Créer le répertoire de déploiement
sudo mkdir -p /var/www/schwager-fr
sudo chown $USER:$USER /var/www/schwager-fr
cd /var/www/schwager-fr

# Cloner le repository (nouvelle architecture)
git clone https://github.com/ton-username/schwager-fr.git .

# Vérifier que .env.production existe
ls -la backend/.env.production

# Installer Docker et Docker Compose (si pas déjà fait)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Se déconnecter et reconnecter pour activer le groupe docker
exit
ssh user@ton-vps
```

### 4. Test de la configuration

```bash
# Tester la nouvelle config Nginx
sudo nginx -t

# Si OK, recharger Nginx
sudo systemctl reload nginx
```

## 🚀 Migration en Production

### Phase A : Arrêt des anciens services

```bash
# Sur le VPS, arrêter l'ancien backend (ajuste selon ton setup actuel)
sudo systemctl stop ton-ancien-service-backend
# ou 
pkill -f "node.*server"

# Arrêter l'ancien frontend si il y en a un
sudo systemctl stop ton-ancien-service-frontend
```

### Phase B : Démarrage Docker

```bash
cd /var/www/schwager-fr

# Copier la config de production
cp backend/.env.production backend/.env

# Démarrer les services Docker
docker-compose -f docker-compose.prod.yml up -d

# Vérifier que tout fonctionne
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs
```

### Phase C : Vérification

```bash
# Test backend
curl http://localhost:4000/api/auth/me

# Test frontend
curl http://localhost:3000/health

# Test via HTTPS
curl https://schwager.fr/api/auth/me
curl https://schwager.fr/
```

## 📊 Différences importantes

### Avant (architecture actuelle)
- Backend : Service système direct sur port 4000
- Frontend : Fichiers statiques dans `/var/www/schwager.fr`
- API : Proxy vers `/auth-api` → `localhost:4000/auth-api`

### Après (nouvelle architecture Docker)
- Backend : Conteneur Docker sur port 4000
- Frontend : Conteneur Docker sur port 3000
- API : Proxy vers `/api` → `localhost:4000/api`

### Changements d'URLs

| Ancien | Nouveau |
|--------|---------|
| `/auth-api/*` | `/api/*` |
| `/auth-api-docs` | `/api-docs` |
| Fichiers statiques directs | Proxy vers conteneur frontend |

## ⚠️ Points d'attention

1. **Base de données** : Reste la même, pas de migration nécessaire
2. **Certificats SSL** : Restent inchangés
3. **Uploads** : Seront dans le volume Docker, migration automatique
4. **URLs API** : Changent de `/auth-api` vers `/api`

## 🔄 Rollback si problème

```bash
# Arrêter Docker
docker-compose -f docker-compose.prod.yml down

# Remettre l'ancienne config Nginx
sudo cp /etc/nginx/sites-available/schwager.fr.backup /etc/nginx/sites-available/schwager.fr
sudo systemctl reload nginx

# Redémarrer les anciens services
sudo systemctl start ton-ancien-service
```

Prêt pour la migration ? 🚀