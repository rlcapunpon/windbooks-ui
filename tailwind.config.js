/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base backgrounds
        background: {
          primary: '#1E2235', // Main background (lighter)
          secondary: '#1A1C2E',
          surface: '#1F2337', // Modal surface (darker for better contrast)
          // Light theme variants for dashboard
          light: {
            primary: '#F8FAFC', // Light background
            secondary: '#F1F5F9',
            surface: '#FFFFFF',
          }
        },
        // Accent colors
        accent: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
        },
        // State colors
        state: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        // Text colors
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          disabled: '#475569',
          // Light theme text variants
          light: {
            primary: '#1E293B', // Dark text for light backgrounds
            secondary: '#475569',
            disabled: '#64748B',
          }
        },
        // Form fields
        input: {
          background: '#2D3342', // More distinct from main background
          border: '#475569', // Better border contrast
          // Light theme input variants
          light: {
            background: '#FFFFFF',
            border: '#CBD5E1',
          }
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}