import { ImageResponse } from 'next/og';

import { BRAND_GRADIENT_CSS, BRAND_MONOGRAM } from '@/constants/site';

// Dynamically-generated favicon — the brand monogram on the brand gradient.
// Rendered through `next/og` (not a static .ico) so it shares the exact same
// gradient stops as the inline <Logo> via `BRAND_GRADIENT_CSS`.

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND_GRADIENT_CSS,
        borderRadius: 7,
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: -1,
      }}
    >
      {BRAND_MONOGRAM}
    </div>,
    { ...size },
  );
}
