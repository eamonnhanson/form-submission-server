import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
    res.send('Welkom bij de formulierverzendingsserver!');
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
                    // Voeg andere formuliergegevens hier toe
                };

                // Verzend gegevens naar Zoho Creator via webhook
                await fetch('https://flow.zoho.eu/20071889412/flow/webhook/incoming?zapikey=1001.135d0547db270fb2604b6772f9c30ac1.e1c3971a221b2993f3d850b4b348471a&isdebug=false', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

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

app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
