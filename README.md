# Fossil
*Application for managing and visualizing maps.Built with Nuxt and Mapbox-gl-js.*

Read the [wiki](https://github.com/UrbanSystemsLab/fossil/wiki) for detailed setup.

## Build Setup
``` bash
# install dependencies
npm install

# Create .env at the root of the repo containing environment variables
# See wiki/Environment-Variables
./create-env-file.sh
# Provide your own environment variables

# serve with hot reload at localhost:8080
npm run dev
```

## Docker Dev Build
``` bash
# Run frontend.
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up
## Teardown
docker-compose -f docker-compose.dev.yml down -v --rmi all
```
