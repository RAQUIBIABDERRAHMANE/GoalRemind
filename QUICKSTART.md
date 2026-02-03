# 🚀 GoalRemind - Quick Start

Suivez ces étapes pour avoir l'application fonctionnelle en 5 minutes !

## 1️⃣ Installation (1 minute)

```bash
npm install
```

## 2️⃣ Configuration (2 minutes)

### Générer les clés VAPID

```bash
npx tsx scripts/generate-vapid-keys.ts
```

### Générer le secret de l'API

```bash
npx tsx scripts/generate-job-secret.ts
```

### Copier les valeurs dans .env.local

Les deux commandes ci-dessus affichent les valeurs à copier. Créez un fichier `.env.local` et collez-y les résultats.

Exemple :
```env
DATABASE_URL=./data/goalremind.db

NEXT_PUBLIC_VAPID_PUBLIC_KEY=BBxxx...
VAPID_PRIVATE_KEY=xxx...
VAPID_SUBJECT=mailto:votre-email@exemple.com

JOB_API_SECRET=xxx...

NOTIFICATION_CHECK_MINUTES=5
```

## 3️⃣ Base de données (1 minute)

```bash
npm run db:generate
npm run db:migrate
```

## 4️⃣ Lancer l'application (30 secondes)

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) 🎉

## 5️⃣ Premier usage (1 minute)

1. **Créer un rappel** : Cliquez sur "+ Rappel" dans le tableau de bord
2. **Créer un objectif** : Cliquez sur "+ Objectif"
3. **Activer les notifications** : Allez dans Paramètres → Activer les notifications
4. **Tester** : Cliquez sur "Tester la notification"

## 📱 Installer comme PWA (optionnel)

### Sur Chrome Desktop
- Cliquez sur l'icône d'installation dans la barre d'adresse

### Sur mobile
- Ajoutez à l'écran d'accueil depuis le menu du navigateur

## 🔔 Activer les notifications automatiques (optionnel)

Pour envoyer automatiquement des notifications pour les rappels à venir, ajoutez ce cron job :

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne (vérifier chaque minute)
* * * * * curl -X POST "http://localhost:3000/api/jobs/send-due-reminders?token=VOTRE_SECRET" > /dev/null 2>&1
```

Remplacez `VOTRE_SECRET` par la valeur de `JOB_API_SECRET` dans votre `.env.local`.

## ✅ C'est tout !

Vous avez maintenant une application complète de gestion de rappels et d'objectifs avec :
- ✅ Interface moderne et responsive
- ✅ Base de données SQLite
- ✅ PWA installable
- ✅ Notifications push
- ✅ Fonctionne hors ligne

## 🆘 Besoin d'aide ?

Consultez :
- [README.md](README.md) - Documentation complète
- [SETUP.md](SETUP.md) - Guide de configuration détaillé
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guide de déploiement en production

Bon développement ! 🎯
