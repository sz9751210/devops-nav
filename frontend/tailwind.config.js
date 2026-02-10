/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ['1rem', { lineHeight: '1.5' }], // 16px (was 12px)
        sm: ['1.125rem', { lineHeight: '1.5' }], // 18px (was 14px)
        base: ['1.25rem', { lineHeight: '1.6' }], // 20px (was 16px)
        lg: ['1.375rem', { lineHeight: '1.6' }], // 22px (was 18px)
        xl: ['1.5rem', { lineHeight: '1.6' }], // 24px (was 20px)
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--glass-border)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
