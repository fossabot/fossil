# PAGES

This directory contains Application Views and Routes.
The framework reads all the .vue files inside this directory and creates the router of your application.

More information about the usage of this directory in the documentation:
https://nuxtjs.org/guide/routing

```sh
📂 [pages]
└ 📂 share
  └ 📄 _id.vue
└ 📄 index.vue

```
- `index.vue`: Root page of the application
- `share/_id.vue`: Accepts a short link and fetches the associated long link. Then redirect the page to the long link
