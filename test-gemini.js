require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Key length:', apiKey ? apiKey.length : 0);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent('Hello');
    console.log(result.response.text());
  } catch (e) {
    console.error('API Error:', e.message);
  }
}
test();
