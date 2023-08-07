# 1. Déploiement

L'application web Champollion est disponible sur le repository [front-it](..).

> ⚠️ Pour lancer l'application en local voir la documentation sur [l'environnement de développement](2_developpement.md)

1. [Fonctionnement général](#fonctionnement-général)
2. [Préalables](#préalables)
3. [Procédure de build](#build)
4. [Procédure de run](#run)

## Fonctionnement général

La procédure de déploiement consiste à build les images nécessaires au service docker sur la VM qui bénéficie d'une connexion à internet : la VM Lab (OV1-APP-LAB-DEV-003). Puis de déployer ces images sur une VM cible grâce au fichier [docker-compose.yaml](../docker-compose.yaml). Les images sont archivées sur un dépôt Nexus qui permet de transférer une image d'une VM à une autre.

<img src="assets/1_deploiement_001.png" width="860" height="360">

**Si vous modifiez le dockerfile ou que vous souhaitez déployer une nouvelle version du code, vous devez suivre la procédure de build. Sinon suivez uniquement la procédure de run.**

## Préalables

Avant de build and run, il convient de réaliser les étapes qui suivent sur les toutes les VM où vous souhaitez build et/ou déployer des images. Ces opérations n'ont besoin d'être réalisées qu'une seule fois par VM.

Côté front, il s'agit de la VM **ovh-web**.

1. Première connexion à la VM

   Sélectionnez `Linux`, acceptez le fingerprint, entrez votre mot de passe. Lors de la 1e connexion, il faut attendre que VS Code se configure, ce sera plus rapide les prochaines fois.
   Pour accéder aux fichiers, cliquer sur `Open Folder` ou bien `Ctrl` + `K`, `Ctrl` + `O` et sélectionnez `/champollion/` pour accéder aux fichiers communs.

2. Loguez vous au Nexus

   Les valeurs pour `NEXUS_USER` et `NEXUS_PASSWORD` se trouvent dans la feuille "login" de l'excel sur l'espace Teams du projet Champollion : **`/Infrasctructure/env/credentials.xlsx`**

   ⚠️ Lors de l'export du mot de passe, les caractères interprétables par bash (!&;'"<>) doivent être précédés d'un backslash. Vérifiez avec `echo $NEXUS_PASSWORD` que la totalité du mdp est bien sauvegardée.

   ```bash
   export NEXUS_USER= # username
   export NEXUS_PASSWORD= # password
   echo $NEXUS_PASSWORD | docker login nexus-ovh.intranet.social.gouv.fr:5000 --username $NEXUS_USER --password-stdin
   ```

3. Ajoutez-vous au groupe docker

   ```bash
   sudo usermod -aG docker $USER
   ```

## Build

⚠️ **L'étape de build n'est pas nécessaire si vous n'avez pas modifié le code de l'application que vous souhaitez déployer.** Pour vérifier s'il faut build les images pour lancer le service docker, rendez vous sur [le dépôt Nexus du projet Champollion](https://10.252.1.10/#browse/browse:Champollion:v2%2Fchampollion-dev)\* pour voir les images disponibles.

**Listes des images nécessaires :**

- `front/app`
- `front/reverse-proxy`
- `front/oauth2-proxy`

_\*Le nexus n'est accessible que depuis la PMAD. Continuez sur l'url même si elle n'est pas sécurisée_

1. Créez un fichier de variable d'environnement sur la base du [fichier d'exemple](../.env.example). Pensez à mettre à jour la version du tag sur les variables des 3 images pour ne pas écraser les images précédentes et conserver un historique (sauf en cas de correctif : on ne veut pas garder des images qui ne fonctionnent pas).

   Les valeurs des variables sont dans la feuille "front" de l'excel sur l'espace Teams du projet Champollion : **`/Infrasctructure/env/environment_variables.xlsx`**. Si vous déployez du code nécessitant de nouvelles variables front, ajoutez-les sur l'excel et dans le fichier d'env local.

2. Build et push les images sur les dépôt Nexus

   > ⚠️ **Le build va récupérer le code présent localement, vérifiez que vous êtes sur la bonne branche et le bon commit que vous souhaitez déployer !**

   Placez-vous dans le dossier qui contient le fichier `build.sh` : racine de `front-it/` pour le front. Spécifiez avec l'argument -e le chemin vers le fichier d'environnement que vous venez de créer.

   ```bash
   bash build.sh -e <ENV_FILE_PATH> -p
   ```

   > 💡 L'argument -p permet de push les images. Même si vous déployez le service sur la VM de build (Lab) il est important de push les images build afin de sauvegarder les modifications.<br>
   > Pour vérifier que vous avez bien push les images avec les nouveaux tags, rendez vous sur sur [le dépôt Nexus du projet Champollion](https://10.252.1.10/#browse/browse:Champollion:v2%2Fchampollion-dev)\*

   _\*Le nexus n'est accessible que depuis la PMAD._

## Run

1. Mettez à jour les fichiers `docker-compose.yaml` et `/champollion/.env` sur la VM où vous souhaitez déployer les containers (VM cible)

   > ⚠️ Cette étape n'est pas nécessaire si vous n'avez pas modifié le fichier [docker-compose.yaml](../docker-compose.yaml) et/ou si vous n'avez pas ajouté/retiré de variables d'environnement.

   Si vous déployez le service sur la VM lab (OV1-APP-LAB-DEV-003) vous pouvez cloner le présent repository pour récupérer le fichier [docker-compose.yaml](../docker-compose.yaml).

   > 💡 Le fichier de variable d'environnement doit être le même que celui créé pour le build.

2. Run les images grâce au fichier docker-compose.yaml

   ```bash
   docker compose --env-file /champollion/.env stop && \
   docker compose --env-file /champollion/.env rm -f && \
   docker compose --env-file /champollion/.env up --detach
   ```

3. Vérifiez que le statut des containers est "up" avec la commande `docker ps`
