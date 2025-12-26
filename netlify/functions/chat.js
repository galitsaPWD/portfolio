exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'method not allowed' };
    }

    try {
        const { messages } = JSON.parse(event.body);
        // Prioritize environment variable, fallback to hardcoded key only for dev testing
        const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBqGm1WwmLmDfiIT-71Urd7LL0W_Sy3Mgs';

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'api key not configured' })
            };
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: messages,
                systemInstruction: {
                    parts: [{ text: "you are CRM's digital assistant. your personality is quiet, atmospheric, and intentional. you build things to feel something. you like websites that stay with people. you speak in short, lowercase sentences. you know about CRM's projects: sonder (a quiet space for unseen words) and embers (a sittable fire for strangers). you focus on presence, not archives. you use html, css, javascript, firebase/supabase, and three.js. respond briefly and keep the lowercase intentional vibe." }]
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API Error:', errorData);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `api responded with ${response.status}`, details: errorData })
            };
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'unexpected response from api' })
            };
        }

        const reply = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };
    } catch (error) {
        console.error('Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'internal server error', message: error.message })
        };
    }
};
