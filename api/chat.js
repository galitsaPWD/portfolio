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
            "https://router.huggingface.co/hf-inference/v1/chat/completions",
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    model: "mistralai/Mistral-7B-Instruct-v0.3",
                    messages: [
                        { role: "system", content: "you are cael, the quiet and minimal ai assistant for carlwyne's portfolio. your tone is always lowercase, atmospheric, and brief. never use emoji. don't use capital letters." },
                        { role: "user", content: message }
                    ],
                    max_tokens: 60,
                    temperature: 0.7
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

        // OpenAI-style response: data.choices[0].message.content
        if (data.choices && data.choices[0]?.message?.content) {
            let text = data.choices[0].message.content.trim();
            return res.status(200).json({ response: text.toLowerCase() });
        } else {
            return res.status(500).json({ error: 'Unexpected response format', data });
        }
    } catch (error) {
        console.error('[Proxy] Crash:', error.message);
        return res.status(500).json({ error: `Proxy Crash: ${error.message}` });
    }
}
