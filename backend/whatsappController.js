const https = require('https');

const sendWhatsappMessage = (req, res) => {
    const { to, template, message, imageUrl } = req.body;

    console.log('WhatsApp Message Request Received:');
    console.log('  To:', to);
    console.log('  Template:', template);
    console.log('  Message:', message);
    console.log('  ImageUrl:', imageUrl);

    const TOKEN = process.env.WHATSAPP_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!TOKEN || !PHONE_NUMBER_ID) {
        console.error('WhatsApp credentials are not configured on the server.');
        return res.status(500).json({ message: 'WhatsApp credentials are not configured on the server.' });
    }

    console.log('  Using Phone Number ID:', PHONE_NUMBER_ID);
    console.log('  WhatsApp Token present:', !!TOKEN);

    let data;
    if (template) {
        const templateComponents = [];
        if (imageUrl) {
            templateComponents.push({
                type: "header",
                parameters: [
                    {
                        type: "image",
                        image: {
                            link: imageUrl
                        }
                    }
                ]
            });
        }

        data = JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "template",
            template: {
                name: template,
                language: { code: "en" },
                components: templateComponents
            }
        });
    } else {
        data = JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: {
                body: message
            }
        });
    }

    console.log('  WhatsApp API Request Payload:', data);

    const options = {
        hostname: 'graph.facebook.com',
        path: `/v22.0/${PHONE_NUMBER_ID}/messages`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const request = https.request(options, (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
            responseBody += chunk;
        });
        response.on('end', () => {
            console.log('WhatsApp API Response Status:', response.statusCode);
            console.log('WhatsApp API Response Body:', responseBody);
            try {
                res.status(response.statusCode).json(JSON.parse(responseBody));
            } catch (e) {
                console.error('Error parsing WhatsApp API response:', e);
                res.status(500).json({ message: 'Failed to parse WhatsApp API response.', error: responseBody });
            }
        });
    });

    request.on('error', (error) => {
        console.error('WhatsApp API Request Error:', error);
        res.status(500).json({ message: 'Failed to send WhatsApp message.', error: error.message });
    });

    request.write(data);
    request.end();
};

const getWhatsappTemplates = (req, res) => {
    const TOKEN = process.env.WHATSAPP_TOKEN;
    const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID; // Assuming this is set in .env

    if (!TOKEN) {
        console.error('WhatsApp API credentials: WHATSAPP_TOKEN is not configured on the server.');
        return res.status(500).json({ message: 'WhatsApp API credentials (WHATSAPP_TOKEN) are not configured on the server.' });
    }
    if (!WHATSAPP_BUSINESS_ACCOUNT_ID) {
        console.error('WhatsApp API credentials: WHATSAPP_BUSINESS_ACCOUNT_ID is not configured on the server.');
        return res.status(500).json({ message: 'WhatsApp API credentials (WHATSAPP_BUSINESS_ACCOUNT_ID) are not configured on the server.' });
    }

    const options = {
        hostname: 'graph.facebook.com',
        path: `/v22.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates?access_token=${TOKEN}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const request = https.request(options, (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
            responseBody += chunk;
        });
        response.on('end', () => {
            try {
                const apiResponse = JSON.parse(responseBody);
                if (response.statusCode === 200 && apiResponse.data) {
                    // Map the templates to the format expected by the frontend
                    const formattedTemplates = apiResponse.data.map(template => ({
                        id: template.id,
                        name: template.name,
                        components: template.components || [], // Ensure components array exists
                    }));
                    res.status(200).json({ data: formattedTemplates });
                } else {
                    console.error('Error fetching WhatsApp templates from API:', apiResponse);
                    res.status(response.statusCode || 500).json({ message: 'Failed to fetch WhatsApp templates.', error: apiResponse });
                }
            } catch (e) {
                console.error('Error parsing WhatsApp API response for templates:', e);
                res.status(500).json({ message: 'Failed to parse WhatsApp API response for templates.', error: responseBody });
            }
        });
    });

    request.on('error', (error) => {
        console.error('WhatsApp API Request Error for templates:', error);
        res.status(500).json({ message: 'Failed to fetch WhatsApp templates.', error: error.message });
    });

    request.end();
};

module.exports = {
    sendWhatsappMessage,
    getWhatsappTemplates
};

module.exports = {
    sendWhatsappMessage,
    getWhatsappTemplates
};