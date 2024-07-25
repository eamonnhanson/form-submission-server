import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors({
    origin: 'https://www.planteenboom.nu', // Replace with your Shopify store domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
    res.send('Welkom bij de wpmmobiliteit formulierverzendingsserver!');
});

// Endpoint voor formulierverzending
app.post('/submit-form', async (req, res) => {
    const formData = req.body;
    console.log('Form data received:', formData);

    // Valideer de email en "Teller" waarde met Zoho CRM
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
                // Verzamel de benodigde velden om naar Zoho Creator te sturen via webhook
                const payload = {
                    Voornaam: userRecord.Voornaam,
                    Achternaam: userRecord.Achternaam,
                    Email: userRecord.Email,
                    Teller: userRecord.Teller,
                    Bedrijf: userRecord.Bedrijf,
                    // Voeg formuliergegevens hier toe
                    vehicle_zondag: formData.vehicle_zondag,
                    fuel_zondag: formData.fuel_zondag,
                    kilometers_zondag: formData.kilometers_zondag,
                    vehicle_maandag: formData.vehicle_maandag,
                    fuel_maandag: formData.fuel_maandag,
                    kilometers_maandag: formData.kilometers_maandag,
                    vehicle_dinsdag: formData.vehicle_dinsdag,
                    fuel_dinsdag: formData.fuel_dinsdag,
                    kilometers_dinsdag: formData.kilometers_dinsdag,
                    vehicle_woensdag: formData.vehicle_woensdag,
                    fuel_woensdag: formData.fuel_woensdag,
                    kilometers_woensdag: formData.kilometers_woensdag,
                    vehicle_donderdag: formData.vehicle_donderdag,
                    fuel_donderdag: formData.fuel_donderdag,
                    kilometers_donderdag: formData.kilometers_donderdag,
                    vehicle_vrijdag: formData.vehicle_vrijdag,
                    fuel_vrijdag: formData.fuel_vrijdag,
                    kilometers_vrijdag: formData.kilometers_vrijdag,
                    vehicle_zaterdag: formData.vehicle_zaterdag,
                    fuel_zaterdag: formData.fuel_zaterdag,
                    kilometers_zaterdag: formData.kilometers_zaterdag
                };

                // Verzend gegevens naar Zoho Creator via webhook
                const zohoResponse = await fetch('https://flow.zoho.eu/20071889412/flow/webhook/incoming?zapikey=1001.135d0547db270fb2604b6772f9c30ac1.e1c3971a221b2993f3d850b4b348471a&isdebug=false', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!zohoResponse.ok) {
                    throw new Error('Error sending data to Zoho Creator: ' + zohoResponse.statusText);
                }

                res.json({ message: 'Formulier succesvol verzonden', data: payload });
            } else {
                res.status(400).json({ error: 'Teller waarde is 6 of groter' });
            }
        } else {
            res.status(404).json({ error: 'Geen overeenkomende records gevonden' });
        }
    } catch (error) {
        console.error('Fout bij het verifiëren van de toegangstoken of het verzenden van gegevens:', error);
        res.status(500).json({ error: 'Interne serverfout' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
