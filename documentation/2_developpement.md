## 2. Environnement de développement

L'environnement de développement de l'application du projet Champollion est prévu pour être setup sur la VM Lab de l'infrasctrure OVH (0V1-APP-LAB-DEV-003). La procédure qui suit est configurée pour cet environnement (Rocky Linux).

## Mise en place

1. Fork le repo 

    Allez sur https://gitlab.intranet.social.gouv.fr/champollion/front-it/forks/new pour fork le repository Champolib.

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

4. Configurer git

    Pour la connexion à Gitlab la configuration suivante est requise (préciser les valeurs pour **GIT_EMAIL** et **GIT_USER**) : 

    ```bash
    # git config
    git config --global remote.origin.proxy ""
    git config --global remote.upstream.proxy ""
    git config --global credential.helper store
    git config --global user.email **GIT_EMAIL** # example: lguillaume@sg.social.gouv.fr
    git config --global user.name **GIT_USER** # example: leoguillaume
    ```

5. Exporter les variables d'environnements

    Remplacer **GIT_USER** pour votre identifiant git (voir l'URL de votre fork).

    ```bash
    export FRONT_REPOSITORY_REMOTE_URL=https://gitlab.intranet.social.gouv.fr/champollion/front-it
    export FRONT_REPOSITORY_ORIGIN_URL=https://gitlab.intranet.social.gouv.fr/**GIT_USER**/front-it
    ```

6. Cloner le repository et ajouter l'upstream

    ``` bash
    git clone ${FRONT_REPOSITORY_ORIGIN_URL} ~/code/front-it
    cd ~/code/front-it && git remote add upstream ${FRONT_REPOSITORY_REMOTE_URL}
    ```

7. Installation des dépendances nécessaires

    1. Exportez les variables d'environnement pour passer par le proxy afin d'accéder à des ressources sur internet

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
        npm i --global yarn && yarn --cwd ${FRONT_REPOSITORY_PATH}/app/
        ```
    
    5. Créez un fichier un .env.local

        [TO DO]
        ```bash
        VITE_API_BASE_URL=
        VITE_LOGOUT_URL=
        ```

## Lancer l'application en local

Pour lancer facilement l'application, vous pouvez ajouter la fonction suivante à votre fichier `~/.bashrc`. Exécutez `startapp` avec les arguments souhaités.

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
    echo "h          display this help and exit"
    echo "a          api url (default: ${VITE_API_BASE_URL})"
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
