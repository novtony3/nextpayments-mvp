'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';

/* The WebGL globe is a progressive enhancement: it loads client-side only,
 * after we confirm the device can handle it. The hero's CSS orb glow + glass
 * card are the always-present base layer, so a no-WebGL / reduced-motion /
 * mobile visitor still gets a complete, polished hero visual. */
const HeroScene = dynamic(() => import('./hero-scene'), { ssr: false });

const BLUE_FALLBACK = '#4796e3';
const CYAN_FALLBACK = '#3ed0f1';
const LILAC_FALLBACK = '#9b72cb';

function readCssColor(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    );
  } catch {
    return false;
  }
}

export function HeroCanvas() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [colors, setColors] = useState({
    blue: BLUE_FALLBACK,
    cyan: CYAN_FALLBACK,
    lilac: LILAC_FALLBACK,
  });

  useEffect(() => {
    const wideEnough = window.matchMedia('(min-width: 768px)').matches;
    if (reduce || !wideEnough || !supportsWebGL()) return;
    setColors({
      blue: readCssColor('--color-brand-blue', BLUE_FALLBACK),
      cyan: readCssColor('--color-brand-cyan', CYAN_FALLBACK),
      lilac: readCssColor('--color-brand-lilac', LILAC_FALLBACK),
    });
    setEnabled(true);
  }, [reduce]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <HeroScene blue={colors.blue} cyan={colors.cyan} lilac={colors.lilac} />
    </div>
  );
}
