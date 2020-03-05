# Amazon Warfare
## Team Members:
- Anthony Baietto
- Jared Clabough
- Sarah Flanagan
- Dan Filler
- Srini Srinivas

## Get the code:
- clone git repo
- install node.js, npm
- run `npm install` from the root to install server dependencies
- cd into `/ui` and run `npm install` to install UI dependencies

## Run the server:
This starts the server at localhost:5000 - which you can reach via web browser by typing that in as the URL. This is not a live version of the app - it is the static version in `/ui/build`. This is how the code would be executed when deployed to a webserver. However, any changes to the server-side code will update and restart the app as soon as they are saved.

- From root directory OR from `/ui/`, run `npm run build` 
    - This creates a new build from the current UI source code
- From the root directory run `npm run start-server`
- Open a web browser and go to `localhost:5000`

## Run the UI Live:
This runs a live version of the UI which updates every time you save. This currently works because the UI does not get information from the server - it has a small, local dataset of questions from the mockup. Eventually, this may not be possible without starting the server too.

- From the `/ui/` directory run `npm run start`
- The app should automatically open in the default browser, to `localhost:3000`

## Run Tests:
 A template/example UI test can be found in `/ui/src/components/inputs/ButtonList/button.test_travis.js`. Tests should be placed in the folder with the file they are testing for easy imports. Tests for a file should always be of format `file_name.test_travis.js`. This will allow Jest to find the tests when running them and to keep our file structure simple and consistent. 
 
 To execute tests:
 - From root directory run `npm run test`