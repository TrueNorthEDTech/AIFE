import type { VercelRequest, VercelResponse } from '@vercel/node';

// This serverless function forwards waitlist signups to truenorthedtech@gmail.com
// It uses the Resend API (free tier: 3,000 emails/month)
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    // If no Resend API key, fall back to logging (still shows success for demo)
    if (!RESEND_API_KEY) {
        console.log(`[Waitlist Signup - NO RESEND KEY] Email: ${email}`);
        return res.status(200).json({ success: true, message: 'Signup recorded (demo mode).' });
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Glowie Waitlist <onboarding@resend.dev>',
                to: ['truenorthedtech@gmail.com'],
                subject: `🚀 New Interest: truenorthed.tech & "Designing for AGENCY" Book`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #1a56db;">New Waitlist Signup from AIFE!</h2>
                        <p>Someone just signed up with interest in:</p>
                        <ul>
                            <li>Access to <strong>truenorthed.tech</strong></li>
                            <li>The <strong>"Designing for AGENCY"</strong> book on Amazon</li>
                        </ul>
                        <div style="background: #f0f4ff; border-left: 4px solid #1a56db; padding: 16px; margin: 16px 0; border-radius: 8px;">
                            <strong>Email:</strong> ${email}
                        </div>
                        <p style="color: #888; font-size: 12px;">Sent from the AIFE Conference Prototype - Glowie AI</p>
                    </div>
                `,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Resend API error:', errorBody);
            return res.status(500).json({ error: 'Failed to send email notification.' });
        }

        return res.status(200).json({ success: true, message: 'Signup confirmed! Check your inbox.' });

    } catch (error) {
        console.error('Error sending waitlist email:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
