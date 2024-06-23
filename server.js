const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint for form submission
app.post('/submit-form', async (req, res) => {
    const formData = req.body;
    console.log('Form data received:', formData);

    // Validate the email and "Teller" value with Zoho CRM
    try {
        const response = await fetch('https://zoho-calls-e0dc91dd8cf4.herokuapp.com/fetch-achternaam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: formData['contact[email]'] })
        });
        
        const data = await response.json();
        console.log('Data received from Zoho CRM:', data);

        if (data.data && data.data.length > 0) {
            const userRecord = data.data[0];
            if (userRecord.Teller < 6) {
                // Collect necessary fields to send to Zoho Creator via webhook
                const payload = {
                    Voornaam: userRecord.Voornaam,
                    Achternaam: userRecord.Achternaam,
                    Email: userRecord.Email,
                    Teller: userRecord.Teller,
                    Bedrijf: userRecord.Bedrijf,
                    // Add other form data here
                };

                // Send data to Zoho Creator via webhook
                await fetch('https://flow.zoho.eu/20071889412/flow/webhook/incoming?zapikey=1001.135d0547db270fb2604b6772f9c30ac1.e1c3971a221b2993f3d850b4b348471a&isdebug=false', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                res.json({ message: 'Form submitted successfully', data: payload });
            } else {
                res.status(400).json({ error: 'Teller value is 6 or greater' });
            }
        } else {
            res.status(404).json({ error: 'No matching records found' });
        }
    } catch (error) {
        console.error('Error verifying access token or submitting data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
