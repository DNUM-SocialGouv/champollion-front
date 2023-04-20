#!/bin/bash

JS_DIR=./dist/assets

MAIN=$(ls $JS_DIR/index*.js)
CHUNK=$(ls $JS_DIR/dsfr*.js)

echo " > Starting obfuscation of "${MAIN[0]}' <'
javascript-obfuscator ${MAIN[0]} --output ${MAIN[0]} --compact true --self-defending true --simplify true

echo " > Starting obfuscation of "${CHUNK[0]}' <'
javascript-obfuscator ${CHUNK[0]} --output ${CHUNK[0]} --compact true --self-defending true --simplify true