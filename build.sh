#!/bin/bash

Help() {
    # Display Help
    echo "Build and push docker images of the repository."
    echo
    echo "Syntax: bash build.sh [-h|e|p|i]"
    echo "options:"
    echo "h          display this help and exit"
    echo "e          env file"
    echo "p          optional, push images to Nexus"
    echo "i          optional, ignore image to build and push ('app', 'oauth2-proxy' or 'reverse-proxy')"
}

while getopts "he:pi:" flag; do
    case "${flag}" in
    h) Help && exit 1 ;;
    e) env=${OPTARG} ;;
    p) push=${OPTARG:-"disable"} ;;
    i) ignore+=(${OPTARG}) ;;
    esac
done

# export environment variables
if [[ -z $env ]]; then
    echo "-e argument is required. Help:" && Help && exit 0
elif ! [[ -f $env ]]; then
    echo "file specified with -e argument does not exists. Help:" && Help && exit 0
else
    export $(grep -v "^#" $env | xargs)
    export HTTPS_PROXY=$HTTP_PROXY
fi

# ignore images
if [ ${#ignore[@]} -ge 1 ]; then
    for image in "${ignore[@]}"; do
        if [[ $image == "app" ]]; then
            ignore_app=true
        elif [[ $image == "oauth2-proxy" ]]; then
            ignore_oauth2_proxy=true
        elif [[ $image == "reverse-proxy" ]]; then
            ignore_reverse_proxy=true
        else
            echo "unavailable images specified by -i argument." && Help && exit 0
        fi
    done
fi

# login to the nexus
if ! [[ -z $push ]]; then
    echo $CI_REGISTRY_PASSWORD | docker login nexus-ovh.intranet.social.gouv.fr:5000 --username $CI_REGISTRY_USER --password-stdin
fi

# build and push
if [[ -z $ignore_app ]]; then
    docker build --rm --file ./app/Dockerfile \
        --build-arg HTTP_PROXY=${HTTP_PROXY} \
        --build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} \
        --build-arg VITE_LOGOUT_URL=${VITE_LOGOUT_URL} \
        --build-arg VITE_MATOMO_SITE_ID=${VITE_MATOMO_SITE_ID} \
        --build-arg VITE_MATOMO_URL=${VITE_MATOMO_URL} \
        --tag ${CI_REGISTRY}:5000/champollion-${CI_REGISTRY_ENV}/front/app:${APP_IMAGE_TAG} \
        ./app

    if ! [[ -z $push ]]; then
        docker image push ${CI_REGISTRY}:5000/champollion-${CI_REGISTRY_ENV}/front/app:${APP_IMAGE_TAG}
    fi
fi

if [[ -z $ignore_oauth2_proxy ]]; then
    docker build --rm --file ./oauth2-proxy/Dockerfile \
        --tag ${CI_REGISTRY}:5000/champollion-${CI_REGISTRY_ENV}/front/oauth2-proxy:${OAUTH2_PROXY_IMAGE_TAG} \
        ./oauth2-proxy

    if ! [[ -z $push ]]; then
        docker image push ${CI_REGISTRY}:5000/champollion-${CI_REGISTRY_ENV}/front/oauth2-proxy:${OAUTH2_PROXY_IMAGE_TAG}
    fi
fi

if [[ -z $ignore_reverse_proxy ]]; then
    docker build --rm --file ./reverse-proxy/Dockerfile \
        --build-arg HTTP_PROXY=${HTTP_PROXY} \
        --build-arg APP_URL=${APP_URL} \
        --build-arg APP_CERTIFICATE_FILE=${APP_CERTIFICATE_FILE} \
        --build-arg APP_CERTIFICATE_PASSWORD=${APP_CERTIFICATE_PASSWORD} \
        --tag ${CI_REGISTRY}:5000/champollion-${CI_REGISTRY_ENV}/front/reverse-proxy:${REVERSE_PROXY_IMAGE_TAG} \
        ./reverse-proxy

    if ! [[ -z $push ]]; then
        docker image push ${CI_REGISTRY}:5000/champollion-${CI_REGISTRY_ENV}/front/reverse-proxy:${REVERSE_PROXY_IMAGE_TAG}
    fi
fi
