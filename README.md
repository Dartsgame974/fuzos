# Fuzos - Statistiques & Archives FuzeIII

Site moderne de statistiques interactives pour les répliques cultes de FuzeIII (**Objectivement** et **Gigantitude / Gigantesque**).

## Fonctionnalités

- **Double Thème** : Mode Clair (White page par défaut) et Mode Sombre (Black page).
- **Double Vue** : Sélecteur instantané entre *Objectivement* et *Gigantesque*.
- **Lecteur YouTube Embarqué** : Clic sur n'importe quel record ou carte pour lancer la vidéo directement au timestamp précis (sans héberger de fichiers vidéo lourds).
- **Statistiques Complètes** : Répartition par chaîne, évolution par année, moyennes, records historiques (le plus rapide, le tout premier, le plus de répétitions, le record en 1 min, etc.).
- **Explorateur & Recherche** : Moteur de recherche instantané par titre, chaîne, date ou citation.
- **Typographie & Design** : Police Satoshi, UI moderne et fidèle.

## Lancement en local

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
   Ou double-cliquez sur `start_fuzos.bat` à la racine du dossier principal.

## Déploiement sur GitHub Pages

Le projet inclut une GitHub Action automatisée (`.github/workflows/deploy.yml`).

### Activer GitHub Pages sur votre dépôt :
1. Rendez-vous sur votre dépôt GitHub : `https://github.com/Dartsgame974/fuzos/settings/pages`
2. Dans la section **Build and deployment** > **Source**, sélectionnez **GitHub Actions**.
3. Lors de chaque `git push`, le site est automatiquement compilé et déployé en ligne !
