import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=([^\r\n]+)/);
if (!keyMatch) {
    console.error('API key not found in .env.local');
    process.exit(1);
}

const apiKey = keyMatch[1].trim();
console.log('Testing KEY starting with: ' + apiKey.substring(0, 5) + '...');

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const result = await model.generateContent('Confirma si me recibes diciendo OK');
        console.log('GEMINI ACTUAL RESPONSE:', result.response.text());
    } catch(e) {
        console.error('GEMINI ACTUAL ERROR CATCHED:', e.status, e.message);
    }
}
test();
