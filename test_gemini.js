const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.log('No API key found in .env.local');
        return;
    }
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const result = await model.generateContent('Hola, responde con un simple OK si me escuchas.');
        console.log('Gemini Response:', result.response.text());
    } catch(e) {
        console.error('Gemini Error:', e.message);
    }
}
test();
