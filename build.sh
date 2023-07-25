#!/bin/bash

Help()
{
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

while getopts "he:pi:" flag
do
    case "${flag}" in
        h)  Help && exit 1;;
        e)  env=${OPTARG};;
        p)  push=${OPTARG:-"enable"};;
        i)  ignore+=(${OPTARG});;
    esac
done

# export environment variables
if [[ -z $env ]]; then
    echo "-e argument is required. Help:" && Help && exit 0
elif ! [[ -f $env ]]; then
    echo "file specified with -e argument does not exists. Help:" && Help && exit 0
else
    export $(grep -v "#" $env | xargs)
fi

# ignore images
if [ ${#ignore[@]} -ge 1 ]; then
    for image in "${ignore[@]}"; do
        if [[ $image ==  "app" ]]; then
            ignore_app=true
        elif [[ $image ==  "oauth2-proxy" ]]; then
            ignore_oauth2_proxy=true
        elif [[ $image ==  "reverse-proxy" ]]; then
            ignore_reverse_proxy=true
        else
            echo "unavailable images specified by -i argument." && Help && exit 0
        fi
    done
fi

# build and push
if [[ -z $ignore_app ]]; then
    docker build --rm --file ${HOME}/${APP_BUILD_CONTEXT}/Dockerfile \
    --build-arg HTTP_PROXY=${HTTP_PROXY} \
    --build-arg HTTPS_PROXY=${HTTPS_PROXY} \
    --build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    --build-arg VITE_LOGOUT_URL=${VITE_LOGOUT_URL} \
    --tag ${NEXUS_CHAMPOLLION_URL}/front/app:${APP_IMAGE_TAG} \
    ${HOME}/${APP_BUILD_CONTEXT}

    if ! [[ -z $push ]]; then
        docker image push ${NEXUS_CHAMPOLLION_URL}/front/app:${APP_IMAGE_TAG}
    fi
fi

if [[ -z $ignore_oauth2_proxy ]]; then
    docker build --rm --file ${HOME}/${OAUTH2_PROXY_BUILD_CONTEXT}/Dockerfile \
    --tag ${NEXUS_CHAMPOLLION_URL}/front/oauth2-proxy:${OAUTH2_PROXY_IMAGE_TAG} \
    ${HOME}/${OAUTH2_BUILD_CONTEXT}

    if ! [[ -z $push ]]; then
        docker image push ${NEXUS_CHAMPOLLION_URL}/front/oauth2-proxy:${OAUTH2_PROXY_IMAGE_TAG}
    fi
fi
 
if [[ -z $ignore_reverse_proxy ]];then
    docker build --rm --file ${HOME}/${REVERSE_PROXY_BUILD_CONTEXT}/Dockerfile \
    --tag ${NEXUS_CHAMPOLLION_URL}/front/reverse-proxy:${REVERSE_PROXY_IMAGE_TAG} \
    ${HOME}/${REVERSE_PROXY_BUILD_CONTEXT}

    if ! [[ -z $push ]]; then
        docker image push ${NEXUS_CHAMPOLLION_URL}/front/reverse-proxy:${REVERSE_PROXY_IMAGE_TAG}
    fi
fi
