# MWS – Project: Restaurant Reviews - Stage 1

---

## Project Details
The Restaurant Reviews Stage 1 project is part of a 3-stages project included in the curriculum of the Mobile Web Specialist Nanodegree Program created by Google & Udacity.

**Restaurant Reviews Stage 1** – This stage demonstrates my abilities to turn a Non-Mobile Ready, Non-Accessible, and Non-PWA project into a fully Accessible, and functioning Progressive Web App with a genuine first class Offline First user experience. Utilizing the powerful Service Worker feature which will replace the old App Cache. Thus, demonstrating the initial skillsets I obtained from my training during the first period of the program along with my previously acquired skills.

---

## About Restaurant Reviews
Restaurant Reviews is perhaps already pretty much self-explanatory. Its main function is to show a map and list of restaurants in a city, therefore allowing the user to explore available restaurants and see the restaurant's customer reviews in order to make a good lunch/dinner decision suiting their current food preferences.

---

## Getting started


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

---

## Available Commands
* `npm run start` – Builds and starts the project in Development Mode (Webpack Dev Server). This environment enables Live Reloading of any changes you make to the watched directories configured within the `webpack.config.js`-file. A Node.js server will be providing the Web Socket connection and the Restaurants Data API.
* `npm run dev` – Builds the project in plain Development Mode. The files will be generated inside the dist folder and most of the files will be un-minified for debugging purposes (_Not recommended for production - see `npm run build` instead_).
* `npm run watch` – Starts a Watch task in Development Mode.
* `npm run images` – Generates responsive images from `src/img_source/` to `src/img/`. Any image you wish not to be processed should go into the `src/img_source/fixed/`-directory.
* `npm run build` – Builds the project in Production Mode. The files will be generated inside the dist folder in a minified format, ideal for production use.
* `npm run test` – Runs all the tests available in the project.
* `npm run test:watch` – Runs tests in watch mode.
* `npm run coverage` – Runs all tests and displays test coverage.

---

## License
Code added after forking the base project - Copyright ©2018 – Roberth Hansson-Tornéus - [R-H-T](https://github.com/R-H-T) (Gawee.Narak@gmail.com)

See the code owners file for a full list of accredited code owners. Or go to [the base project](https://github.com/udacity/mws-restaurant-stage-1).
