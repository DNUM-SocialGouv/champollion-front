## 2. Environnement de développement

L'environnement de développement de l'application du projet Champollion est prévu pour être setup sur la VM Lab de l'infrasctrure OVH (0V1-APP-LAB-DEV-003). La procédure qui suit est configurée pour cet environnement (Rocky Linux).

## Pré-requis

Vous avez peut-être déjà effectué les actions suivantes pour d'autres installations du projet, sinon les pré-requis sont :

1. Connexion SSH à la VM Lab OVH via VSCode installé sur la PMAD

2. Installez les modules nécessaires

    > ⚠️ Les packages suivants sont déjà installés sur les VM de développement, **vous pouvez ignorez cette étape.**

    ```bash
    sudo dnf install nano # nano text editor
    sudo dnf install git # git
    sudo dnf module disable nodejs:10 # disable node 10
    sudo dnf module enable nodejs:18 # enable node 18
    sudo dnf module install nodejs:18 # install node 18
    ```

3. Créer les dossiers suivants

    ```bash
    mkdir -p ~/code ~/data ~/env
    ```

## Mise en place

1. Fork le repo

    Allez sur https://gitlab.intranet.social.gouv.fr/champollion/front-it/forks/new pour fork le repository Champolib.
    Une fois le fork créé, partagez les droits avec le groupe gitlab Champollion. Pour cela, aller dans Settings > Members > Share with group et ajouter `Champollion` en accès  **Developer**, sans expiration.

2. Configurer git

    Pour la connexion à Gitlab la configuration suivante est requise (préciser les valeurs pour **GIT_EMAIL** et **GIT_USER**) :

    ```bash
    # git config
    git config --global remote.origin.proxy ""
    git config --global remote.upstream.proxy ""
    git config --global credential.helper store
    git config --global user.email **GIT_EMAIL** # example: lguillaume@sg.social.gouv.fr
    git config --global user.name **GIT_USER** # example: leoguillaume
    ```

3. Cloner le repo front-it

    Récupérez l'url HTTPS (et non SSH qui s'affiche par défaut) de votre fork sur gitlab, sous la forme https://gitlab.intranet.social.gouv.fr/**GIT_USER**/front-it.git
    Vous pouvez créer les variables suivantes ou bien faire un clone avec les urls directement.

    ```bash
    export FRONT_REPOSITORY_REMOTE_URL=https://gitlab.intranet.social.gouv.fr/champollion/front-it
    export FRONT_REPOSITORY_ORIGIN_URL=https://gitlab.intranet.social.gouv.fr/**GIT_USER**/front-it
    ```

    ```bash
    cd code/
    git clone ${FRONT_REPOSITORY_ORIGIN_URL}
    cd front-it/
    git remote add upstream ${FRONT_REPOSITORY_REMOTE_URL}
    ```

4. (Optionnel) Ajouter les remotes d'autres développeur·euse·s

    Si vous souhaitez accéder aux branches sur les repo d'autres personnes, il faut ajouter leurs fork comme nouveaux remote, et spécifier le proxy (vide) :

    ```bash
    git remote add <other_git_pseudo> <other_fork_url_https>
    # ex: git remote add sbourdon https://gitlab.intranet.social.gouv.fr/sbourdon/front-it.git
    git config --global remote.<other_git_pseudo>.proxy ""
    # ex: git config --global remote.sbourdon.proxy ""
    ```

5. Installation des dépendances nécessaires

    1. Si ce n'est déjà fait, exportez les variables d'environnement pour passer par le proxy afin d'accéder à des ressources sur internet

        ```bash
        export HTTP_PROXY=http://100.78.56.201:8002
        export HTTPS_PROXY=http://100.78.56.201:8002
        ```

    2. Il faut spécifier un nouveau dossier `npm` pour le user afin d’éviter des [problèmes de permissions](https://stackoverflow.com/questions/48910876/error-eacces-permission-denied-access-usr-local-lib-node-modules/55274930#55274930)

        ```bash
        mkdir ~/.npm-global
        npm config set prefix '~/.npm-global'
        ```

    3. Editer le fichier `.bashrc` avec les commandes suivantes :

        ```bash
        echo "export PATH=~/.npm-global/bin:\$PATH" >> ~/.bashrc
        source  ~/.bashrc
        ```

    4. Installer YARN et les dépendances

        ```bash
        npm i --global yarn
        # dans front-it/app/ :
        yarn
        ```

        💡 Attention, l'application front React en elle-même est dans le sous-dossier app/, c'est là où se trouve le package.json, donc les commandes yarn doivent toujours être lancées depuis front-it/app/ sinon elles ne fonctionneront pas.

    5. Créez un fichier un .env.local

        Copier les variables du .env.example et compléter les valeurs. Pour se connecter à l'API, il faut spécifier l'url du serveur back lancé en local auparavant (voir la doc de l'API sur le repo `champolib`).

        ```bash
        VITE_API_BASE_URL=http://localhost:8002 # remplacer 8002 par le port sur lequel vous avez lancé l'API.
        ```

## Lancer l'application en local

Dans `front-it/app/`, lancez :

```bash
yarn dev
```

(Facultatif) Pour lancer facilement l'application, vous pouvez également ajouter la fonction suivante à votre fichier `~/.bashrc`. Exécutez `startapp` avec les arguments souhaités.

Vous aurez besoin d'ajouter une variable d'environnement spécifiant le chemin du repo.

```bash
export FRONT_REPOSITORY_PATH= # mettre le chemin de votre environnement jusqu'à code/front-it/
```

```bash
startapp () {
     local OPTIND
     local api=$VITE_API_BASE_URL

     Help()
     {
     # Display Help
     echo "Launch a local node server."
     echo
     echo "Syntax: bash launch.sh [-h|a]"
     echo "options:"
     echo "h             display this help and exit"
     echo "a             api url (default: ${VITE_API_BASE_URL})"
     }

     while getopts "ha:" flag
     do
          case "${flag}" in
                h)  # display help
                     Help
                     kill -INT $$;;
                a)  local api=${OPTARG};;
          esac
     done

     VITE_API_BASE_URL=$api yarn --cwd ${FRONT_REPOSITORY_PATH}/app/ dev
}
```
