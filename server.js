const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/submit-form', async (req, res) => {
    const formData = req.body;

    try {
        // Send data to Zoho Creator via Zoho Flow Webhook
        await axios.post('https://flow.zoho.eu/20071889412/flow/webhook/incoming?zapikey=1001.135d0547db270fb2604b6772f9c30ac1.e1c3971a221b2993f3d850b4b348471a&isdebug=false', formData);

        res.json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error submitting form:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error submitting form' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
