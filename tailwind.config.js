import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
          "on-secondary": "#ffffff",
          "on-primary-fixed": "#001d35",
          "tertiary-fixed": "#dee0ff",
          "surface-tint": "#446180",
          "surface-container-highest": "#cfe6f2",
          "secondary-fixed-dim": "#c3c7cb",
          "surface-container-lowest": "#ffffff",
          "on-tertiary-container": "#899aff",
          "on-secondary-container": "#5e6367",
          "surface": "#f3faff",
          "on-primary-fixed-variant": "#2b4967",
          "outline-variant": "#c3c7ce",
          "secondary-fixed": "#dfe3e7",
          "primary-fixed-dim": "#acc9ed",
          "on-surface": "#071e27",
          "primary-container": "#1b3a57",
          "surface-container-low": "#e6f6ff",
          "tertiary": "#00156e",
          "primary": "#002440",
          "surface-container-high": "#d5ecf8",
          "on-secondary-fixed-variant": "#43474b",
          "surface-container": "#dbf1fe",
          "background": "#f3faff",
          "error": "#ba1a1a",
          "primary-fixed": "#d0e4ff",
          "outline": "#73777e",
          "on-tertiary-fixed-variant": "#293ca0",
          "inverse-on-surface": "#dff4ff",
          "on-surface-variant": "#43474d",
          "secondary": "#5a5f62",
          "error-container": "#ffdad6",
          "surface-bright": "#f3faff",
          "tertiary-container": "#162b91",
          "on-primary": "#ffffff",
          "on-background": "#071e27",
          "tertiary-fixed-dim": "#bac3ff",
          "inverse-surface": "#1e333c",
          "surface-variant": "#cfe6f2",
          "secondary-container": "#dce0e4",
          "on-error": "#ffffff",
          "surface-dim": "#c7dde9",
          "on-secondary-fixed": "#171c1f",
          "on-tertiary": "#ffffff",
          "inverse-primary": "#acc9ed",
          "on-tertiary-fixed": "#00105c",
          "on-error-container": "#93000a"
      },
      "borderRadius": {
          "DEFAULT": "0.125rem",
          "lg": "0.25rem",
          "xl": "0.5rem",
          "full": "0.75rem"
      },
      "spacing": {
          "xs": "8px",
          "sm": "16px",
          "gutter": "24px",
          "lg": "32px",
          "md": "24px",
          "base": "4px",
          "container-max": "1280px",
          "xl": "48px"
      },
      "fontFamily": {
          "headline-md": ["Noto Sans", "sans-serif"],
          "display-lg": ["Noto Sans", "sans-serif"],
          "label-md": ["Inter", "sans-serif"],
          "headline-sm": ["Noto Sans", "sans-serif"],
          "data-table": ["Inter", "sans-serif"],
          "body-md": ["Noto Sans", "sans-serif"],
          "body-lg": ["Noto Sans", "sans-serif"]
      },
      "fontSize": {
          "headline-md": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
          "display-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
          "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
          "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
          "data-table": ["13px", {"lineHeight": "18px", "fontWeight": "400"}],
          "body-md": ["14px", {"lineHeight": "22px", "fontWeight": "400"}],
          "body-lg": ["16px", {"lineHeight": "26px", "fontWeight": "400"}]
      }
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
