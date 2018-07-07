# Fossil
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FUrbanSystemsLab%2Ffossil.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FUrbanSystemsLab%2Ffossil?ref=badge_shield)

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


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FUrbanSystemsLab%2Ffossil.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FUrbanSystemsLab%2Ffossil?ref=badge_large)