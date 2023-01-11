# Front-IT

Front-IT est le dépôt frontend de l'application web précarité à destination de l'Inspection du Travail (IT) du [projet Champollion](https://eig.etalab.gouv.fr/defis/champollion/).
Le projet est développé par la DNUM des ministères sociaux, dans le cadre du programme EIG.

Ce projet est contruit avec [Vite](https://vitejs.dev/), [React](https://fr.reactjs.org/) et TypeScript.

## Lancer le code

Après avoir cloné le projet :

```sh
# installer les dépendances
yarn
# lancer le serveur de développement
yarn dev
```

## Dépendances

Le projet utilise :

- [@codegouvfr/react-dsfr](https://github.com/codegouvfr/react-dsfr/) pour le [design système de l'état (DSFR)](https://www.systeme-de-design.gouv.fr/)
- Les composants [Material UI](https://mui.com/) stylisés avec le thème DSFR

### Linters

Les scripts suivants permettent de lancer des vérifications de code via [ESLint](https://eslint.org/) et [Prettier](https://prettier.io/) :

```sh
# formatage du code avec Prettier
yarn lint:format

# vérification de la qualité du code et corrections avec ESLint
yarn lint:fix

# lancer les 2 commandes précédentes d'affilée
yarn lint
```

## Licence

Front-IT est sous licence Apache-2.0.
