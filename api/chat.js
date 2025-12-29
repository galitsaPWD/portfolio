// api/chat.js (Vercel Serverless Function)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    // Retrieve API key and TRIM it to avoid copy-paste spaces
    const apiKey = process.env.HF_API_KEY?.trim();

    // Log the first 4 chars of the key ONLY for diagnostics (safe)
    console.log(`[Proxy] API Key diagnostic: ${apiKey ? apiKey.substring(0, 4) + '...' : 'MISSING'}`);

    if (!apiKey) {
        return res.status(500).json({ error: 'HF_API_KEY is not defined in Vercel environment variables' });
    }

    try {
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/google/gemma-2-9b-it",
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

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            console.error('[Proxy] HF Error:', response.status, data);
            return res.status(response.status).json({
                error: `Hugging Face Error: ${response.status}`,
                details: data.error || data.message || 'Check model availability'
            });
        }

        if (Array.isArray(data) && data[0]?.generated_text) {
            let text = data[0].generated_text.split('[/INST]').pop().trim();
            return res.status(200).json({ response: text.toLowerCase() });
        } else {
            return res.status(500).json({ response: "i am here. just quiet for a moment.", details: 'Unexpected format', data });
        }
    } catch (error) {
        console.error('[Proxy] Crash:', error.message);
        return res.status(500).json({ error: `Proxy Crash: ${error.message}` });
    }
}
