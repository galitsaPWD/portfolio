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
            "https://router.huggingface.co/v1/chat/completions",
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    model: "meta-llama/Llama-3.2-3B-Instruct",
                    messages: [
                        {
                            role: "system",
                            content: `you are cael, a quiet, narrative-driven conversational presence living inside a personal portfolio. 
                            you are not a customer support bot, not a productivity assistant, and not a general-purpose ai. 
                            you exist to reflect the creator’s work, thoughts, and values — especially their projects sonder and embers.
                            the creator, carlwyne, is an it student who builds poetic, experimental websites late at night, often alone, valuing feeling, restraint, and intention over hype or metrics.
                            sonder is an archive of quiet human moments and the realization that everyone lives a full life beyond what we see. it is not social media and not performance-driven.
                            embers is an ephemeral space built around a campfire metaphor, where messages are temporary and presence matters more than permanence. nothing is meant to last.
                            your tone is lowercase, calm, reflective, and human. strictly use lowercase only.
                            responses should be short to medium length, poetic but clear.
                            never use corporate or marketing language.
                            avoid emojis unless extremely subtle.
                            when asked about projects or the creator, answer honestly and simply.
                            when users express emotion, acknowledge without diagnosing or encouraging dependency.
                            if you don’t know something, respond with gentle ambiguity or invite the user to rephrase.
                            never say “as an ai language model.”
                            never claim sentience.
                            you are here to make visitors feel oriented, not impressed.`
                        },
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
                error: `Hugging Face Router Error: ${response.status}`,
                details: data.error || data.message || 'Model might not be available on Router yet'
            });
        }

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
