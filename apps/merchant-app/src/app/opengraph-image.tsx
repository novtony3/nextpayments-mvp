import { ImageResponse } from 'next/og';

import {
  BRAND_BG,
  BRAND_GRADIENT_CSS,
  BRAND_MONOGRAM,
  BRAND_NAME,
  BRAND_OG_SUBLINE,
  BRAND_TAGLINE,
  BRAND_THEME_COLOR,
  FEE_RATE,
  OG_IMAGE_SIZE,
  REFERRAL_RATE,
  SITE_URL,
} from '@/constants/site';

// Social share card (referenced by both the OpenGraph and Twitter meta tags).
// Dark canvas with the NP tile, wordmark, and the headline fee proposition —
// the same brand tokens the rest of the app uses, so the card never drifts.

export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';
export const alt = `${BRAND_NAME} — ${BRAND_TAGLINE}`;

const DOMAIN = SITE_URL.replace(/^https?:\/\//, '');

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: BRAND_BG,
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Signature aurora floor glow, matching the app's body ambient. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 80% 55% at 50% 118%, ${BRAND_THEME_COLOR}55 0%, transparent 70%)`,
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 132,
          height: 132,
          borderRadius: 30,
          background: BRAND_GRADIENT_CSS,
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: -3,
        }}
      >
        {BRAND_MONOGRAM}
      </div>

      <div style={{ marginTop: 44, fontSize: 68, fontWeight: 700, letterSpacing: -2 }}>
        {BRAND_NAME}
      </div>

      <div style={{ marginTop: 14, fontSize: 32, color: '#9aa0a6' }}>{BRAND_OG_SUBLINE}</div>

      <div style={{ display: 'flex', gap: 16, marginTop: 36 }}>
        <div
          style={{
            display: 'flex',
            padding: '12px 26px',
            borderRadius: 999,
            border: '1px solid #2a2b2d',
            fontSize: 28,
            color: '#e8e8e8',
          }}
        >
          {FEE_RATE} flat fee
        </div>
        <div
          style={{
            display: 'flex',
            padding: '12px 26px',
            borderRadius: 999,
            border: '1px solid #2a2b2d',
            fontSize: 28,
            color: '#e8e8e8',
          }}
        >
          {REFERRAL_RATE} referral rewards
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 48,
          fontSize: 24,
          color: '#5f6368',
        }}
      >
        {DOMAIN}
      </div>
    </div>,
    { ...size },
  );
}
