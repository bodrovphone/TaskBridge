import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Trudify - Платформа за услуги в България'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Logo container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'}/images/logo/trudify-logo-512.png`}
            alt="Trudify"
            width={180}
            height={180}
            style={{
              borderRadius: 24,
            }}
          />
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#0066CC',
              textAlign: 'center',
              letterSpacing: '-1px',
            }}
          >
            Trudify
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: '#374151',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Намерете проверени професионалисти
          </div>
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            gap: 24,
            fontSize: 20,
            color: '#6B7280',
          }}
        >
          <span>Услуги</span>
          <span>•</span>
          <span>Майстори</span>
          <span>•</span>
          <span>България</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
