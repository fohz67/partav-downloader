# HLS Video Downloader

Extension Chrome pour télécharger automatiquement les vidéos HLS en détectant les segments `.ts` dans les requêtes réseau.

## Installation

```bash
pnpm install
pnpm run build
```

## Chargement dans Chrome

1. Ouvrir `chrome://extensions/`
2. Activer "Mode développeur"
3. Cliquer sur "Charger l'extension non empaquetée"
4. Sélectionner le dossier du projet

## Utilisation

1. Cliquer sur l'icône de l'extension
2. Naviguer sur une page avec une vidéo HLS
3. Les segments sont détectés automatiquement
4. Cliquer sur "Télécharger" pour obtenir la vidéo complète

## Développement

```bash
pnpm run watch
```

## Structure

- `src/background.ts` - Service worker (détection des segments)
- `src/popup.ts` - Interface popup
- `src/detector.ts` - Logique de détection HLS
- `src/downloader.ts` - Téléchargement et combinaison
- `src/storage.ts` - Gestion du stockage
