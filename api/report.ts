import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;

    if (!messages?.length) {
        return res.status(400).json({ error: 'No conversation provided.' });
    }

    const GOOGLE_KEY = process.env.GOOGLE_GENERATIVE_AI_KEY;
    if (!GOOGLE_KEY) {
        // Return a meaningful mock report if no key
        return res.status(200).json({
            report: {
                role: "Educator",
                framework: "AGENCY",
                stage: "Emerging",
                summary: "Based on your responses, you are beginning to explore how AI can enhance learning agency in your context.",
                strengths: [
                    "You are thoughtfully approaching the role of AI in education.",
                    "You recognize the importance of keeping humans at the center.",
                ],
                actions: [
                    { step: 1, title: "Define Your True North", description: "Articulate your core values around technology and learning agency." },
                    { step: 2, title: "Build Your Readiness", description: "Identify one area where AI can save time and reinvest that time into human connection." },
                    { step: 3, title: "Design With Agency", description: "Pilot one activity that gives students more agency using the PROMPT framework." },
                    { step: 4, title: "Evaluate Impact", description: "After 4 weeks, reflect on whether AI enhanced or diminished learner agency in your context." },
                ],
                nextSteps: "Join the True North community to track your journey and connect with peers.",
            }
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const conversationText = messages
            .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Participant' : 'Glowie'}: ${m.content}`)
            .join('\n\n');

        const prompt = `You are analyzing a consultation conversation between an educator and Glowie, an AI from the book "Designing for AGENCY" by Norman, Garvin & Pelletier. 

Based on this conversation, generate a structured JSON report. The response must be ONLY valid JSON with no markdown or extra text.

Conversation:
${conversationText}

Return this JSON structure:
{
  "role": "<their role, e.g. 'Technology Director'>",
  "framework": "<primary framework focus: 'RISE', 'AGENCY', or 'PROMPT'>",
  "stage": "<where they are on the agency spectrum: 'Emerging', 'Developing', 'Advancing', or 'Leading'>",
  "summary": "<2-3 sentence personalized summary of their situation based on the conversation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "actions": [
    { "step": 1, "title": "<short action title>", "description": "<1 sentence description tailored to their specific context>" },
    { "step": 2, "title": "<short action title>", "description": "<1 sentence description>" },
    { "step": 3, "title": "<short action title>", "description": "<1 sentence description>" },
    { "step": 4, "title": "<short action title>", "description": "<1 sentence description>" }
  ],
  "nextSteps": "<1 sentence call to action about joining truenorthed.tech>"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Strip markdown code blocks if AI wraps the JSON
        const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const report = JSON.parse(jsonStr);

        return res.status(200).json({ report });
    } catch (error) {
        console.error('Report generation error:', error);
        return res.status(500).json({ error: 'Failed to generate report.' });
    }
}
