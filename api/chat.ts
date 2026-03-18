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

Your goal is to guide the user through a 15-20 minute interactive consultation.
1. First, ask for their role (e.g., Tech Director, Administrator, Teacher).
2. Next, ask what pathway they want to focus on today:
   - Institutional level change (focuses on the RISE model)
   - Curriculum design and implementation (focuses on the AGENCY model)
   - Classroom level interaction with AI (focuses on the PROMPT model)
3. Based on their choice, ask 3 to 4 engaging, thought-provoking questions that unpack the core elements of that specific model. Use the book and slides knowledge provided below to inform your questions.
4. Provide immediate, brief feedback to their answers to show you understand.
5. Once you have enough context, smoothly wrap up the consultation and tell them you are ready to generate their personalized action report. 
   When you reach this point, append the exact phrase "REPORT_READY" to the very end of your final message so the system knows to transition them.

Keep all responses concise (under 100 words per response), conversational, and highly engaging.

--- KNOWLEDGE BASE: DESIGNING FOR AGENCY BOOK ---
${BOOK_KNOWLEDGE.substring(0, 15000)} // Injecting a truncated context to respect token limits

--- KNOWLEDGE BASE: AIFE SLIDES ---
${SLIDES_KNOWLEDGE}
`;

export default async function reqHandler(req: Request) {
    try {
        const { messages } = await req.json();

        const result = streamText({
            model: google('gemini-2.0-flash'),
            system: SYSTEM_PROMPT,
            messages,
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Error with Google Gemini API:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
