# MWS – Project: Restaurant Reviews - Stage 3

---

## Project Details
The Restaurant Reviews Stage 3 project is part of a 3-stages project included in the curriculum of the Mobile Web Specialist Nanodegree Program created by Google & Udacity.

**Restaurant Reviews Stage 1-2** – These stages demonstrates my abilities to turn a Non-Mobile Ready, Non-Accessible, and Non-PWA project into a fully Accessible, and functioning Progressive Web App with a genuine first class Offline First user experience. Utilizing the powerful Service Worker feature which will replace the old App Cache. Thus, demonstrating the initial skillsets I obtained from my training during the first period of the program along with my previously acquired skills.
Stage 2 introduces some major optimizations to the web app which can be measured with Google's Lighthouse utilities. I've also added lazy loading for all images in this stage.

**Stage 3** – This is the final stage, which demonstrates how to make a performant PWA. This has involved Background Sync
and many other additional features. Including Browser Optimization techniques, and etc.

---

## About Restaurant Reviews
Restaurant Reviews is perhaps already pretty much self-explanatory. Its main function is to show a map and list of restaurants in a city, therefore allowing the user to explore available restaurants and see the restaurant's customer reviews in order to make a good lunch/dinner decision suiting their current food preferences.

---

## Getting started

### You'll need to start the backend server at localhost:1337
https://github.com/udacity/mws-restaurant-stage-3
Copy the database file in this – R-H-T/mws-restaurant-stage-1 project's directory `ext-servers/localDiskDb_2.db`
and replace it with the /mws-restaurant-stage-3/ project's `.tmp/localDiskDb.db` (Note: rename `localDiskDb_2.db`
to `localDiskDb.db`).

### Prerequisites
* Node.js - Node Package Manager (npm).
* Sass.

### Setup
1. Clone the project.
1. From the project root directory run `npm install`.

### Begin Development
1. Run `npm run images` whenever you add any new images to `src/img_src` (*see the "Image Workflow"-section for more details*).
2. Update the Google Maps API key to your own (*see the `TODO` inside `src/index.js`*).
3. Run `npm run start` to start in live Development Mode. Make any changes inside the "`src/`"-directory. The following url will get automatically opened in your default browser: http://localhost:8080/

### Lighthouse Testing
After running the two first steps of **Begin Development**:
1. Run `npm run audit` and open either http://localhost:8181/ or https://localhost:8443/ (Requires a trusted certificate).
2. Open Incognito-mode in the Chrome browser and disable any plugins to avoid interferance during tests.
3. Run Chrome Lighthouse in the Developer Tools panel (check Accessibility, Performance, Progressive Web App).
---

## Available Commands
* `npm run start` – Builds and starts the project in Development Mode (Webpack Dev Server). This environment enables Live Reloading of any changes you make to the watched directories configured within the `webpack.config.js`-file. A Node.js server will be providing the Web Socket connection and the Restaurants Data API.
* `npm run audit` – Builds and starts the project in Production mode with a test server (Node & Express, Webpack Dev Server Middleware). This command is intended for Lighthouse testing in Chrome.
* `npm run dev` – Builds the project in plain Development Mode. The files will be generated inside the dist folder and most of the files will be un-minified for debugging purposes (_Not recommended for production - see `npm run build` instead_).
* `npm run watch` – Starts a Watch task in Development Mode.
* `npm run images` – Generates responsive images from `src/img_source/` to `src/img/`. Any image you wish not to be processed should go into the `src/img_source/fixed/`-directory. (Note: This section usese Grunt).
* `npm run build` – Builds the project in Production Mode. The files will be generated inside the dist folder in a minified format, ideal for production use.
* `npm run test` – Runs all the tests available in the project.
* `npm run test:watch` – Runs tests in watch mode.
* `npm run coverage` – Runs all tests and displays test coverage.

---

## License
Code added after forking the base project - Copyright ©2018 – Roberth Hansson-Tornéus - [R-H-T](https://github.com/R-H-T) (Gawee.Narak@gmail.com)

See the code owners file for a full list of accredited code owners. Or go to [the base project](https://github.com/udacity/mws-restaurant-stage-1).
