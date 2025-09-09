#!/bin/bash

# Load NVM and use the version from .nvmrc
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install
nvm use

# Clean and build
rm -rf node_modules package-lock.json ~/.npm
npm cache clean --force
npm install --legacy-peer-deps
ROLLUP_WASM=1 npm run build
