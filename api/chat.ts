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

Your goal is to guide the user through a **15-minute comprehensive strategic assessment**. This is NOT a quick survey; it is a deep dive into their institutional and pedagogical soul.

STRATEGIC INQUIRY PHASES (Approx. 10-12 Questions Total):
1.  **Phase 1: Baseline & Vibe (2 Qs)**: Establish their role (Tech Director, Admin, Teacher) and their current "AI Vibe" (Fear/Control vs. Agency/Exploration). Do they feel their school is leaning towards restrictive policies or agentic pilots?
2.  **Phase 2: The Three Pillars (6-8 Qs)**: Guide them through the True North frameworks. Do not just ask about one; look for the intersections:
    *   **RISE** (Institutional): Who are the key stakeholders? Where is the friction? What are the non-negotiables?
    *   **AGENCY** (Curriculum): Is AI being used for 'Cognitive Offloading' or 'Agentic Scaffolding'? How is student agency being protected?
    *   **PROMPT** (Classroom): How are teachers ensuring a 'Human-in-the-Loop'? What does the 'AI Dividend' (time saved) look like in their context?
3.  **Phase 3: The Path of Fear vs. Agency (2 Qs)**: Specifically probe for the "Path of Fear and Control". Ask: "If you move towards control, what is lost? If you move towards agency, what is gained?"
4.  **Phase 4: Synthesis & Wrap-up**: Once you have a 360-degree view of their context, summarize your findings briefly and trigger the report.

CRITICAL INSTRUCTIONS:
- **Cite the Book**: Reference specific concepts like the "Human-First Protocol", "Pedagogical Flywheel", and "Designing for AGENCY" book explicitly.
- **Probe Deeper**: If they give a short answer, ask "Why?" or "How does that impact your teachers?"
- **Tone**: Professional, strategic, encouraging, and visionary. Avoid being too 'chatty'—be a consultant.
- **Trigger**: Append "REPORT_READY" to your final message only when you have deep pedagogical and institutional insight.

--- KNOWLEDGE BASE: DESIGNING FOR AGENCY BOOK ---
${BOOK_KNOWLEDGE.substring(0, 18000)}

--- KNOWLEDGE BASE: AIFE SLIDES ---
${SLIDES_KNOWLEDGE}
`;

export default async function reqHandler(req: Request) {
    console.log("Chat API request received");
    try {
        const { messages } = await req.json();
        const GOOGLE_KEY = process.env.GOOGLE_GENERATIVE_AI_KEY;

        if (!GOOGLE_KEY) {
            console.error("CRITICAL: GOOGLE_GENERATIVE_AI_KEY is missing on server.");
            return new Response(JSON.stringify({ error: 'API Key Missing. Check Vercel Env Vars.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const result = streamText({
            model: google('gemini-2.0-flash', { apiKey: GOOGLE_KEY }),
            system: SYSTEM_PROMPT,
            messages,
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Error with Google Gemini API:', error);
        return new Response(JSON.stringify({ error: `Server error: ${error instanceof Error ? error.message : 'Unknown'}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
