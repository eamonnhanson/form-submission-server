const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/submit', async (req, res) => {
    try {
        // Perform any server-side validation or processing here
        const data = req.body;

        // Send data to Zoho webhook
        const response = await axios.post('https://flow.zoho.eu/20071889412/flow/webhook/incoming', data, {
            params: {
                zapikey: '1001.135d0547db270fb2604b6772f9c30ac1.e1c3971a221b2993f3d850b4b348471a',
                isdebug: 'false'
            }
        });

        res.status(200).send('Form submission successful');
    } catch (error) {
        res.status(500).send('Error submitting form');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});