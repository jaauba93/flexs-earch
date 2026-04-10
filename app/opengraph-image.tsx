import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Colliers Flex — Biura serwisowane w Polsce'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: '#000759',
          padding: '64px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid accent */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(28,84,244,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(28,84,244,0.08) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        {/* Blue glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle at 70% 30%, rgba(28,84,244,0.25) 0%, transparent 70%)',
          }}
        />
        {/* Overline */}
        <p
          style={{
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: '#1C54F4',
            marginBottom: '20px',
          }}
        >
          Colliers Flex
        </p>
        {/* Headline */}
        <p
          style={{
            fontSize: '64px',
            fontWeight: 300,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '24px',
            maxWidth: '800px',
          }}
        >
          Biura serwisowane w Polsce
        </p>
        {/* Sub */}
        <p
          style={{
            fontSize: '20px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '600px',
            lineHeight: 1.5,
          }}
        >
          Porównaj oferty i uzyskaj rekomendację doradcy Colliers.
        </p>
        {/* Domain */}
        <p
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '64px',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
          }}
        >
          flex.colliers.pl
        </p>
      </div>
    ),
    { ...size }
  )
}
