# Schwager Plant Monitoring System

Système de monitoring intelligent pour plantes connectées avec capteurs IoT, contrôles automatisés et interface web moderne.

##  Fonctionnalités

- **Monitoring temps réel** - 6 types de capteurs (température, humidité, lumière, etc.)
- **Contrôles automatisés** - Pompe à eau et vaporisateur avec programmation
- **Interface web moderne** - Dashboard React avec graphiques et notifications
- **API REST complète** - Backend Node.js avec WebSocket et authentification
- **Photos de plantes** - Capture et galerie avec module Raspberry Pi
- **Streaming vidéo** - Surveillance en temps réel RTSP
- **Déploiement automatisé** - CI/CD avec Docker et GitHub Actions

## Architecture

```
schwager-fr/
├── backend/          # API Node.js/TypeScript + Prisma
├── frontend/         # Application React/TypeScript + Vite
├── nginx/            # Configuration reverse proxy
├── .github/          # CI/CD GitHub Actions
└── docs/             # Documentation
```

## Démarrage rapide

### Développement

```bash
# Cloner le repository
git clone https://github.com/your-username/schwager-fr.git
cd schwager-fr

# Backend
cd backend
npm install
docker-compose up -d  # Base de données PostgreSQL
npm run dev

# Frontend (nouveau terminal)
cd frontend
npm install
npm run dev
```

### Production

```bash
# Déploiement automatique via GitHub Actions
git push origin main

# Ou déploiement manuel
docker-compose -f docker-compose.prod.yml up -d
```

##  Documentation

- **[Backend API](./backend/README.md)** - Installation, configuration et endpoints
- **[Frontend](./frontend/README.md)** - Interface utilisateur et développement
- **[Déploiement](./DEPLOYMENT.md)** - CI/CD, Docker et production

## Technologies

- **Backend** : Node.js, TypeScript, Express, Prisma, PostgreSQL
- **Frontend** : React, TypeScript, Vite, TailwindCSS, HeroUI
- **IoT** : Raspberry Pi, capteurs environnementaux, WebSocket
- **DevOps** : Docker, GitHub Actions, Nginx
- **Sécurité** : JWT, Argon2, CORS, Rate limiting

## URLs

- **Production** : https://schwager.fr
- **API Docs** : https://schwager.fr/api-docs
- **Dev Frontend** : http://localhost:3000
- **Dev Backend** : http://localhost:4000

## License

ISC