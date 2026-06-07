import { ImageResponse } from 'next/og';

import { BRAND_GRADIENT_CSS, BRAND_MONOGRAM } from '@/constants/site';

// Apple touch icon (home-screen / bookmark). 180×180 is the size iOS scales
// from. Solid gradient fill — Apple composites icons on an opaque tile, so no
// transparency is used here.

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND_GRADIENT_CSS,
        borderRadius: 40,
        color: '#ffffff',
        fontSize: 86,
        fontWeight: 700,
        letterSpacing: -4,
      }}
    >
      {BRAND_MONOGRAM}
    </div>,
    { ...size },
  );
}
