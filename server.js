const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/submit-form', (req, res) => {
    const formData = req.body;
    const zohoWebhookUrl = 'https://flow.zoho.eu/20071889412/flow/webhook/incoming?zapikey=1001.135d0547db270fb2604b6772f9c30ac1.e1c3971a221b2993f3d850b4b348471a&isdebug=false';

    axios.post(zohoWebhookUrl, formData)
        .then(response => {
            console.log('Form submitted successfully to Zoho', response.data);
            res.status(200).send('Form submitted successfully');
        })
        .catch(error => {
            console.error('Error submitting form to Zoho', error);
            res.status(500).send('Error submitting form');
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
