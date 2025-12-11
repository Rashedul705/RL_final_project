'use server';

/**
 * @fileoverview A flow for sending emails using the Gmail API.
 * This is a simplified implementation for demonstration purposes.
 * In a production environment, use a robust email sending service.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient\'s email address.'),
  subject: z.string().describe('The subject of the email.'),
  html: z.string().describe('The HTML body of the email.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export async function sendEmail(input: SendEmailInput): Promise<void> {
  await sendEmailFlow(input);
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    console.log(`Attempting to send email to: ${input.to}`);

    try {
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/gmail.send'],
      });
      const authClient = await auth.getClient();
      const gmail = google.gmail({ version: 'v1', auth: authClient as any });

      const emailLines = [
        `To: ${input.to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${input.subject}`,
        '',
        input.html,
      ];
      const email = emailLines.join('\n');

      const encodedMessage = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      console.log(`Email successfully sent to: ${input.to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      // In a real app, you might want to throw the error
      // or handle it more gracefully.
      // For this demo, we'll log it and continue.
    }
  }
);
