#!/bin/bash

set -e

if [ $# -ne 1 ]; then
    echo "Usage: ./run-kube.sh <RESOURCE_FILENAME>"
    exit 1
fi


RESOURCE_FILENAME=$1
RESOURCE_NAME="$(basename -s .yaml $RESOURCE_FILENAME)"
echo "RESOURCE_NAME:" $RESOURCE_NAME
# Inspect the YAML to find the actual test-script name...
SCRIPT_NAME="$(yq -r '.spec.script.configMap.file' $RESOURCE_FILENAME)"
echo "SCRIPT_NAME:" $SCRIPT_NAME
# Clean up the script name and append the unique timestamp
TAG_PREFIX="$(basename -s .js $SCRIPT_NAME)"
TAG_NAME="99999-$(date +%H-%M-%S)"
echo "test id:" $TAG_NAME

# Replacement doesn't seem to trigger, so we need to delete any previous execution
kubectl delete --ignore-not-found=true --wait=true -f $RESOURCE_FILENAME -n k6

# Update '--tag testid=...' to include the test-script name and timestamp for uniqueness, then apply
sed "s/testid\=${RESOURCE_NAME}/testid\=${TAG_NAME}/g" $RESOURCE_FILENAME | kubectl apply  -f - -n k6
