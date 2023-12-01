# Déploiement

> ⚠️ Pour lancer l'application en local voir la documentation sur [l'environnement de développement](1_developpement.md)

1. [Fonctionnement général](#fonctionnement-général)
2. [Procédure de build](#build)
3. [Procédure de run](#run)

## Fonctionnement général

La procédure de déploiement consiste à build les images nécessaires au service docker sur la VM qui bénéficie d'une connexion à internet : la VM Lab (OV1-APP-LAB-DEV-003). Puis de déployer ces images sur une VM cible grâce au fichier [docker-compose.yaml](../docker-compose.yaml). Les images sont archivées sur un dépôt Nexus qui permet de transférer une image d'une VM à une autre.

Côté code, pour conserver un historique propre des différents déploiements et de leur contenu, il faut merge les nouveautés à déployer sur main, puis créer l'image à partir de la branche main mise à jour.

## Build

2 manière de build les images du repository :
1. [Automatiquement (CI/CD)](#build-automatisé-cicd)
2. [Manuellement](#build-manuel)

**Listes des images :**

- `front/app`
- `front/reverse-proxy`
- `front/oauth2-proxy`

### Build automatisé (CI/CD)

Grâce au fichier [.gitlab.yaml](../.gitlab.yaml) les images se build automatiquement dès lors qu'un commit est passé sur les branches suivantes du reposition [champollion/front-it](https://gitlab.intranet.social.gouv.fr/champollion/front-it) et push les images sur [le dépôt Nexus du projet Champollion](https://10.252.1.10/#browse/browse:Champollion:v2%2Fchampollion-dev).
- branch gitlab : dev     => dossier nexus : champollion-dev 
- branch gitlab : preprod => dossier nexus : champollion-preprod

Ainsi lorsque vous acceptez une merge request d'un fork sur la branche dev, cela va build et push les images sur [le dépôt Nexus du projet Champollion](https://10.252.1.10/#browse/browse:Champollion:v2%2Fchampollion-dev). De même lorsque vous mergez dev vers preprod. Les images sont organisés sur le dépot Nexus par dossier : champollion-dev et champollion-preprod.

Vous pouvez suivre le build dans l'onglet [CI / CD > Pipelines](https://gitlab.intranet.social.gouv.fr/champollion/front-it/pipelines) du repository [champollion/front-it](https://gitlab.intranet.social.gouv.fr/champollion/front-it).

🚨 **Important :** Pensez à mettre à jour la version du tag sur les variables des 3 images que vous modifiez pour ne pas écraser les images précédentes et conserver un historique (sauf en cas de correctif : on ne veut pas conserver des images qui ne fonctionnent pas).

Pour cela éditez les variables `..._IMAGE_TAG` des fichiers présents sur le repository selon la branche sur laquelle vous faite le merge :
- dev : [`env/.env.dev`](../env/.env.dev)
- preprod : [`env/.env.preprod`](../env/.env.preprod)

Ces fichiers sont donc versionnés, ce qui permet d'avoir un historique des ajouts, suppressions et modifications des variables d'environnements.


⚠ Les variables qui ne peuvent être en clair (les mots de passe par exemple) sont commentées dans les fichiers d'env. Ces variables sont configurées sur le repository [champollion/front-it](https://gitlab.intranet.social.gouv.fr/champollion/front-it) dans [Settings > CI / CD > Secret variables](https://gitlab.intranet.social.gouv.fr/champollion/front-it/settings/ci_cd). Les valeurs de ces variables se trouvent dans la feuille *front-it* de l'excel [environment_variables_cicd.xlxs](https://msociauxfr.sharepoint.com/:x:/r/teams/EIG71/Documents%20partages/General/Commun/D%C3%A9veloppement/environment_variables/environment_variables_cicd.xlsx?d=we5bd8f0a43d5480f9de7f3e8e22cf79b&csf=1&web=1&e=UwZqIH) dans l'espace Teams Champollion.

*Comment cela marche t-il ?*

Si vous explorez les configurations [champollion/front-it](https://gitlab.intranet.social.gouv.fr/champollion/front-it), dans [Settings > CI / CD](https://gitlab.intranet.social.gouv.fr/champollion/front-it/settings/ci_cd), rendez vous dans l'onglet "runner settings".

Vous constaterez qu'une VM Runner est configurée et active (pastille verte). C'est cette VM qui écoute Gitlab et qui déclenche le build à chaque commit.

![](./assets/1_deploiement_001.png)

Si ce n'est pas le cas, faites la demande auprès de l'infogérance de l'infrastructure OVH en transmettant le "registration token" indiqué.

### Build manuel

> ⚠️ **L'étape de build n'est pas nécessaire si vous n'avez pas modifié le code de l'application que vous souhaitez déployer.** Pour vérifier s'il faut build les images pour lancer le service docker, rendez vous sur [le dépôt Nexus du projet Champollion](https://10.252.1.10/#browse/browse:Champollion:v2%2Fchampollion-dev)\* pour voir les images disponibles.

_\*Le nexus n'est accessible que depuis la PMAD. Continuez sur l'url même si elle n'est pas sécurisée_

1. Créez un fichier de variable d'environnement sur la base du [fichier d'exemple](../.env.example) en remplissant les valeurs des variables nécessaires au build

    Les valeurs des variables se trouveront d'une part dans le dossier [env](../env) et d'autre part pour la variables sensibles dans la feuille *front-it* de l'excel [environment_variables_cicd.xlxs](https://msociauxfr.sharepoint.com/:x:/r/teams/EIG71/Documents%20partages/General/Commun/D%C3%A9veloppement/environment_variables/environment_variables_cicd.xlsx?d=we5bd8f0a43d5480f9de7f3e8e22cf79b&csf=1&web=1&e=UwZqIH) dans l'espace Teams Champollion.
   
    🚨 **Important :** Pensez à mettre à jour la version du tag sur les variables des 3 images pour ne pas écraser les images précédentes et conserver un historique (sauf en cas de correctif : on ne veut pas conserver des images qui ne fonctionnent pas).

2. Build et push les images sur les dépôt Nexus

     > ⚠️ **Le build va récupérer le code présent localement, vérifiez que vous êtes sur la bonne branche et le bon commit que vous souhaitez déployer !**

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
