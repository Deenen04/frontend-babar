import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1EAFB3',
        'primary-hover': '#1a9ca0',
      },
      fontFamily: {
        sans: 'var(--font-inter)',
        serif: 'var(--font-ibm-plex-serif)',
      },
    },
  },
  plugins: [],
}

export default config
