# 3. Reverse proxy

- schéma global du fonctionnement [TO DO]

## Configuration

La configuration Nginx est dynamique, c'est-à-dire qu'elle se génère lors du lancement du container Docker grâce au script [docker-entrypoint.sh](../reverse-proxy/docker-entrypoint.sh). Cela permet d'intégrer les variables d'environnement dans la configuration à la volée :
- `APP_URL`
- `API_URL`
- `AUTH_URL`
- `KEYCLOAK_REALM`

> ⚠️ La variable d'environnement `API_URL` est intégrée à la [configuration Nginx de l'application](../app/default.conf.template) et non du reverse proxy. La logique reste même ([docker-entrypoints.sh](../app/docker-entrypoint.sh)).

Tous les fichiers correspondant à la configuration sont dans le dossier [`reverse-proxy/conf/`](../reverse-proxy).

Les différents fichiers de configurations :

* [`reverse-proxy/conf/default.conf.template`](../reverse-proxy/conf/default.conf.template) : la configuration du reverse proxy (fichier de configuration principal)
* [`reverse-proxy/conf/app.location.template`](../reverse-proxy/conf/app.location.template) : la configuration de l'application (module complémentaire au fichier de configuration principal)
* [`reverse-proxy/conf/auth.location.template`](../reverse-proxy/conf/auth.location.template) : la configuration de Keycloak (module complémentaire configuration principal)

Pour ajouter une nouvelle application au reverse proxy il suffit d'ajouter un fichier `MY_APP.location` dans le dossier `reverse-proxy/conf/`, puis d'ajouter au fichier de configuration principal : 

```bash
include /etc/nginx/conf.d/MY_APP.location.location;
```

Si vous souhaitez que votre configuration intégres des variables d'environnement de manière dynamique, appelez le fichier `MY_APP.location.template` et compléter le script script [docker-entrypoint.sh](../reverse-proxy/docker-entrypoint.sh) de la manière suivante : 

```bash
envsubst '${MY_VAR}' < /etc/nginx/conf/MY_APP.location.template > MY_APP.location
```

* [`reverse-proxy/conf/snippets`](../reverse-proxy/conf/snippets) : dossier dans lequel se trouve la configuration pour le chiffrement des connections (HTTPS)