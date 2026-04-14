import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        sidebar: {
          bg: '#0f172a',
          hover: '#1e293b',
          active: '#1e3a5f',
          text: '#94a3b8',
          'text-active': '#f1f5f9',
        },
      },
    },
  },
  plugins: [],
};

export default config;
