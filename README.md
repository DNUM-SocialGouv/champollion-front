# Front-IT

Front-IT est le dépôt frontend de l'application web précarité à destination de l'Inspection du Travail (IT) du [projet Champollion](https://eig.etalab.gouv.fr/defis/champollion/).
Le projet est développé par la DNUM des ministères sociaux, dans le cadre du programme EIG.

Ce projet est contruit avec [Vite](https://vitejs.dev/), [React](https://fr.reactjs.org/) et TypeScript.

## Demo

Le site est accessible sur un lien de démonstration, contenant uniquement des fausses données.
Il est déployé via Scalingo et [accessible ici](https://champollion-front.osc-fr1.scalingo.io/).

### Mettre à jour le site de démo sur Scalingo

Lorsqu'une nouvelle version de l'application est disponible sur la branche `main`, il faut rebase la branche `main` depuis la branche `deploiement_scalingo`.
En effet, cette branche a des configurations spécifiques pour Scalingo.

- Pré-requis : avoir une remote correspondant au repo github.

```bash
# Ex: ajouter la remote en SSH et la nommer `upstream` (marche aussi en HTTPS et avec n'importe quel nom)
git remote add upstream git@github.com:DNUM-SocialGouv/champollion-front.git
```

- Se placer sur la branche `deploiement_scalingo` à jour et rebase la branche `main`

```bash
# se mettre à jour localement sur la branche deploiement_scalingo
git fetch upstream deploiement_scalingo
git checkout -B deploiement_scalingo -t upstream/deploiement_scalingo
git pull --rebase upstream main
```

Résoudre les conflits s'il y en a.

- Vérifier le bon fonctionnement en local puis pousser en force sur la branche `deploiement_scalingo`.

```bash
# le push force est nécessaire après un reabse, qui réécrit l'historique.
git push upstream deploiement_scalingo -f
```

- Le déploiement est lancé automatiquement sur Scalingo ✨

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
