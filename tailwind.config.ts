import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        't-bg': 'var(--t-bg)',
        't-bg-warm': 'var(--t-bg-warm)',
        't-ink': 'var(--t-ink)',
        't-primary': 'var(--t-primary)',
        't-secondary': 'var(--t-secondary)',
        't-accent': 'var(--t-accent)',
        'si-gold': 'var(--si-gold)',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'serif'],
        calligraphy: ['var(--font-calligraphy)', 'cursive'],
        body: ['var(--font-be-vietnam)', 'sans-serif'],
      },
      maxWidth: {
        '160': '40rem',
      }
    },
  },
  plugins: [],
};
export default config;
