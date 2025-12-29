// api/chat.js (Vercel Serverless Function)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    // Retrieve API key from environment variables
    const apiKey = process.env.HF_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured on server' });
    }

    try {
        // Standard API endpoint is most reliable for specific model calls
        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: `[INST] context: you are cael, the quiet and minimal ai assistant for carlwyne's portfolio. your tone is always lowercase, atmospheric, and brief. never use emoji. visitor asks: ${message} [/INST]`,
                    parameters: { max_new_tokens: 60, temperature: 0.7 }
                }),
            }
        );

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                error: `Hugging Face API Error: ${response.status}`,
                details: errData
            });
        }

        const result = await response.json();

        if (result && result[0] && result[0].generated_text) {
            let text = result[0].generated_text.split('[/INST]').pop().trim();
            return res.status(200).json({ response: text.toLowerCase() });
        } else {
            return res.status(500).json({ error: 'Invalid response from AI model', result });
        }
    } catch (error) {
        return res.status(500).json({ error: `Proxy Crash: ${error.message}` });
    }
}
