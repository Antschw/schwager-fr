# Configuration SSH pour Déploiement

Guide pour configurer l'authentification SSH pour le déploiement automatique.

## 🔑 Option 1 : Clés SSH (RECOMMANDÉ)

### Étape 1 : Générer une clé SSH sur ton ordinateur

```bash
# Générer une nouvelle clé SSH spécifiquement pour le déploiement
ssh-keygen -t ed25519 -C "deploy@schwager-fr" -f ~/.ssh/schwager_deploy

# Ou avec RSA si ed25519 n'est pas supporté
ssh-keygen -t rsa -b 4096 -C "deploy@schwager-fr" -f ~/.ssh/schwager_deploy
```

Tu auras deux fichiers :
- `~/.ssh/schwager_deploy` (clé privée - pour GitHub)
- `~/.ssh/schwager_deploy.pub` (clé publique - pour le VPS)

### Étape 2 : Installer la clé publique sur le VPS

```bash
# Copier la clé publique vers le VPS
ssh-copy-id -i ~/.ssh/schwager_deploy.pub user@ton-vps

# Ou manuellement :
cat ~/.ssh/schwager_deploy.pub | ssh user@ton-vps "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### Étape 3 : Tester la connexion

```bash
# Tester la connexion avec la nouvelle clé
ssh -i ~/.ssh/schwager_deploy user@ton-vps
```

### Étape 4 : Ajouter la clé privée dans GitHub

```bash
# Afficher la clé privée
cat ~/.ssh/schwager_deploy
```

Copie le contenu complet (y compris `-----BEGIN OPENSSH PRIVATE KEY-----` et `-----END OPENSSH PRIVATE KEY-----`) dans le secret GitHub `VPS_SSH_KEY`.

## 🔐 Option 2 : Authentification par mot de passe (MOINS SÉCURISÉ)

### Modification du workflow GitHub Actions

Si tu veux vraiment utiliser un mot de passe, voici comment modifier le workflow :

#### Secrets GitHub à ajouter :
```
VPS_HOST=ton-ip-vps
VPS_USER=ton-utilisateur
VPS_PASSWORD=ton-mot-de-passe
```

#### Workflow modifié (.github/workflows/deploy.yml) :

```yaml
# Remplacer cette section dans le workflow :

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.VPS_SSH_KEY }}

      - name: Add VPS to known hosts
        run: |
          ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts

# Par cette section :

      - name: Install sshpass
        run: sudo apt-get install -y sshpass

      - name: Add VPS to known hosts
        run: |
          ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts

# Et remplacer toutes les commandes SSH par :

          # Au lieu de :
          scp deploy.sh ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }}:/tmp/deploy.sh
          ssh ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"

          # Utiliser :
          sshpass -p '${{ secrets.VPS_PASSWORD }}' scp deploy.sh ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }}:/tmp/deploy.sh
          sshpass -p '${{ secrets.VPS_PASSWORD }}' ssh ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"
```

## ⚠️ Problèmes de sécurité avec les mots de passe

1. **Moins sécurisé** : Les mots de passe peuvent être interceptés
2. **Logs** : Le mot de passe pourrait apparaître dans les logs
3. **Rotation** : Plus difficile de changer régulièrement
4. **Accès** : Si quelqu'un accède au repo, il a ton mot de passe

## 🛡️ Sécurisation du VPS pour SSH par mot de passe

Si tu choisis l'option mot de passe, sécurise au moins ton VPS :

```bash
# Sur le VPS, éditer la config SSH
sudo nano /etc/ssh/sshd_config

# Ajouter/modifier ces lignes :
PasswordAuthentication yes
PermitRootLogin no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2

# Redémarrer SSH
sudo systemctl restart sshd

# Optionnel : Configurer fail2ban pour bloquer les tentatives de brute force
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🎯 Recommandation finale

**Je recommande fortement l'Option 1 (clés SSH)** pour ces raisons :

✅ **Plus sécurisé**
✅ **Standard de l'industrie**
✅ **Pas de mots de passe en clair**
✅ **Facilement révocable**
✅ **Supporté nativement par GitHub Actions**

Les clés SSH ne sont pas fournies par ton provider, tu les génères toi-même et tu les installes sur le serveur.

## 🚀 Prochaines étapes

1. **Choisir** ton option (SSH keys recommandé)
2. **Configurer** l'authentification
3. **Tester** la connexion
4. **Configurer** les secrets GitHub
5. **Lancer** le premier déploiement

Quelle option préfères-tu ?