# 1. Déploiement

L'application web Champollion est disponible sur le repository [front-it](..).

> ⚠️ Pour lancer l'application en local voir la documentation sur [l'environnement de développement](2_developpement.md)

## Fonctionnement général

La procédure de déploiement consiste à build les images nécessaires au service docker sur la VM qui bénéficie d'une connexion à internet : la VM Lab (OV1-APP-LAB-DEV-003). Puis de déployer ces images sur une VM cible grâce au fichier [docker-compose.yaml](../docker-compose.yaml).  Les images sont archivées sur un dépôt Nexus qui permet de transférer une image d'une VM à une autre.

<img src="assets/1_deploiement_001.png" width="860" height="360">

**Si vous modifiez le dockerfile vous devez suivre la procédure de build. Sinon suivez uniquement la procédure de run.**

1. [Procédure de build](#build)
2. [Procédure de run](#run)

## Build

Pour vérifier s'il faut build les images pour lancer le service docker, rendez vous sur [le dépôt Nexus du projet Champollion](https://10.252.1.10/#browse/browse:Champollion:v2%2Fchampollion-dev)* pour voir les images disponibles.

**Listes des images nécessaires :**
 -  `front/node`
 -  `front/nginx`
 -  `front/oauth2-proxy`

*\*Le nexus n'est accessible que depuis la PMAD.*

### 1. Exportez les variables d'environnement nécessaires sur la VM lab (OV1-APP-LAB-DEV-003)

1. Créez un fichier de variable d'environnement sur la base du [fichier d'exemple](../.env.example)

2. Exportez une variable d'environnement `ENV_FILE_PATH` indiquant le chemin d'accès à ce fichier

    ```bash
    export ENV_FILE_PATH=PATH

    # example
    export ENV_FILE_PATH=/exploit/lguillaume/env/dev/.env.front
    ```

3. Exportez les variables d'environnement de ce fichier

    ```bash
    export $(grep -v "^#" ${ENV_FILE_PATH} | xargs)
    ```

### 2. Build les images depuis la VM lab (OV1-APP-LAB-DEV-003)

```bash
docker build --rm --file ${HOME}/${APP_DOCKERFILE_PATH} \
--build-arg HTTP_PROXY=${HTTP_PROXY} \
--build-arg HTTPS_PROXY=${HTTPS_PROXY} \
--build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} \
--build-arg VITE_LOGOUT_URL=${VITE_LOGOUT_URL} \
--tag ${NEXUS_CHAMPOLLION_URL}/front/node:${APP_IMAGE_TAG} \
${HOME}/${APP_BUILD_CONTEXT}

docker build --rm --file ${HOME}/${OAUTH2_DOCKERFILE_PATH} \
--tag ${NEXUS_CHAMPOLLION_URL}/front/oauth2-proxy:${OAUTH2_IMAGE_TAG} \
${HOME}/${OAUTH2_BUILD_CONTEXT}

docker build --rm --file ${HOME}/${REVERSE_PROXY_DOCKERFILE_PATH} \
--tag ${NEXUS_CHAMPOLLION_URL}/front/nginx:${REVERSE_PROXY_IMAGE_TAG} \
${HOME}/${REVERSE_PROXY_BUILD_CONTEXT}
```

### 3. Push l'image sur le dépôt Nexus Champollion

> ⚠️ Même si vous déployez le service sur la VM de build (Lab) il est important de push les images build afin de sauvegarder les modifications.


```bash
docker image push ${NEXUS_CHAMPOLLION_URL}/front/node:${APP_IMAGE_TAG}
docker image push ${NEXUS_CHAMPOLLION_URL}/front/oauth2-proxy:${OAUTH2_IMAGE_TAG}
docker image push ${NEXUS_CHAMPOLLION_URL}/front/nginx:${REVERSE_PROXY_IMAGE_TAG}
```

## Run 

### 1. Récupérez le fichier docker-compose.yaml sur la VM où vous souhaitez déployer les containers (VM cible)

Si vous déployez le service sur la VM Lab (OV1-APP-LAB-DEV-003) vous pouvez cloner le présent repository pour récupérer le fichier [docker-compose.yaml](../../database/docker-compose.yaml).

### 2. Exportez les variables d'environnement nécessaires sur la VM cible


1. Créez un fichier de variables d'environnement sur la base du [fichier d'exemple](../.env.example) sur la VM cible. 

    > ⚠️ Si vous avez préalablement build les images, il s'agit du même fichier qu'en étape 1. Vous pouvez copier ce fichier sur la VM cible.

2. Exportez une variable d'environnement `ENV_FILE_PATH` indiquant le chemin d'accès à ce fichier et une variable `DOCKER_COMPOSE_FILE_PATH` indiquant le chemin vers le fichier [docker-compose.yaml](../docker-compose.yaml).

    ```bash
    export ENV_FILE_PATH=PATH
    export DOCKER_COMPOSE_FILE_PATH=PATH

    # example
    export ENV_FILE_PATH=/exploit/lguillaume/front/.env.front
    export DOCKER_COMPOSE_FILE_PATH=/exploit/lguillaume/front/docker-compose.yaml
    ```

3. Exportez les variables d'environnement du fichier de variables d'environnement

    ```bash
    export $(grep -v "^#" ${ENV_FILE_PATH} | xargs)
    ```

### 3. Run les images grâce au fichier docker-compose.yaml

```bash
docker compose --env-file ${ENV_FILE_PATH} stop && \
docker compose --env-file ${ENV_FILE_PATH} rm -f && \
docker compose --env-file ${ENV_FILE_PATH} up --detach
```