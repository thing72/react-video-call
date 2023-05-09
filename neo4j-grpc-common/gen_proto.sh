#!/bin/bash

# Exit the script if any command fails
set -e
buf build -o image.json
buf generate

# npx grpc_tools_node_protoc \
#       --ts_out=grpc_js:./src/gen \
#       --js_out=import_style=commonjs:./src/gen \
#       --grpc_out=grpc_js:./src/gen \
#       -I ./proto \
#       ./proto/*.proto ./proto/google/api/*.proto