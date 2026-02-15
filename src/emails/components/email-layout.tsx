import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Preview,
  Font,
} from '@react-email/components';
import * as React from 'react';

const BASE_URL = 'https://trudify.com';

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
  footerText: string;
  footerRights: string;
  currentYear: string;
}

export function EmailLayout({
  children,
  previewText,
  footerText,
  footerRights,
  currentYear,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Arial"
          fallbackFontFamily="Helvetica"
        />
      </Head>
      {previewText && <Preview>{previewText}</Preview>}
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${BASE_URL}/images/logo/trudify-logo-64.png`}
              width="40"
              height="40"
              alt="Trudify"
              style={logoImg}
            />
            <Text style={logoText}>Trudify</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerTextStyle}>{footerText}</Text>
            <Text style={footerTextStyle}>
              &copy; {currentYear} Trudify. {footerRights}
            </Text>
            <Text style={footerTextStyle}>
              <a href="mailto:support@trudify.com" style={footerLink}>
                support@trudify.com
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const body = {
  margin: '0',
  padding: '0',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  backgroundColor: '#f5f5f5',
};

const container = {
  maxWidth: '600px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden' as const,
};

const header = {
  backgroundColor: '#0066CC',
  padding: '30px 20px',
  textAlign: 'center' as const,
};

const logoImg = {
  display: 'inline-block' as const,
  verticalAlign: 'middle',
  borderRadius: '8px',
  marginRight: '10px',
};

const logoText = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  letterSpacing: '-0.5px',
  margin: '0',
  padding: '0',
  lineHeight: '40px',
  display: 'inline' as const,
  verticalAlign: 'middle',
};

const content = {
  padding: '40px 30px',
  color: '#333333',
  lineHeight: '1.6',
};

const footer = {
  padding: '25px 30px',
  backgroundColor: '#f9f9f9',
  textAlign: 'center' as const,
};

const footerTextStyle = {
  margin: '8px 0',
  fontSize: '14px',
  color: '#666666',
};

const footerLink = {
  color: '#0066CC',
  textDecoration: 'none',
};
