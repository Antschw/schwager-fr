# Schwager Plant Monitoring Backend API

Backend API pour le système de monitoring de plantes connectées avec gestion d'authentification, capteurs IoT, streaming vidéo et contrôles automatisés.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Lancement](#-lancement)
- [API Endpoints](#-api-endpoints)
- [Base de données](#-base-de-données)
- [Documentation](#-documentation)
- [Structure du projet](#-structure-du-projet)
- [Scripts disponibles](#-scripts-disponibles)

## 🌟 Fonctionnalités

### Authentification & Gestion des utilisateurs
- **JWT Authentication** avec tokens d'accès et de rafraîchissement
- **Gestion des rôles** (ADMIN, APP1_USER, APP2_USER, USER)
- **Cookies sécurisés** HTTP-only pour le stockage des tokens
- **Hachage Argon2** pour les mots de passe
- **API de gestion des profils** (mise à jour, changement de mot de passe)

### Monitoring des capteurs IoT
- **6 types de capteurs** pris en charge :
  - 🌡️ Température ambiante
  - 💧 Humidité du sol
  - 🌫️ Humidité de l'air
  - 📊 Pression atmosphérique
  - ☀️ Niveau de luminosité
  - 🚰 Niveau d'eau du réservoir (ultrasonique)
- **Stockage en temps réel** des données capteurs
- **WebSocket** pour les mises à jour live
- **Historique** avec filtrage par dates

### Gestion des plantes
- **CRUD complet** des profils de plantes
- **Upload de photos** avec miniatures automatiques
- **Métadonnées** (espèce, localisation, description)

### Contrôles automatisés
- **Pompe à eau** avec activation manuelle/automatique
- **Vaporisateur/brumisateur** pour l'humidité ambiante
- **Log des actions** avec traçabilité complète
- **Paramètres configurables** (seuils, durées, intervalles)

### Streaming vidéo
- **Stream RTSP** pour surveillance en temps réel
- **Capture de photos** depuis le module Raspberry Pi
- **Gestion multi-streams**

### Calibration des capteurs
- **Offsets et multiplicateurs** par capteur
- **Valeurs min/max** pour les capteurs analogiques
- **Historique des calibrations**

## 🛠 Technologies

- **Runtime** : Node.js + TypeScript
- **Framework** : Express.js
- **Base de données** : PostgreSQL + Prisma ORM
- **Authentification** : JWT + Argon2
- **Validation** : Zod
- **WebSocket** : Socket.IO
- **Documentation** : Swagger/OpenAPI
- **Upload** : Multer + Sharp (redimensionnement)
- **Streaming** : node-rtsp-stream

## 📋 Prérequis

### Développement
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Docker** et **Docker Compose**
- **Git**

### Production
- **Node.js** 18+
- **npm** ou **yarn**
- **PostgreSQL** 14+ (déjà configuré sur le VPS)
- **Git**

## 🚀 Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd schwager-fr/backend
```

2. **Installer les dépendances**
```bash
npm install
```

## ⚙️ Configuration

### 🔧 Mode Développement

1. **Démarrer la base de données avec Docker**
```bash
# Lancer PostgreSQL en conteneur
docker-compose up -d

# Vérifier que le conteneur est actif
docker ps
```

2. **Configuration automatique**
```bash
# Le script dev copie automatiquement .env.local vers .env
# Pas besoin de configuration manuelle
```

3. **Initialiser la base de données**
```bash
# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate

# Créer l'utilisateur admin (optionnel)
npm run prisma:seed
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```
Le serveur démarre sur `http://localhost:4000`

### 🌐 Mode Production

1. **Configuration de l'environnement**
```bash
# Copier le fichier de production
cp .env.production .env
```

2. **Variables d'environnement de production**
Le fichier `.env.production` contient :
- **Base de données** : PostgreSQL déjà installée sur le VPS
- **Secrets JWT** : Clés de 64+ caractères
- **CORS** : Domaine de production configuré
- **Tokens** : Durée de vie sécurisée (5m/1d)

3. **Déploiement**
```bash
# Compiler TypeScript
npm run build

# Appliquer les migrations (si nécessaire)
npm run prisma:migrate

# Lancer le serveur
npm start
```

## 🏃‍♂️ Commandes de lancement

### Développement
```bash
# Démarrer la base de données
docker-compose up -d

# Lancer le serveur (copie automatique .env.local → .env)
npm run dev
```

### Production
```bash
# Utiliser la configuration de production
cp .env.production .env

# Compiler et lancer
npm run build
npm start
```

### Gestion Docker
```bash
# Arrêter la base de données
docker-compose down

# Voir les logs de la base
docker-compose logs postgres

# Redémarrer les conteneurs
docker-compose restart
```

## 📡 API Endpoints

### Authentification
```http
POST   /api/auth/login           # Connexion utilisateur
POST   /api/auth/logout          # Déconnexion
GET    /api/auth/me              # Profil utilisateur actuel
PATCH  /api/auth/me              # Modifier son profil
PATCH  /api/auth/change-password # Changer son mot de passe
```

### Gestion des utilisateurs (Admin)
```http
GET    /api/auth/users                    # Liste des utilisateurs
POST   /api/auth/users                    # Créer un utilisateur
DELETE /api/auth/users/{id}               # Supprimer un utilisateur  
PATCH  /api/auth/users/{id}/change-password # Changer mot de passe utilisateur
```

### Capteurs IoT
```http
POST   /api/plants/sensors/data          # Recevoir données capteurs
GET    /api/plants/sensors/data          # Dernières lectures
GET    /api/plants/sensors/history       # Historique avec filtres
```

### Photos
```http
POST   /api/plants/photos                # Upload photo
GET    /api/plants/photos                # Liste des photos
DELETE /api/plants/photos/{id}           # Supprimer photo
```

### Contrôles
```http
POST   /api/plants/controls/pump         # Activer pompe à eau
POST   /api/plants/controls/sprayer      # Activer vaporisateur
GET    /api/plants/controls/settings     # Paramètres automatisation
PATCH  /api/plants/controls/settings     # Modifier paramètres
```

### Streaming
```http
POST   /api/plants/streaming/start       # Démarrer stream
POST   /api/plants/streaming/stop        # Arrêter stream
GET    /api/plants/streaming/status      # Statut des streams
```

## 🗄️ Base de données

### Modèles principaux

- **User** - Utilisateurs avec rôles
- **Plant** - Profils des plantes
- **SensorReading** - Données des capteurs en temps réel
- **PlantPhoto** - Photos avec métadonnées
- **ActionLog** - Historique des actions (pompe, vaporisateur, etc.)
- **DeviceStatus** - Statut des dispositifs IoT
- **DeviceSettings** - Configuration automatisation
- **DeviceCalibration** - Paramètres de calibration capteurs

### Migrations
```bash
# Créer une nouvelle migration
npx prisma migrate dev --name description-changement

# Appliquer les migrations
npm run prisma:migrate

# Reset de la base (⚠️ perte de données)
npx prisma migrate reset
```

## 📚 Documentation

### Swagger/OpenAPI
La documentation interactive est disponible à l'adresse :
```
http://localhost:4000/api-docs
```

### WebSocket Events
```javascript
// Données capteurs en temps réel
socket.on('sensor:data', (data) => {
  console.log('Nouvelles données capteurs:', data);
});

// Statut des dispositifs
socket.on('device:status', (status) => {
  console.log('Statut dispositif:', status);
});

// Actions en cours
socket.on('action:started', (action) => {
  console.log('Action démarrée:', action);
});

socket.on('action:completed', (action) => {
  console.log('Action terminée:', action);
});
```

## 📁 Structure du projet

```
backend/
├── src/
│   ├── auth/                    # Authentification
│   │   ├── controllers/         # Contrôleurs auth/users
│   │   ├── routes/             # Routes API
│   │   ├── schemas/            # Validation Zod
│   │   └── services/           # Logique métier
│   ├── plants/                 # Monitoring plantes
│   │   ├── controllers/        # Capteurs, photos, contrôles, streaming
│   │   ├── routes/             # Routes API plantes
│   │   └── websockets/         # WebSocket handlers
│   ├── shared/                 # Code partagé
│   │   ├── middleware/         # Auth, validation
│   │   ├── types/              # Types TypeScript
│   │   └── utils/              # Utilitaires (Prisma, etc.)
│   └── server.ts               # Point d'entrée
├── prisma/
│   ├── migrations/             # Migrations base de données
│   ├── schema.prisma           # Schéma Prisma
│   └── seed.ts                 # Données de test
├── public/uploads/             # Fichiers uploadés
└── swagger.json                # Documentation OpenAPI
```

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev                     # Mode développement avec hot-reload

# Production  
npm run build                   # Compiler TypeScript
npm start                       # Lancer en production

# Base de données
npm run prisma:generate         # Générer client Prisma
npm run prisma:migrate          # Appliquer migrations
npm run prisma:seed             # Insérer données de test

# Prisma Studio (interface graphique)
npx prisma studio
```

## 🔒 Sécurité

- **Authentification JWT** avec tokens courts
- **Cookies HTTP-only sécurisés** 
- **Hachage Argon2** des mots de passe
- **Validation stricte** avec Zod
- **CORS configuré** pour le frontend
- **Middleware d'autorisation** par rôles

## 🌐 URLs importantes

- **API Base** : `http://localhost:4000/api`
- **Documentation** : `http://localhost:4000/api-docs`
- **Prisma Studio** : `http://localhost:5555` (après `npx prisma studio`)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📝 License

ISC

---

**Schwager Plant Monitoring System** - Backend API v1.0.0