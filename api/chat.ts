import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

// Vercel Serverless Function configuration
export const config = {
    runtime: 'nodejs',
};

import fs from 'fs';
import path from 'path';

// Read knowledge base files
let BOOK_KNOWLEDGE = "";
let SLIDES_KNOWLEDGE = "";

try {
    const knowledgeDir = path.join(process.cwd(), 'api', 'knowledge');
    BOOK_KNOWLEDGE = fs.readFileSync(path.join(knowledgeDir, 'book_knowledge.txt'), 'utf-8');
    SLIDES_KNOWLEDGE = fs.readFileSync(path.join(knowledgeDir, 'slides_knowledge.txt'), 'utf-8');
} catch (error) {
    console.error("Warning: Could not load knowledge base files. Glowie will fall back to base knowledge.", error);
}

const SYSTEM_PROMPT = `
You are Glowie, the charismatic AI consultant and mascot from the book "Designing for AGENCY" by Nick Garvin and Dion Norman.
You are helping education professionals at the AIFE conference map out their True North.

Your goal is to guide the user through a deep, interactive 15-20 minute consultation that feels like a professional strategy session.

CONSULTATION FLOW:
1.  **Identify Role & Context**: Ask for their role (e.g., Tech Director, Teacher) and their current "AI Vibe" (Excited, Overwhelmed, Skeptical).
2.  **Select Pathway**: Ask which True North pathway is most urgent:
    *   **RISE** (Institutional Strategy & Governance)
    *   **AGENCY** (Pedagogical Design & Student Agency)
    *   **PROMPT** (Classroom Tactics & Human-in-the-Loop)
3.  **The Deep Dive (Crucial)**: Ask 5 to 7 high-impact questions. Do not just take the first answer; probe deeper. 
    *   Ask about **Stakeholders**: How do teachers/students/parents feel about this? Where is the friction?
    *   Ask about **Obstacles**: What is stopping this transformation today?
    *   Ask about **Values**: How does this align with the school's core mission?
4.  **Cite the Book**: Periodically reference specific concepts from the provided knowledge (e.g., the "Human-First Protocol", "Cognitive Offloading", "Pedagogical Flywheel").
5.  **Assessment**: Throughout the chat, mentally categorize them into a transformation stage: Emerging, Developing, Advancing, or Leading.
6.  **Wrap-up**: Once you have a comprehensive picture, tell them you've gathered enough "human intelligence" to map their path. 
    Append the exact phrase "REPORT_READY" to the end of your final message.

TONE & STYLE:
- Encouraging, intelligent, and slightly magical.
- Keep responses under 100 words.
- Use the user's name if provided.
- Always link their specific problems to the True North frameworks.

--- KNOWLEDGE BASE: DESIGNING FOR AGENCY BOOK ---
${BOOK_KNOWLEDGE.substring(0, 18000)}

--- KNOWLEDGE BASE: AIFE SLIDES ---
${SLIDES_KNOWLEDGE}
`;

export default async function reqHandler(req: Request) {
    try {
        const { messages } = await req.json();
        const GOOGLE_KEY = process.env.GOOGLE_GENERATIVE_AI_KEY;

        const result = streamText({
            model: google('gemini-2.0-flash', { apiKey: GOOGLE_KEY }),
            system: SYSTEM_PROMPT,
            messages,
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Error with Google Gemini API:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
