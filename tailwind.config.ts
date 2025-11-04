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
        // Primary colors (indigo-to-violet gradient)
        primary: {
          600: "#6366F1",
          700: "#4F46E5",
        },
        // Neutral colors
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          900: "#171717",
        },
        // Semantic colors
        success: {
          50: "#F0FDF4",
          500: "#10B981",
          600: "#059669",
        },
        error: {
          50: "#FEF2F2",
          500: "#EF4444",
          600: "#DC2626",
        },
        warning: {
          50: "#FFFBEB",
          500: "#F59E0B",
          600: "#D97706",
        },
        info: {
          50: "#EFF6FF",
          500: "#3B82F6",
          600: "#2563EB",
        },
        // Surface colors
        bg: {
          base: "#FFFFFF",
          surface: "#FAFAFA",
          elevated: "#FFFFFF",
        },
        // Border colors
        border: {
          light: "#F5F5F5",
          default: "#E5E5E5",
          strong: "#D4D4D4",
          grid: "#F0F0F0",
        },
        // Legacy support
        background: "var(--color-bg-base)",
        foreground: "var(--color-neutral-900)",
        gray: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          900: "#171717",
        },
      },
      spacing: {
        // 4px base unit system
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
      },
      borderRadius: {
        "sm": "6px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
        "2xl": "20px",
        "full": "9999px",
      },
      boxShadow: {
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        // Type scale from design system
        "display": ["48px", { lineHeight: "1.1", fontWeight: "700" }],
        "h1": ["36px", { lineHeight: "1.2", fontWeight: "700" }],
        "h2": ["30px", { lineHeight: "1.3", fontWeight: "600" }],
        "h3": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "h4": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body": ["14px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["12px", { lineHeight: "1.4", fontWeight: "500" }],
        "label": ["11px", { lineHeight: "1.4", fontWeight: "600", letterSpacing: "0.05em" }],
      },
      transitionTimingFunction: {
        "fast": "cubic-bezier(0.4, 0, 0.2, 1)",
        "base": "cubic-bezier(0.4, 0, 0.2, 1)",
        "slow": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        "fast": "150ms",
        "base": "200ms",
        "slow": "300ms",
      },
    },
  },
  plugins: [],
};
export default config;
