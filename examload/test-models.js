require('dotenv').config({ path: '.env.local' });

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(m => console.log(m.name, '-', m.supportedGenerationMethods));
    } else {
      console.log('Error listing models:', data);
    }
  } catch (e) {
    console.error('API Error:', e.message);
  }
}
listModels();
