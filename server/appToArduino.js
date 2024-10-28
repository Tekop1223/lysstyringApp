const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const app = express();
const port = 3000;

const arduinoPort = new SerialPort({
    path: 'COM20',
    baudRate: 9600,
    autoOpen: false,
});

const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));




arduinoPort.open((err) => {
    if (err) {
        console.log('Error,', err.message);
        process.exit(1);
    } else {
        console.log('Arduino connected');
    }
});

arduinoPort.on('error', (err) => {
    console.error('Error:', err.message);
});

//Handles incoming data from Arduino
parser.on('data', (data) => {
    console.log('Data from Arduino:', data);
});

app.use(express.json());

app.post('/led/color', (req, res) => {
    const { color, brightness } = req.body;

    console.log("server:");
    console.log();
    console.log(`reviced color ${color}, brightness ${brightness}`);

    // convert hex color to RGB values
    if (color.length === 7 && color[0] === '#') {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const rgbString = `${r},${g},${b},${brightness}\n`;

        arduinoPort.write(rgbString, (err) => {
            if (err) {
                console.error('Error writing to port:', err.message);
                return res.status(500).send('Error writing to Arduino');
            }
            res.send(`Color ${color} and  ${brightness} sent to Arduino as ${rgbString}`);
            console.log(`Color ${color} and ${brightness} sent to Arduino as ${rgbString}`);
        });

    } else {
        res.status(400).send('invalid color format')
        console.log(`invalid color format`);
    }

});

app.listen(port, () => {
    console.log();
    console.log(`Server is running on port ${port}`);
});