# BotHunter

BotHunter est un outil développé en Node.js pour analyser les commentaires des vidéos YouTube, détecter les bots, et engager la communauté pour confirmer leur nature. L'objectif est de maintenir une expérience YouTube propre et authentique pour tous.

## Fonctionnalités

- **Vote communautaire**: Permettre aux membres de la communauté de voter et de confirmer si un profil est réellement un bot.
- **Rapport automatique**: Une fois confirmé, les bots sont automatiquement rapportés aux plateformes concernées.

## Présentation du Workflow

1. **Soumission des vidéos**: Les utilisateurs soumettent des vidéos via une commande Discord.
2. **Analyse automatisée**: BotHunter analyse les commentaires et détecte les photos suspectes.
3. **Engagement communautaire**: Les photos sont publiées dans un channel dédié pour permettre aux membres de voter.
4. **Validation et action**: Lorsque le nombre de votes requis est atteint, les bots sont rapportés manuellement à YouTube pour suppression.

## Prérequis

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)
- [Google Cloud Vision API](https://cloud.google.com/vision/)
- Clé API de l'API YouTube Data v3

## Installation

1. Clonez le dépôt:

   ```bash
   git clone https://github.com/JonesJugHead/bothunter.git
   cd bothunter
   ```

2. Installez les dépendances:

   ```bash
   yarn install
   ```

3. Configurez les variables d'environnement:
   Créez un fichier `.env` à la racine du projet et configurez les variables nécessaires:
   ```env
   YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-cloud-credentials.json
   ```

## Utilisation

Exécutez le script principal:

```bash
node index.js
```

Ce script analysera les commentaires des vidéos spécifiées dans le code et enverra les photos suspectes pour validation communautaire.

## Dépendances

- [node-fetch](https://www.npmjs.com/package/node-fetch)
- [Yarn](https://yarnpkg.com/)
- [NsfwSpy.js](https://www.npmjs.com/package/nsfwjs)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [google-cloud/vision](https://www.npmjs.com/package/@google-cloud/vision)

## TODO

- **Vote communautaire**: Permettre aux membres de la communauté de voter et de confirmer si un profil est réellement un bot.
- **Rapport automatique**: Une fois confirmé, les bots sont automatiquement rapportés aux plateformes concernées.
- **Soumission des vidéos**: Permettre aux utilisateurs de soumettre des vidéos via une commande Discord.
- **Engagement communautaire**: Publier les photos suspectes dans un channel dédié pour que les membres puissent voter.
- **Validation et action**: Mettre en place le processus de validation et de reporting manuel.

## Contribuer

Les contributions sont les bienvenues! Merci de soumettre des PRs et des issues pour améliorer ce projet.

## Licence

Ce projet est sous licence MIT.
