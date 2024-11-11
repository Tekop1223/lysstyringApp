const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

app.use(cors(
    {
        origin: `http://localhost:${port}`,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }
))
app.use(express.json());

const arduinoPort = new SerialPort({
    path: 'COM20',
    baudRate: 9600,
    autoOpen: false,
});

const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// serial port event listeners
parser.on('data', (data) => {
    console.log('Data from Arduino:', data);
});

arduinoPort.on('open', () => {
    console.log('Serial Port Opened');
});

arduinoPort.on('error', (err) => {
    console.error('Error opening serial port:', err.message);
});

const uri = 'mongodb://localhost:27017/';
const client = new MongoClient(uri);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db('ledControl').collection('ledConfigs');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        return null;
    }
}

arduinoPort.open((err) => {
    if (err) {
        console.error('Error opening serial port:', err.message);
        return;
    }

    app.post('/led/colors', async (req, res) => {
        console.log('Received POST /led/colors with body:', req.body);

        const collection = await connectToMongoDB();
        if (!collection) {
            return res.status(500).send({ error: 'Error connecting to MongoDB' });
        }
        const { colors, brightness } = req.body;

        if (!Array.isArray(colors) || typeof brightness !== 'number') {
            console.error('Invalid color or brightness:', req.body);
            return res.status(400).send({ error: 'Invalid color or brightness' });
        }
        console.log(`Received colors: ${colors}, brightness: ${brightness}`);

        const ColorString = colors.join(';') + `;${brightness}\n`;

        arduinoPort.write(ColorString, async (err) => {
            if (err) {
                console.error('Error writing to port:', err.message);
                res.status(500).send({ error: 'Failed to write to Arduino' });
            } else {
                console.log('Successfully wrote to Arduino');
                try {
                    const updateConfig = await collection.updateOne(
                        { configName: 'currentConfig' },
                        { $set: { colors, brightness } },
                        { upsert: true }
                    );
                    console.log('successfully updated config:', updateConfig);
                    const rgbString = colors.join(', ') + `, ${brightness}`;
                    res.send(`Colors and brightness sent to Arduino and saved to MongoDB as ${rgbString}`);
                    console.log(`Colors and brightness sent to Arduino and saved to MongoDB as ${rgbString}`);
                } catch (dbErr) {
                    console.error('Error saving to MongoDB:', dbErr.message);
                    res.status(500).send('Error saving to MongoDB');
                }
            }
        });
    });

    app.get('/led/colors', async (req, res) => {
        const collection = await connectToMongoDB();
        if (!collection) {
            return res.status(500).send({ error: 'Error connecting to MongoDB' });
        }
        try {
            const config = await collection.findOne({ configName: 'currentConfig' });
            if (config) {
                res.json(config);
            } else {
                res.status(404).send('Config not found');
            }
        } catch (error) {
            console.error('Error retrieving config from MongoDB:', error.message);
            res.status(500).send('Error retrieving config from MongoDB');
        }
    });

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});