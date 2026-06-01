/** Next.js ESLint config — extends base + next/core-web-vitals. */
module.exports = {
  extends: [require.resolve('./index.js'), 'next/core-web-vitals', 'next/typescript'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
};
