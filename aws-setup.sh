#!/usr/bin/env bash

# //////////////////////////////////////////////////////////////////////////////
# You may also want to adjust a few of the global variables below to suite your
# aws project configuration. Change those in .env file
# //////////////////////////////////////////////////////////////////////////////

# Exit the script as soon as something fails.
set -e
# Source AWS variables from .env file
source .env

# Create ECS Config directory if it doesn't exist
mkdir -p ecs-config

PROJECT_NAME="${AWS_PROJECT_NAME}"
SECURITY_GROUP_NAME="${PROJECT_NAME}"-security
SECURITY_GROUP_DESC="Security Group for ${PROJECT_NAME} deployments on us-east-1"
REGISTRY="${AWS_ECR_REGISTRY}"
LOCAL_FRONTEND_REPO_NAME="${PROJECT_NAME}-frontend-repo"
AWS_FRONTEND_REPO_NAME="${PROJECT_NAME}/${PROJECT_NAME}-frontend-repo"
BUILD="latest"
S3_BUCKET="${PROJECT_NAME}-bucket"
ECS_INSTANCE_ROLE=${AWS_ECS_INSTANCE_ROLE}
KEY_PAIR_NAME=${AWS_EC2_KEY_PAIR_NAME}
EC2_INSTANCE_COUNT=1
ELB_NAME="${PROJECT_NAME}-elb"
CLUSTER_NAME="${PROJECT_NAME}-cluster"
TASK_DEFINITION_NAME="${PROJECT_NAME}"-task
SERVICE_NAME="${PROJECT_NAME}"-service

# ===========================
# Security Group Setup
# ===========================
function setup_security_group() {
  # Create and store Group ID
  SECURITY_GROUP=$( \
  aws ec2 create-security-group \
  --group-name $SECURITY_GROUP_NAME \
  --description "$SECURITY_GROUP_DESC" \
  | python -c "import sys, json; print(json.load(sys.stdin)['GroupId'])")

  # Setup up port configuration
  aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP --protocol tcp --port 22 --cidr 0.0.0.0/0
  aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP --protocol tcp --port 80 --cidr 0.0.0.0/0
  aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP --protocol tcp --port 3000 --cidr 0.0.0.0/0

  # Sanity Check: View config
  aws ec2 describe-security-groups --group-id $SECURITY_GROUP

}

# ===========================
# ECR Setup
# ===========================
function setup_ecr() {
  # Create docker cluster
  aws ecs create-cluster --cluster-name $CLUSTER_NAME

  # Authenticate
  $(aws ecr get-login --no-include-email)

  # Frontend Image
  ## Create a new repository for front-end and store its URI
  FRONTEND_REPO_URI=$( \
    aws ecr create-repository --repository-name $AWS_FRONTEND_REPO_NAME \
    | python -c "import sys, json; print(json.load(sys.stdin)['repository']['repositoryUri'])")

  ## Build, Tag and Push the Image to ECR
  docker build -t "$LOCAL_FRONTEND_REPO_NAME" .
  docker tag "$LOCAL_FRONTEND_REPO_NAME":latest "$FRONTEND_REPO_URI":latest
  docker push $FRONTEND_REPO_URI
}

# ===========================
# S3 Setup
# ===========================
function setup_s3(){
  ## Replace the placeholder cluster name & bucket name with project specific names.
  sed -e "s/PLACEHOLDER_CLUSTER_NAME/${CLUSTER_NAME}/g"  "ecs-config-template/ecs.config" > "ecs-config/ecs.config"
  sed -e "s/PLACEHOLDER_BUCKET_NAME/${S3_BUCKET}/g" "ecs-config-template/copy-ecs-config-to-s3" > "ecs-config/copy-ecs-config-to-s3"

  # Your bucket name
  aws s3api create-bucket --bucket $S3_BUCKET
  aws s3 cp ecs-config/ecs.config s3://"$S3_BUCKET"/ecs.config
  # Sanity Check
  aws s3 ls s3://"$S3_BUCKET"
}

# ===========================
# EC2 Setup
# ===========================
function setup_ec2(){
  # Get the security group
  SECURITY_GROUP=$( \
    aws ec2 describe-security-groups --filters "Name=group-name,Values=${SECURITY_GROUP_NAME}" \
    | python -c "import sys, json; print(json.load(sys.stdin)['SecurityGroups'][0]['GroupId'])")

  # Create EC2 Instances
  # Provide your own instance role & key pair names
  aws ec2 run-instances --image-id ami-2b3b6041 --count $EC2_INSTANCE_COUNT --instance-type t2.micro \
   --iam-instance-profile Name=$ECS_INSTANCE_ROLE --security-group-ids $SECURITY_GROUP \
   --key-name $KEY_PAIR_NAME --user-data file://ecs-config/copy-ecs-config-to-s3
  ## The ami2b3b6041 is the official Amazon ECS AMI for useast1
}

# ===========================
# ELB Setup
# ===========================
function setup_elb(){
  SECURITY_GROUP=$( \
    aws ec2 describe-security-groups --filters "Name=group-name,Values=${SECURITY_GROUP_NAME}" \
    | python -c "import sys, json; print(json.load(sys.stdin)['SecurityGroups'][0]['GroupId'])")

  INSTANCE_IDS=$(aws ec2 describe-instances --filters "Name=instance.group-id,Values=$SECURITY_GROUP" --output text --query Reservations[].Instances[].InstanceId)
  SUBNET_IDS=$(aws ec2 describe-subnets --output text --query Subnets[].SubnetId)

  ELB_DNS_NAME=$( \
    aws elb create-load-balancer --load-balancer-name "$ELB_NAME" \
    --listeners "Protocol=HTTP,LoadBalancerPort=80,InstanceProtocol=HTTP,InstancePort=80" \
    --subnets $SUBNET_IDS --security-groups $SECURITY_GROUP \
    | python -c "import sys, json; print(json.load(sys.stdin)['DNSName'])")

  # Configure the idle timeout period
  aws elb modify-load-balancer-attributes --load-balancer-name "$ELB_NAME" \
  --load-balancer-attributes "{\"ConnectionSettings\":{\"IdleTimeout\":5}}"

  # Register EC2 Instances
  aws elb register-instances-with-load-balancer \
  --load-balancer-name "$ELB_NAME" --instances $INSTANCE_IDS
}

# ===========================
# ECS Setup
# ===========================
function setup_ecs(){
  ## Santiy Check: Give it a minute. List the instances that joined the cluster
  aws ecs list-container-instances --cluster $CLUSTER_NAME

  ## Replace the placeholder project and registry name in task definition file.
  sed -e "s/PLACEHOLDER_PROJECT_NAME/${PROJECT_NAME}/g" "ecs-config-template/web-task-definition.json" > "ecs-config/web-task-definition-temp.json"
  sed -e "s/PLACEHOLDER_REGISTRY/${REGISTRY}/g" "ecs-config/web-task-definition-temp.json" > "ecs-config/web-task-definition.json"
  rm ecs-config/web-task-definition-temp.json
  ## Sanity check: Print the task definition
  python -m json.tool "ecs-config/web-task-definition.json"

  # Register the task definition
  TASK_REGISTER=$(\
  aws ecs register-task-definition \
  --cli-input-json file://ecs-config/web-task-definition.json)

  ## Grab revision # using regular bash and grep
  TASK_REVISION=$(echo "$TASK_REGISTER" | grep -o '"revision": [0-9]*' | grep -Eo '[0-9]+')

  # Create a service
  aws ecs create-service --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --task-definition "$TASK_DEFINITION_NAME":"$TASK_REVISION"  --desired-count 1

  aws ecs list-services --cluster $CLUSTER_NAME

  # Deploy revision
  # aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition "$TASK_DEFINITION_NAME":"$TASK_REVISION" --desired-count 1

  # (Optional) Set desired count to 2 for zero downtime during rolling update. Set it to 3 for higher loads.
  # aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME \
  # --task-definition "$TASK_DEFINITION_NAME":"$TASK_REVISION" --desired-count 2

}

# ===========================
# TEARDOWN COMMANDS
# ===========================
# Teardown Security group
function delete_security_group(){
  SECURITY_GROUP=$( \
    aws ec2 describe-security-groups --filters "Name=group-name,Values=${SECURITY_GROUP_NAME}" \
    | python -c "import sys, json; print(json.load(sys.stdin)['SecurityGroups'][0]['GroupId'])")

  # Remove the security group
  aws ec2 delete-security-group --group-id SECURITY_GROUP
}

# Teardown ECR
function delete_ecr(){
  # Delete the Nuxt Frontend repository
  aws ecr delete-repository --repository-name $AWS_FRONTEND_REPO_NAME --force
}

# Teardown S3
function delete_s3(){
  # Delete the files in the S3 bucket
  aws s3 rm s3://"$S3_BUCKET" --recursive
  # Delete the S3 bucket
  aws s3api delete-bucket --bucket $S3_BUCKET
}

# Teardown EC2
function delete_ec2(){
  # Terminate the EC2 instances
  ## Get the security group
  SECURITY_GROUP=$( \
    aws ec2 describe-security-groups --filters "Name=group-name,Values=${SECURITY_GROUP_NAME}" \
    | python -c "import sys, json; print(json.load(sys.stdin)['SecurityGroups'][0]['GroupId'])")

  ## Get the instance Ids
  INSTANCE_IDS=$(aws ec2 describe-instances --filters "Name=instance.group-id,Values=$SECURITY_GROUP" --output text --query Reservations[].Instances[].InstanceId)
  ## Terminate the EC2 Instances
  aws ec2 terminate-instances --instance-ids $INSTANCE_IDS
}

# Teardown ELB
function delete_elb(){
  # Terminate the ELB
  aws elb delete-load-balancer --load-balancer-name $ELB_NAME
}

# Teardown ECS
function delete_ecs(){
  # Delete the cluster
  aws ecs delete-cluster --cluster $CLUSTER_NAME

  # Deregister the task definition
  ## Get the Task revision
  TASK_REVISION=$(echo "$TASK_REGISTER" | grep -o '"revision": [0-9]*' | grep -Eo '[0-9]+')
  ## Deregister the task definition
  aws ecs deregister-task-definition --task-definition "$TASK_DEFINITION_NAME":"$TASK_REVISION"

  # Delete the service
  aws ecs delete-service --service $SERVICE_NAME

}

# ===========================
# HELP MENU
# ===========================
function help_menu () {
cat << EOF
Project Name: ${PROJECT_NAME}
Registry: ${REGISTRY}

Usage: ${0} -h

OPTIONS:

   -h|--help                    Show this message

   -1|--setup-security-group    Setup new secrurity group
   -2|--setup-ecr               Setup Docker repository in ECR
   -3|--setup-s3                Setup S3 bucket with ECS config file
   -4|--setup-ec2               Setup EC2 as containers
   -5|--setup-elb               Setup classic load balancer
   -6|--setup-ecs               Setup ECS task and deploy a new service

   --delete-security-group      Teardown the security group
   --delete-ecr                 Teardown Docker repository in ECR
   --delete-s3                  Teardown S3 bucket with ECS config file
   --delete-ec2                 Teardown EC2 as containers
   --delete-elb                 Teardown classic load balancer
   --delete-ecs                 Teardown the cluster, task, and service

EOF
}

# Deal with command line flags.
while [[ $# > 0 ]]
do
case "${1}" in
  -1|--setup-security-group)
  setup_security_group
  shift
  ;;
  -2|--setup-ecr)
  setup_ecr
  shift
  ;;
  -3|--setup-s3)
  setup_s3
  shift
  ;;
  -4|--setup-ec2)
  setup_ec2
  shift
  ;;
  -5|--setup-elb)
  setup_elb
  shift
  ;;
  -6|--setup-ecs)
  setup_ecs
  shift
  ;;
  --delete-security-group)
  delete_security_group
  shift
  ;;
  --delete-ecr)
  delete_ecr
  shift
  ;;
  --delete-s3)
  delete_s3
  shift
  ;;
  --delete-ec2)
  delete_ec2
  shift
  ;;
  --delete-elb)
  delete_elb
  shift
  ;;
  --delete-ecs)
  delete_ecs
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
