#!/usr/bin/env bash

# //////////////////////////////////////////////////////////////////////////////
# You may also want to adjust a few of the global variables below to suite your
# aws project configuration.
# //////////////////////////////////////////////////////////////////////////////

# Exit the script as soon as something fails.
set -e
# Source AWS variables from .env file
source .env

PROJECT_NAME="${AWS_PROJECT_NAME}"
REGISTRY="${AWS_ECR_REGISTRY}"
FRONTEND_REPO="${PROJECT_NAME}/${PROJECT_NAME}-frontend-repo"
BUILD="latest"
IMAGE_URI="${REGISTRY}"/"${FRONTEND_REPO}":"${BUILD}"
CLUSTER="${PROJECT_NAME}-cluster"
TASK_FAMILY_NAME="${PROJECT_NAME}"-family
TASK_DEFINITION_NAME="${PROJECT_NAME}"-task
SERVICE_NAME="${PROJECT_NAME}"-service

# =============================
# Push the image to registry
# =============================
function push_to_registry () {
  # Automatically refresh the authentication token with ECR.
  $(aws ecr get-login --no-include-email)
  
  # Frontend Image
  ## Build latest image
  docker image build -t "${FRONTEND_REPO}" .
  ## Tag the build with the previously initialized build tag variable
  docker tag "${FRONTEND_REPO}:${BUILD}" "${REGISTRY}/${FRONTEND_REPO}:${BUILD}"
  ## Push it to ECR 
  docker push "${REGISTRY}/${FRONTEND_REPO}:${BUILD}"

}

# =============================
# Update the container service
# =============================
function update_web_service () {
  TASK_REGISTER=$(\
  aws ecs register-task-definition \
    --cli-input-json file://ecs-config/web-task-definition.json)
  # Grab revision # using regular bash and grep
  TASK_REVISION=$(echo "$TASK_REGISTER" | grep -o '"revision": [0-9]*' | grep -Eo '[0-9]+')
  
  # aws ecs create-service --cluster $CLUSTER --service-name $SERVICE_NAME \
  #   --task-definition "${TASK_FAMILY_NAME}":"${TASK_REVISION}" --desired-count 1
    
  aws ecs update-service --cluster "${CLUSTER}" --service "${SERVICE_NAME}" \
    --task-definition "${TASK_FAMILY_NAME}":"${TASK_REVISION}" --desired-count 1
}

# =============================
# Do everything
# =============================
function all () {
  push_to_registry
  update_web_service
}

# =============================
# Help Menu
# =============================
function help_menu () {
cat << EOF
Usage: ${0} (-h | -p | -w | -r | -d | -a)

OPTIONS:
   -h|--help             Show this message
   -p|--push-to-registry Push the web application to your private registry
   -u|--update-web       Update the web application
   -a|--all              Do everything except migrate the database

EOF
}

# Deal with command line flags.
while [[ $# > 0 ]]
do
case "${1}" in
  -p|--push-to-registry)
  push_to_registry
  shift
  ;;
  -u|--update-web)
  update_web_service
  shift
  ;;
  -a|--all)
  all
  shift
  ;;
  -h|--help)
  help_menu
  shift
  ;;
  *)
  echo "${1} is not a valid flag, try running: ${0} --help"
  ;;
esac
shift
done
