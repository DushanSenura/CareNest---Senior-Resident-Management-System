import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      ink: '#17342d', forest: '#24594a', sage: '#7da690', mint: '#e8f2ed',
      cream: '#f7f5ef', coral: '#d8785e', gold: '#d4a84f',
    },
    boxShadow: { card: '0 12px 40px rgba(31, 68, 58, .08)' },
    borderRadius: { xl: '1rem', '2xl': '1.5rem' },
  } },
  plugins: [],
} satisfies Config;
