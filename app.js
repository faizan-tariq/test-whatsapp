// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Function to send WhatsApp Template Message using BUILT-IN fetch (no require)
async function sendWhatsAppTemplate() {
  const url = "https://graph.facebook.com/v22.0/927033603821768/messages";

  const payload = {
    messaging_product: "whatsapp",
    to: "923334646887",
    type: "template",
    template: {
      name: "testing",
      language: { code: "en_US" }
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": "Bearer EAAWCaXok8gQBQHm7RIbKkUR19GnltDCUOnSgd8AfvBxNImc337hGabzDG2Lei5SX68rMuhuhqToCkheViQ4Jvp4nRIh9ZA1oSX0cWGohACGqBako7IGmiSy8TwtZA3PFaZAQz8U5DMtjpZBOQ6P1DPmABaZAZC5q5NoyAIH9m3ZCaMH3pgOZBdhMYjGC2IrNLOeyM0bafsmaBWsyepfIQFowGSsyCX6wN2zAlBmq9wyipzyex7GaYZCv4JganYj3wLcfEa2rymf3faMatWUVWVyfy5eSukHpkSjQZD",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("WhatsApp API Response:", data);

  } catch (error) {
    console.error("API Request Error:", error);
  }
}

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const statuses = value?.statuses?.[0];

    const messageStatus = statuses?.status;

    // Only call the API when status === 'sent'
    if (messageStatus === "sent") {
      console.log("✔ Message status is 'sent' — sending template...");
      await sendWhatsAppTemplate();
    }

  } catch (error) {
    console.error("Error processing webhook:", error);
  }

  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
