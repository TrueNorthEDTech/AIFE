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

        const prompt = `You are a world-class strategic consultant and AI implementation architect. Analyze the provided consultation session between a user and Glowie (the AI from "Designing for AGENCY").

Your goal is to produce a deep, high-impact PDF-ready report in JSON format.

CONVERSATION:
${conversationText}

JSON STRUCTURE REQUIREMENTS:
{
  "role": "<user role>",
  "framework": "<RISE, AGENCY, or PROMPT focus>",
  "stage": "<Emerging, Developing, Advancing, or Leading>",
  "trustScore": "<A percentage 0-100 representing their 'Agency' vs 'Fear' leaning, where 100 is pure Agency>",
  "summary": "<4-sentence deep synthesis mapping their institutional fears to agentic opportunities using the book's core philosophy>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "actions": [
    { "timeline": "Immediate (Next 7 Days)", "title": "<action>", "description": "<detailed description>" },
    { "timeline": "Short-term (30-Day Goal)", "title": "<action>", "description": "<detailed description>" },
    { "timeline": "Strategic (90-Day Vision)", "title": "<action>", "description": "<detailed description>" }
  ],
  "stakeholders": [
    { "role": "Students", "strategy": "<alignment strategy>" },
    { "role": "Teachers", "strategy": "<alignment strategy>" },
    { "role": "Leadership/Parents", "strategy": "<alignment strategy>" }
  ],
  "bookReferences": [
    { "concept": "<concept info>", "chapter": "Book Section", "application": "<how it applies to their friction points>" }
  ],
  "pilot2026": {
    "recommended": true,
    "why": "<1 sentence on why they are a good fit for the Pilot 2026 program based on their answers>",
    "cta": "You are a prime candidate for our early 2026 True North Pilot. Register interest below."
  },
  "nextSteps": "Continue the conversation at truenorthed.tech and stay tuned for the Pilot 2026 launch."
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
