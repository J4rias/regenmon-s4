import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=([^\r\n]+)/);
const apiKey = keyMatch[1].trim();

async function test(modelName) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Confirma si me recibes diciendo OK');
        console.log('[' + modelName + '] RESPONSE:', result.response.text());
    } catch(e) {
        console.error('[' + modelName + '] ERROR:', e.status, e.message.substring(0, 100));
    }
}
async function runAll() {
    await test('gemini-1.5-flash');
    await test('gemini-1.5-pro');
}
runAll();
