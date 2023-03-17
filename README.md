# Living Legend
made with the ArcGIS Maps SDK for JavaScript, Node.js and ESP32.

---

Send the map legend to a RGB LED strip like [here](https://www.instagram.com/reel/CpglP7nA4MB)!

## This repo

### ArtnetStore
...contains logic to pull values out of legend by executing the Arcade expression from the UniqueValueRenderer standalone in the JS code (look for ```arcade.createArcadeExecutor()```).

### ArtnetCmp
Every time the map is stationary, the function ```statisticsLedVals()``` will calculate number of LEDs needed for every legend value. This information is split up into 6 rows, after which every 2nd row is being reversed. Split and reverse happens because the strip was folded several times, running like a snake in 6 rows.

Please note that this piece of code is custom to the strip connected in the above linked video. Depending on what you build, you need to figure out the LED distribution. Some factorization and clipping is applied to make it somehow work better ;)

Some nice ideas:
* Make it big. Make the whole stage, the whole room your map legend.
* Go to the World Climate Conference, wrap a tree in LEDs, play temporal map data on environmental pollution and show on your tree legend how trees are dying.
* [...own ideas here ...]

After each calculation, the data is being sent out to localhost.
## Other repos needed to make sense of this

### artnet-http
You can use my fork of Dewb's [``artnet-http`` project](https://github.com/esride-nik/artnet-http) to run a small Node.js application on localhost that receives data from the map, transforms it into Artnet and sends it over to the ESP32.

### esp32_artnet
Use this [ESP32 firmware](https://github.com/esride-nik/esp32_artnet) to receive data from ``artnet-http`` and put it on your LED strip via FastLED.


---


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
