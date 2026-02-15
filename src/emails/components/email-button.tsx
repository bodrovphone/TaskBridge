import { Button } from '@react-email/components';
import * as React from 'react';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function EmailButton({
  href,
  children,
  variant = 'primary',
}: EmailButtonProps) {
  const style = variant === 'primary' ? primaryButton : secondaryButton;

  return (
    <Button href={href} style={style}>
      {children}
    </Button>
  );
}

const primaryButton = {
  backgroundColor: '#0066CC',
  color: '#ffffff',
  padding: '14px 40px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block' as const,
};

const secondaryButton = {
  backgroundColor: '#00A86B',
  color: '#ffffff',
  padding: '12px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '15px',
  display: 'inline-block' as const,
  marginLeft: '10px',
};
