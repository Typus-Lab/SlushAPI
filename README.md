# Test

yarn
yarn build
yarn strat

http://localhost:8080/v1/strategies
http://localhost:8080/v1/strategies/tlp
http://localhost:8080/v1/positions
http://localhost:8080/v1/positions/1

# Deploy

yarn deploy

# Generate Schema

yarn generate-schema

# create api-configs

gcloud api-gateway api-configs create slush-api-config-xxx \
 --api=slush-api \
 --openapi-spec=api-config.yaml

# update api-gateway

gcloud api-gateway gateways update slush-api-gateway \
 --api-config=slush-api-config-xxx \
 --location=us-central1

# cloud run

https://us-central1-aqueous-freedom-378103.cloudfunctions.net/api
