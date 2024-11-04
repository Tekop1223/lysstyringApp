# LED Control Application

This project is an LED control application that allows users to select and send colors to an Arduino via a web server. The application also stores the LED configurations in a MongoDB database.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running-the-App](#Running-the-App)
- [Usage](#usage)
- [License](#license)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine.
- MongoDB installed and running on your machine.
- An Arduino connected to your machine.


### Extra
- if changes in the arduino code is needed you will have to install Arduino's own IDE.

## Installation

1. Clone the repository.

```sh
git clone https://github.com/yourusername/led-control-app.git
cd led-control-app
```

2. Install server dependencies.
```sh
cd server 
npm install
```

3. Install App dependencies.
```sh
npm install
```


## Running the App
1. find out what COM-port the arduino is connected to.

2. start mongodb.

3. start the express server.
```sh
cd server
node appToArduino.js
```

4. start React Native App.
```sh
npm start
```

## Usage
select a color from the color picker.
the config is saved to the database.

## License
This project is licensed under the MIT License.
