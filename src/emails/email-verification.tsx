import { Text, Link, Section } from '@react-email/components';
import { EmailLayout } from './components/email-layout';
import { EmailButton } from './components/email-button';
import * as React from 'react';

export interface EmailVerificationProps {
  heading: string;
  greeting: string;
  userName: string;
  message: string;
  buttonText: string;
  verificationLink: string;
  linkInstruction: string;
  expiryText?: string;
  footerText: string;
  footerRights: string;
  currentYear: string;
}

export default function EmailVerification({
  heading,
  greeting,
  userName,
  message,
  buttonText,
  verificationLink,
  linkInstruction,
  expiryText,
  footerText,
  footerRights,
  currentYear,
}: EmailVerificationProps) {
  return (
    <EmailLayout
      previewText={`${heading} - Trudify`}
      footerText={footerText}
      footerRights={footerRights}
      currentYear={currentYear}
    >
      <Text style={headingStyle}>{heading}</Text>
      <Text style={paragraph}>
        {greeting} {userName},
      </Text>
      <Text style={paragraph}>{message}</Text>

      {/* CTA Button */}
      <Section style={buttonContainer}>
        <EmailButton href={verificationLink}>{buttonText}</EmailButton>
      </Section>

      {/* Expiry Notice */}
      {expiryText && (
        <Section style={expiryNotice}>
          <Text style={expiryNoticeText}>{expiryText}</Text>
        </Section>
      )}

      {/* Link Fallback */}
      <Section style={linkFallback}>
        <Text style={linkFallbackText}>{linkInstruction}</Text>
        <Link href={verificationLink} style={linkStyle}>
          {verificationLink}
        </Link>
      </Section>
    </EmailLayout>
  );
}

const headingStyle = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 20px 0',
  lineHeight: '1.3',
};

const paragraph = {
  margin: '0 0 16px 0',
  fontSize: '16px',
  color: '#4a4a4a',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const expiryNotice = {
  backgroundColor: '#fff3cd',
  borderLeft: '4px solid #ffc107',
  padding: '12px 16px',
  margin: '20px 0',
  borderRadius: '4px',
};

const expiryNoticeText = {
  margin: '0',
  fontSize: '14px',
  color: '#856404',
};

const linkFallback = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '1px solid #e5e5e5',
};

const linkFallbackText = {
  fontSize: '14px',
  color: '#666666',
  marginBottom: '10px',
};

const linkStyle = {
  color: '#0066CC',
  wordBreak: 'break-all' as const,
  fontSize: '13px',
};
