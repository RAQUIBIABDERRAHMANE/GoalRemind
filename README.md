# GoalRemind

Une application PWA (Progressive Web App) complète pour gérer vos rappels et objectifs avec notifications push.

## 🚀 Fonctionnalités

### Rappels
- Créer, modifier et supprimer des rappels
- Définir la date/heure, priorité (basse/moyenne/haute) et récurrence (quotidienne/hebdomadaire/mensuelle)
- Actions : marquer comme terminé, reporter (+10 min / +1 heure)
- Filtres : Aujourd'hui, À venir, En retard, Terminés

### Objectifs
- Créer, modifier et supprimer des objectifs
- Types de progression : pourcentage, compteur, liste de tâches
- Page de détails avec suivi de progression et étapes (milestones)
- Statuts : actif, en pause, terminé

### Tableau de bord
- Vue d'ensemble des rappels du jour et en retard
- Aperçu des objectifs actifs avec barres de progression
- Accès rapide pour créer rappels et objectifs

### PWA & Notifications Push
- Application installable sur mobile et desktop
- Fonctionne hors ligne (cache de l'app shell)
- Notifications push pour les rappels à venir
- Job planifié pour envoyer automatiquement les notifications

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : SQLite avec Drizzle ORM
- **Validation** : Zod
- **Notifications** : Web Push API
- **Runtime** : Node.js (pour SQLite)

## 📦 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Générer les clés VAPID pour les notifications push

```bash
npx tsx scripts/generate-vapid-keys.ts
```

Copiez les clés générées dans votre fichier `.env.local`.

### 3. Générer le secret pour l'API de jobs

```bash
npx tsx scripts/generate-job-secret.ts
```

Copiez le secret généré dans votre fichier `.env.local`.

### 4. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Database
DATABASE_URL=./data/goalremind.db

# Push Notifications (généré avec generate-vapid-keys.ts)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_cle_publique_vapid
VAPID_PRIVATE_KEY=votre_cle_privee_vapid
VAPID_SUBJECT=mailto:votre-email@exemple.com

# Job API Secret (généré avec generate-job-secret.ts)
JOB_API_SECRET=votre_secret_token

# Notification Check Interval (minutes)
NOTIFICATION_CHECK_MINUTES=5
```

### 5. Générer et exécuter les migrations

```bash
# Générer les migrations
npm run db:generate

# Exécuter les migrations
npm run db:migrate
```

### 6. Lancer l'application en mode développement

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 🏗️ Structure du projet

```
.
├── app/
│   ├── (dashboard)/          # Pages principales
│   │   ├── page.tsx          # Tableau de bord
│   │   ├── reminders/        # Gestion des rappels
│   │   ├── goals/            # Gestion des objectifs
│   │   └── settings/         # Paramètres et notifications
│   ├── api/                  # API Routes
│   │   ├── reminders/        # CRUD rappels
│   │   ├── goals/            # CRUD objectifs
│   │   ├── milestones/       # CRUD étapes
│   │   ├── push/             # Gestion des notifications push
│   │   └── jobs/             # Jobs planifiés
│   ├── globals.css
│   └── layout.tsx
├── components/               # Composants réutilisables
│   ├── Navigation.tsx
│   ├── Modal.tsx
│   └── Icons.tsx
├── lib/
│   ├── db/                   # Configuration base de données
│   │   ├── index.ts
│   │   └── schema.ts         # Schémas Drizzle
│   └── validators/           # Schémas de validation Zod
│       └── index.ts
├── public/
│   ├── manifest.json         # Manifest PWA
│   ├── sw.js                 # Service Worker
│   └── icon-*.png            # Icônes PWA
├── scripts/
│   ├── migrate.ts            # Script de migration
│   ├── generate-vapid-keys.ts
│   └── generate-job-secret.ts
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

## 🗄️ Schéma de base de données

### reminders
- id, title, notes, dueAt, priority, repeat, status
- lastNotifiedAt (pour dédupliquer les notifications)
- createdAt, updatedAt

### goals
- id, title, description, targetDate, status
- progressType, progressCurrent, progressTarget
- createdAt, updatedAt

### milestones
- id, goalId (FK), title, done
- createdAt, updatedAt

### push_subscriptions
- id, endpoint, p256dh, auth
- createdAt

## 📱 Installation PWA

### Sur Chrome (Desktop)
1. Ouvrez l'application dans Chrome
2. Cliquez sur l'icône d'installation dans la barre d'adresse
3. Cliquez sur "Installer"

### Sur Chrome (Android)
1. Ouvrez l'application dans Chrome
2. Appuyez sur le menu (⋮)
3. Sélectionnez "Ajouter à l'écran d'accueil"
4. Confirmez l'installation

### Sur Safari (iOS)
1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton Partager
3. Sélectionnez "Ajouter à l'écran d'accueil"
4. Donnez un nom et confirmez

## 🔔 Configuration des notifications

### Dans l'application
1. Allez dans **Paramètres**
2. Cliquez sur **Activer les notifications**
3. Autorisez les notifications dans votre navigateur
4. Testez avec le bouton **Tester la notification**

### Configuration du job sur un VPS

Pour envoyer automatiquement des notifications pour les rappels à venir, configurez un job cron :

#### Exemple de configuration cron (Linux/Unix)

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour exécuter toutes les minutes
* * * * * curl -X POST "https://votre-domaine.com/api/jobs/send-due-reminders?token=VOTRE_SECRET_TOKEN" > /dev/null 2>&1

# Ou toutes les 5 minutes
*/5 * * * * curl -X POST "https://votre-domaine.com/api/jobs/send-due-reminders?token=VOTRE_SECRET_TOKEN" > /dev/null 2>&1
```

#### Exemple avec wget

```bash
* * * * * wget -qO- "https://votre-domaine.com/api/jobs/send-due-reminders?token=VOTRE_SECRET_TOKEN" > /dev/null 2>&1
```

#### Protection du endpoint

Le endpoint `/api/jobs/send-due-reminders` est protégé par un token secret défini dans `JOB_API_SECRET`. Assurez-vous que ce token est :
- Aléatoire et sécurisé (utilisez `generate-job-secret.ts`)
- Gardé confidentiel
- Différent en production

#### Fonctionnement du job

Le job vérifie tous les rappels :
- Avec statut "pending"
- Dont l'échéance est dans les N prochaines minutes (défini par `NOTIFICATION_CHECK_MINUTES`)
- Qui n'ont pas été notifiés dans la dernière heure (dédupliaction)

Pour chaque rappel correspondant, une notification push est envoyée à tous les abonnés.

## 🚀 Déploiement en production

### 1. Build de l'application

```bash
npm run build
```

### 2. Lancer en production

```bash
npm start
```

### 3. Variables d'environnement de production

Assurez-vous de définir toutes les variables d'environnement sur votre serveur de production.

### 4. Configuration HTTPS

Les notifications push nécessitent HTTPS en production. Configurez un certificat SSL (Let's Encrypt recommandé).

### 5. Gestion de la base de données

- Sauvegardez régulièrement le fichier SQLite (`./data/goalremind.db`)
- Considérez l'utilisation de volumes persistants si vous déployez avec Docker

## 🔧 Commandes disponibles

```bash
# Développement
npm run dev              # Lancer en mode développement

# Build & Production
npm run build            # Build de production
npm start                # Démarrer en production

# Base de données
npm run db:generate      # Générer les migrations
npm run db:migrate       # Exécuter les migrations
npm run db:push          # Push le schéma vers la DB
npm run db:studio        # Ouvrir Drizzle Studio

# Utilitaires
npx tsx scripts/generate-vapid-keys.ts    # Générer clés VAPID
npx tsx scripts/generate-job-secret.ts    # Générer secret de job
```

## 📝 API Endpoints

### Reminders
- `GET /api/reminders?filter={all|today|upcoming|overdue|completed}` - Liste des rappels
- `POST /api/reminders` - Créer un rappel
- `PATCH /api/reminders/[id]` - Mettre à jour un rappel
- `DELETE /api/reminders/[id]` - Supprimer un rappel

### Goals
- `GET /api/goals?status={active|paused|done}` - Liste des objectifs
- `GET /api/goals/[id]` - Détails d'un objectif (avec milestones)
- `POST /api/goals` - Créer un objectif
- `PATCH /api/goals/[id]` - Mettre à jour un objectif
- `DELETE /api/goals/[id]` - Supprimer un objectif

### Milestones
- `POST /api/goals/[id]/milestones` - Ajouter une étape
- `PATCH /api/milestones/[id]` - Mettre à jour une étape
- `DELETE /api/milestones/[id]` - Supprimer une étape

### Push Notifications
- `POST /api/push/subscribe` - S'abonner aux notifications
- `POST /api/push/unsubscribe` - Se désabonner
- `POST /api/push/test` - Envoyer une notification de test

### Jobs
- `POST /api/jobs/send-due-reminders?token={SECRET}` - Envoyer les notifications pour les rappels à venir

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

## 🐛 Résolution de problèmes

### Les notifications ne fonctionnent pas
- Vérifiez que les clés VAPID sont correctement configurées
- Assurez-vous que l'application est servie en HTTPS (en production)
- Vérifiez que les permissions de notification sont autorisées dans le navigateur

### La base de données n'est pas créée
- Exécutez `npm run db:generate` puis `npm run db:migrate`
- Vérifiez que le dossier `./data` existe et est accessible en écriture

### Le service worker ne se met pas à jour
- Effacez le cache du navigateur
- Dans Chrome DevTools : Application → Service Workers → Unregister
- Rechargez la page

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur le dépôt GitHub.

---

Développé avec ❤️ en utilisant Next.js, TypeScript, et Tailwind CSS
