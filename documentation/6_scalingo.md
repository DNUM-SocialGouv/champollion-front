# 6. Scalingo

Le site est accessible sur un lien de démonstration, contenant uniquement des fausses données.
Il est déployé via Scalingo et [accessible ici](https://champollion-front.osc-fr1.scalingo.io/).

> Attention, le backend crash toutes les 24h donc il est très probable que seule la page d'accueil s'affiche, les autres pages étant dépendantes de données de l'api.

📚Toutes les infos relatives à l'accès à la plateforme scalingo et la base de données de démo sont sur Teams dans le fiche réflexe nouvel arrivant. Cette page recense uniquement les commandes pour mettre à jour la branche dédiée à Scalingo sur le repo github.

*Table des matières*
- [6. Scalingo](#6-scalingo)
  - [Déployer le front sur Scalingo](#déployer-le-front-sur-scalingo)
    - [Prérequis github](#prérequis-github)
    - [Commandes git de mise à jour des branches](#commandes-git-de-mise-à-jour-des-branches)


## Déployer le front sur Scalingo

Front-it est principalement versionné sur le gitlab interne de la DNUM des ministères sociaux. Régulièrement, le repo github est mis à jour manuellement via un push des branches principales sur github. Cela permet de rendre le code open source, et c'est via github que Scalingo récupère le code à déployer sur l'environnement de démo.

Le déploiement du front sur Scalingo est automatique dès qu'on pousse sur la branche `deploiement_scalingo` sur github. En effet, la branche `deploiement_scalingo` a des commits dédidés à la configuration pour Scalingo.

### Prérequis github

1. Avoir un compte github DNUM-SocialGouv ayant les droits d'écriture sur le repo champollion-front github, et avoir configuré l'authentification à github.

    >Si vous travaillez sur l'environnement OVH du ministère : vous pouvez créer un Personal Access Token pour github et l'ajouter dans votre config git, de la même manière que celui de gitlab
```
git config --global credential.github.com.token PERSONAL_ACCESS_TOKEN
```
2. Ajouter le repository miroir Github en tant que nouvelle remote sur front-it :
    > ⚠️ Cette étape n'est à réaliser qu'une seule fois. Il faut bien se placer dans front-it/.
```bash
git remote add github-upstream https://github.com/DNUM-SocialGouv/champollion-front.git
```

### Commandes git de mise à jour des branches
💡 Les commandes sont indiquées pour déployer le code issu de la branche `dev` mais il est possible de faire la même chose avec un autre branche si nécessaire.

1. Récupérez la branche `dev` à jour

    ```bash
    git fetch upstream dev
    git checkout -B dev -t upstream/dev
    ```

2. Poussez la branche `dev` sur github

    ```bash
    git push github-upstream dev
    ```

3. Récupérez la branche `deploiement_scalingo` de github à jour

    ```bash
    git fetch github-upstream deploiement_scalingo
    git checkout -B deploiement_scalingo -t github-upstream/deploiement_scalingo
    ```

4. Rebase la branche `dev` sur `deploiement_scalingo`

    ```bash
    git pull --rebase github-upstream dev
    ```

    >Résoudre les conflits s'il y en a.

5. Push la branche `deploy` sur github

    ```bash
    git push github-upstream deploy -f
    ```

    > Le push force est nécessaire après un rebase, qui réécrit l'historique.


Le déploiement est lancé automatiquement sur Scalingo ✨

👉 Sur la branche `deploiement_scalingo`, vous devez voir les derniers commits de la branche dev, plus les 2 commits dédiés à Scalingo comme commits les plus récents.

**Résumé des commandes**
```bash
git fetch upstream dev
git checkout -B dev -t upstream/dev
git push github-upstream dev
git fetch github-upstream deploiement_scalingo
git checkout -B deploiement_scalingo -t github-upstream/deploiement_scalingo
git pull --rebase github-upstream dev
git push github-upstream deploiement_scalingo -f
```
