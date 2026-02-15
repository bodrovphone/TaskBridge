import { Text, Section, Link } from '@react-email/components';
import { EmailLayout } from './components/email-layout';
import { EmailButton } from './components/email-button';
import * as React from 'react';

export interface BaseNotificationProps {
  heading: string;
  greeting: string;
  userName: string;
  message: string;
  primaryLink: string;
  primaryButtonText: string;
  secondaryLink?: string;
  secondaryButtonText?: string;
  secondaryMessage?: string;
  infoTitle?: string;
  infoItems?: string[];
  footerText: string;
  footerRights: string;
  currentYear: string;
}

export default function BaseNotification({
  heading,
  greeting,
  userName,
  message,
  primaryLink,
  primaryButtonText,
  secondaryLink,
  secondaryButtonText,
  secondaryMessage,
  infoTitle,
  infoItems,
  footerText,
  footerRights,
  currentYear,
}: BaseNotificationProps) {
  return (
    <EmailLayout
      previewText={heading}
      footerText={footerText}
      footerRights={footerRights}
      currentYear={currentYear}
    >
      <Text style={headingStyle}>{heading}</Text>
      <Text style={paragraph}>
        {greeting} {userName},
      </Text>
      <Text style={paragraph}>{message}</Text>

      {/* Info Box */}
      {infoItems && infoItems.length > 0 && (
        <Section style={infoBox}>
          {infoTitle && <Text style={infoTitleStyle}>{infoTitle}</Text>}
          {infoItems.map((item, index) => (
            <Text key={index} style={infoItemStyle}>
              {item}
            </Text>
          ))}
        </Section>
      )}

      {/* CTA Buttons */}
      <Section style={buttonContainer}>
        <EmailButton href={primaryLink}>{primaryButtonText}</EmailButton>
        {secondaryLink && secondaryButtonText && (
          <EmailButton href={secondaryLink} variant="secondary">
            {secondaryButtonText}
          </EmailButton>
        )}
      </Section>

      {/* Secondary Message */}
      {secondaryMessage && (
        <Text style={secondaryMessageStyle}>{secondaryMessage}</Text>
      )}
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

const infoBox = {
  backgroundColor: '#f0f8ff',
  borderLeft: '4px solid #0066CC',
  padding: '16px',
  margin: '20px 0',
  borderRadius: '4px',
};

const infoTitleStyle = {
  margin: '0 0 8px 0',
  fontSize: '15px',
  fontWeight: '700',
  color: '#004080',
};

const infoItemStyle = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  color: '#004080',
};

const secondaryMessageStyle = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '1px solid #e5e5e5',
  fontSize: '16px',
  color: '#4a4a4a',
};
