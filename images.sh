
# Build
docker build -t andrewdelph/video-call-nginx:latest ./nginx
docker build -t andrewdelph/video-call-websocket:latest -f ./server/. .
docker build -t andrewdelph/video-call-matcher:latest -f ./functions/. .

docker push andrewdelph/video-call-nginx:latest 
docker push andrewdelph/video-call-websocket:latest 
docker push andrewdelph/video-call-matcher:latest 