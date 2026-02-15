import { Resend } from 'resend';
import EmailVerification from '@/emails/email-verification';
import type { EmailVerificationProps } from '@/emails/email-verification';
import BaseNotification from '@/emails/base-notification';
import type { BaseNotificationProps } from '@/emails/base-notification';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Trudify <noreply@trudify.com>';

export async function sendVerificationEmail(
  to: string,
  templateData: EmailVerificationProps
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${templateData.buttonText} - Trudify`,
    react: EmailVerification(templateData),
  });
}

export async function sendNotificationEmail(
  to: string,
  subject: string,
  templateData: BaseNotificationProps
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject,
    react: BaseNotification(templateData),
  });
}
