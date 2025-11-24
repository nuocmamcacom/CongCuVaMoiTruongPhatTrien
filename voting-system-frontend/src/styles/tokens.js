// Design Tokens
export const tokens = {
  colors: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#3B82F6',
    secondary: '#0F172A',
    background: '#FFFFFF',
    backgroundGray: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceGray: '#F1F5F9',
    text: '#0F172A',
    textMuted: '#64748B',
    textLight: '#94A3B8',
    border: '#E2E8F0',
    borderDark: '#CBD5E1',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    sizes: {
      h1: '48px',
      h2: '36px',
      h3: '24px',
      h4: '20px',
      body: '16px',
      bodyLarge: '18px',
      bodySmall: '14px',
      caption: '12px',
    },
    weights: {
      normal: 400,
      medium: 600,
      bold: 800,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    xxxl: '64px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    desktop: '1440px',
  },
  
  animations: {
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    durations: {
      fast: '120ms',
      normal: '250ms',
      slow: '350ms',
    }
  }
};