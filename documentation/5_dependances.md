# 5. Dépendances

Le projet utilise les dépendances suivantes :

- [@codegouvfr/react-dsfr](https://github.com/codegouvfr/react-dsfr/) pour le [design système de l'état (DSFR)](https://www.systeme-de-design.gouv.fr/)
- Les composants [Material UI](https://mui.com/) stylisés avec le thème DSFR
- axios pour les requêtes HTTP à l'API
- localstorage-slil pour simplifier la gestion du localStorage, définir une date d'expiration et encrypter les données.
- dayjs pour le formatage des dates
- React
- React router pour la gestion des routes
- react-select pour sélectionner plusieurs options à la fois et rechercher dans les options
- recharts pour tous les indicateurs de data viz
- uuid pour générer des id uniques comme clés de composants

## Dev dependencies

Les dépendances utilisées pour le développement sont :

- TypeScript
- Vite
- eslint et prettier pour le linting
- husky pour la gestion des hooks git
- is-ci pour lancer ou non les scripts husky
- javascript-obfuscator pour obfusquer le code source en production
- talisman pour détecter si des secrets sont publiés dans le code
- tailwindCSS pour la gestion du CSS : la majeure partie du style est gérée par les classes utilitaires du DSFR, le reste complété par les utilitaires Tailwind
