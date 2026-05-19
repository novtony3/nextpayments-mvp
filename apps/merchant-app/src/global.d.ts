/**
 * Ambient module declarations for non-TS assets.
 *
 * Next bundles global stylesheets at build time, but TypeScript needs a type
 * for the side-effect import (`import './globals.css'`) — without this the
 * editor's TS server reports TS2882 "Cannot find module or type declarations
 * for side-effect import". Types-only; no runtime effect.
 */
declare module '*.css';
