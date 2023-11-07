# 1. Déploiement

L'application web VisuDSN est disponible sur le repository [front-it](..).

> ⚠️ Pour lancer l'application en local voir la documentation sur [l'environnement de développement](2_developpement.md)

1. [Fonctionnement général](#fonctionnement-général)
3. [Procédure de build](#build)
4. [Procédure de run](#run)

## Fonctionnement général

La procédure de déploiement consiste à build les images nécessaires au service docker sur la VM qui bénéficie d'une connexion à internet : la VM Lab (OV1-APP-LAB-DEV-003). Puis de déployer ces images sur une VM cible grâce au fichier [docker-compose.yaml](../docker-compose.yaml). Les images sont archivées sur un dépôt Nexus qui permet de transférer une image d'une VM à une autre.

Côté code, pour conserver un historique propre des différents déploiements et de leur contenu, il faut merge les nouveautés à déployer sur main, puis créer l'image à partir de la branche main mise à jour.

## Build

> ⚠️ **L'étape de build n'est pas nécessaire si vous n'avez pas modifié le code de l'application que vous souhaitez déployer.** Pour vérifier s'il faut build les images pour lancer le service docker, rendez vous sur [le dépôt Nexus du projet Champollion](https://10.252.1.10/#browse/browse:Champollion:v2%2Fchampollion-dev)\* pour voir les images disponibles.

**Listes des images nécessaires :**

- `front/app`
- `front/reverse-proxy`
- `front/oauth2-proxy`

_\*Le nexus n'est accessible que depuis la PMAD. Continuez sur l'url même si elle n'est pas sécurisée_

1. Créer une merge request (MR) de la branche dev vers la branche main. Cela permet de vérifier les nouveautés à déployer et de revenir en arrière facilement s'il y a un problème. Vous pouvez le faire manuellement ou [cliquer ici](https://gitlab.intranet.social.gouv.fr/champollion/front-it/merge_requests/new?merge_request[source_branch]=dev&merge_request[target_branch]=main).

     > ✅ Bonne pratique : lister les commits déployés dans la description de la MR, trier par feat / fix / chore pour visualiser rapidement ce qui va être déployé.

2. Créez un fichier de variable d'environnement sur la base du [fichier d'exemple](../.env.example) et des variables nécessaires au déploiement. Chaque variable est déclaré au format `MA_VARIABLE_D_ENV=valeur`.

     Les valeurs des variables sont dans la feuille "docker - front" des excels du dossier [environment_variables](https://msociauxfr.sharepoint.com/:f:/r/teams/EIG71/Documents%20partages/General/Commun/D%C3%A9veloppement/environment_variables?csf=1&web=1&e=2JoDog) sur l'espace Teams du projet Champollion.

     🚨 **Important :** Pensez à mettre à jour la version du tag sur les variables des 3 images pour ne pas écraser les images précédentes et conserver un historique (sauf en cas de correctif : on ne veut pas conserver des images qui ne fonctionnent pas).

     > ✅ Bonne pratique : à chaque ajout d'une variable d'environnement dans le fichier .env.local (non versioné sur git car confidentiel), spécifiez le nom de la variable dans le fichier .env.example. Ainsi, en créant la MR de dev -> main, on peut visualiser dans la liste des changements s'il y a de nouvelles valeurs dans ce fichier.

3. Merge la branche dev sur main et se mettre à jour sur main en local.

     ```bash
     # cd code/front-it
     git fetch upstream main
     git checkout -B main -t upstream/main
     ```

4. Build et push les images sur les dépôt Nexus

     > ⚠️ **Le build va récupérer le code présent localement, vérifiez que vous êtes sur la bonne branche et le bon commit que vous souhaitez déployer !** Cf étape précédente.

     Placez-vous dans le dossier qui contient le fichier `build.sh` : racine de `front-it/` pour le front. Spécifiez avec l'argument -e le chemin vers le fichier d'environnement que vous venez de créer.

     ```bash
     cd ~/code/front-it
     bash build.sh -p -e <env_file_path>
     ```

     > 💡 L'argument -p permet de push les images. Pour vérifier que vous avez bien push les images avec les nouveaux tags, rendez vous sur [le dépôt Nexus du projet Champollion](https://10.252.1.10/#browse/browse:Champollion:v2%2Fchampollion-dev)\*

    _\*Le nexus n'est accessible que depuis la PMAD._

## Run

1. Connectez avec le compte de service *svc.champollion* sur les VM suivantes selon l'environnement : 

|Host|Evironnement|
|---|---|
|OV1-WEB-LAB-DEV-001|dev|
|OV1-WEB-INT-PRE-001|preprod|

2.  Mettez à jour le fichier `/exploit/svc.champollion/docker/docker-compose.yaml` avec les valeurs présentes dans la feuille "docker - front" des excels du dossier [environment_variables](https://msociauxfr.sharepoint.com/:f:/r/teams/EIG71/Documents%20partages/General/Commun/D%C3%A9veloppement/environment_variables?csf=1&web=1&e=2JoDog) sur l'espace Teams du projet Champollion.

    > 💡 Le fichier de variable d'environnement doit être le même que celui créé pour le build.

3. Mettez à jour le fichier `/exploit/svc.champollion/docker/.env` avec la version à jour sur le présent repository

    > ⚠️ Ces étapes ne sont pas nécessaires si vous n'avez pas modifié le  fichier [docker-compose.yaml](../docker-compose.yaml) et/ou si vous n'avez pas ajouté/retiré de variables d'environnement.

4. Run les images grâce au fichier docker-compose.yaml

    ```bash
    ENV_FILE_PATH=/exploit/svc.champollion/docker/.env && \
    docker compose --env-file $ENV_FILE_PATH stop && \
    docker compose --env-file $ENV_FILE_PATH rm -f && \
    docker compose --env-file $ENV_FILE_PATH up --detach
    ```

    ⚠️ Si vous avez effectué un correctif et build une image en gardant le même tag (cad en surchargeant l'image existante dans le Nexus), il faut préalablement supprimer localement l'image téléchargée pour aller récupérer la nouvelle image par la suite.

    ```bash
    # stop and rm containers
    ENV_FILE_PATH=/exploit/svc.champollion/docker/.env && \
    docker compose --env-file $ENV_FILE_PATH stop && \
    docker compose --env-file $ENV_FILE_PATH rm -f
    
    # check image ID
    docker images

    # rm image
    docker image rm <image_id>

    # run containers
    docker compose --env-file $ENV_FILE_PATH up --detach
    ```

5. Vérifiez que le status des containers est "up" avec la commande `docker ps`