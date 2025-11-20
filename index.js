const express = require('express');
const app = express();

app.use(express.json());

const urlDatabase = {};
let nextId = 1;

function generateShortCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortcode = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        shortcode += characters[randomIndex];
    }
    return shortcode;
}

function generateUniqueShortCode() {
    let shortCode = generateShortCode();

    while (urlDatabase[shortCode]) {
        shortCode = generateShortCode();
    }
    return shortCode;
}

app.post('/shorten', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            error: 'URL is required'
        });
    }

    const shortCode = generateUniqueShortCode();

    const urlObject = {
        id: String(nextId++),
        url: url,
        shortCode: shortCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessCount: 0
    }

    urlDatabase[shortCode] = urlObject;

    res.status(201).json(urlObject);
});

app.get('/shorten/:shortCode/stats', (req, res) => { 
    const { shortCode } = req.params;

    const urlObject = urlDatabase[shortCode];

    if (!urlObject) {
        return res.status(404).json({
            error: 'Short URL not found'
        });
    }

    res.status(200).json(urlObject);
});

app.get('/shorten/:shortCode', (req, res) => {
    const { shortCode } = req.params;

    const urlObject = urlDatabase[shortCode];

    if(!urlObject) {
        return res.status(404).json({
            error: 'Short URL not found'
        });
    }

    urlObject.accessCount++;
    res.status(200).json(urlObject);
});

app.put('/shorten/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const { url } = req.body;

    if (!url) {
        return res.status(400).json()({
            error: 'URL is required'
        });
    }

    const urlObject = urlDatabase[shortCode];

    if (!urlObject) {
        return res.status(404).json({
            error: 'Short URL not found'
        });
    }

    urlObject.url = url;
    urlObject.updatedAt = new Date().toISOString();

    res.status(200).json(urlObject);
});

app.delete('/shorten/:shortCode', (req, res) => {
    const { shortCode } = req.params;

    if (!urlDatabase[shortCode]) {
        return res.status(404).json({
            error: 'Short URL not found'
        })
    }

    delete urlDatabase[shortCode];
    res.status(204).send();
})

app.get('/', (req, res) => {
    res.json({ message: 'URL Shortener API' });
});

app.listen(3000, () => {
    console.log('URL Shortener API is running on port 3000');
    console.log('\nAvailable endpoints:');
    console.log('  POST   /shorten');
    console.log('  GET    /shorten/:shortCode');
    console.log('  PUT    /shorten/:shortCode');
    console.log('  DELETE /shorten/:shortCode');
    console.log('  GET    /shorten/:shortCode/stats');
});