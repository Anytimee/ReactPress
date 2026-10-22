import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    // Komponen shared menyertakan kelas utilitas yang harus ikut dipindai.
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/blocks/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        warning: 'var(--warning)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        1: 'var(--shadow-1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        xs: ['12px', '1.45'],
        sm: ['13px', '1.5'],
        base: ['15px', '1.55'],
        lg: ['17px', '1.5'],
        xl: ['20px', '1.4'],
        '2xl': ['24px', '1.3'],
        '3xl': ['30px', '1.2'],
      },
      spacing: {
        control: 'var(--control-height)',
        'control-sm': 'var(--control-height-sm)',
        topbar: 'var(--topbar-height)',
        sidebar: 'var(--sidebar-width)',
        inspector: 'var(--inspector-width)',
        content: 'var(--content-width)',
      },
      maxWidth: {
        content: 'var(--content-width)',
      },
      transitionTimingFunction: {
        base: 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
