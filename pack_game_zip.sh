#!/usr/bin/env sh
set -eu

ZIP_NAME="Transcendence-web_$(date +%Y%m%d_%H%M%S).zip"

zip -r "$ZIP_NAME" docker-compose.yml Dockerfile transcendence-web \
  -x "*/node_modules/*" "*/dist/*" "*.DS_Store"

echo "Utworzono paczke: $ZIP_NAME"
