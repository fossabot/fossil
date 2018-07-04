#!/usr/bin/env bash

# Exit the script as soon as something fails.
set -e

if [ ! -f ./.env ]; 

then
  echo "Creating enviornment variables template file. ./.env "

  ENV_VARS='
  FIREBASE_PROD_KEY=""
  FIREBASE_PROD_DOMAIN=""
  FIREBASE_PROD_URL=""
  FIREBASE_PROD_ID=""
  FIREBASE_PROD_BUCKET=""
  FIREBASE_PROD_SENDER_ID=""

  FIREBASE_DEV_KEY=""
  FIREBASE_DEV_DOMAIN=""
  FIREBASE_DEV_URL=""
  FIREBASE_DEV_ID=""
  FIREBASE_DEV_BUCKET=""
  FIREBASE_DEV_SENDER_ID=""

  MAPBOX_PROD_TOKEN=""
  MAPBOX_DEV_TOKEN=""

  GOOGLE_ANALYTICS_ID=""

  AWS_PROJECT_NAME=""
  AWS_ECR_REGISTRY=""
  AWS_ECS_INSTANCE_ROLE=""
  AWS_EC2_KEY_PAIR_NAME=""

  FRONTEND_PROJECT_TITLE=""
  FRONTEND_PROJECT_DESCRIPTION=""
  '
  > .env

  echo "${ENV_VARS}" > .env

  echo "Done"
  echo "Make sure to edit it and provide your own keys."

else
  echo ".env file already exists. I won't overwrite it."
fi
