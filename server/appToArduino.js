const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { MongoClient } = require('mongodb');
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

const uri = 'mongodb://localhost:27017/';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
    if (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    } else {
        console.log('Connected to MongoDB');
    }

    const db = client.db('ledControl');
    const collection = db.collection('ledConfigs');

    app.post('/led/colors', async (req, res) => {
        const { colors, brightness } = req.body;
        console.log(`Received colors: ${colors}, brightness: ${brightness}`);

        // Convert hex color to RGB values
        const rgbColors = colors.map(color => {
            if (color.length === 7 && color[0] === '#') {
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                return `${r},${g},${b}`;
            } else {
                res.status(400).send('Invalid color format');
                console.log('Invalid color format');
                return null;
            }
        });

        if (rgbColors.includes(null)) {
            return; // Exit if any color format is invalid
        }

        const rgbString = rgbColors.join(';') + `;${brightness}\n`;

        arduinoPort.write(rgbString, async (err) => {
            if (err) {
                console.error('Error writing to port:', err.message);
                return res.status(500).send('Error writing to Arduino');
            }

            try {
                await collection.updateOne(
                    { configName: 'currentConfig' },
                    { $set: { colors, brightness } },
                    { upsert: true }
                );
                res.send(`Colors and brightness sent to Arduino and saved to MongoDB as ${rgbString}`);
                console.log(`Colors and brightness sent to Arduino and saved to MongoDB as ${rgbString}`);
            } catch (dbErr) {
                console.error('Error saving to MongoDB:', dbErr.message);
                res.status(500).send('Error saving to MongoDB');
            }
        });
    });
    app.get('/led/colors', async (req, res) => {
        try {
            const config = await collection.findOne({ configName: 'currentConfig' });
            if (config) {
                res.json(config);
            } else {
                res.status(404).send('Config not found');
            }
        } catch (dbErr) {
            console.error('Error fetching from MongoDB:', dbErr.message);
            res.status(500).send('Error fetching from MongoDB');
        }
    });


    app.listen(port, () => {
        console.log();
        console.log(`Server is running on port ${port}`);
    });
});