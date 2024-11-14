const baseTheme = {
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
  },
  gradients: {
    primary: 'linear-gradient(to right, #6366f1, #4f46e5)',
    surface: 'linear-gradient(to bottom, #ffffff, #f8fafc)'
  }
};

export const lightTheme = {
  ...baseTheme,
  primary: '#6366f1',
  secondary: '#4f46e5',
  background: '#f8fafc',
  surface: '#ffffff',
  surface2: '#f1f5f9',
  surface3: '#e2e8f0',
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    accent: '#6366f1'
  },
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b'
};

export const darkTheme = {
  ...baseTheme,
  primary: '#818cf8',
  secondary: '#6366f1',
  background: '#0f172a',
  surface: '#1e293b',
  surface2: '#334155',
  surface3: '#475569',
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    accent: '#818cf8'
  },
  border: '#334155',
  error: '#f87171',
  success: '#4ade80',
  warning: '#fbbf24',
  gradients: {
    ...baseTheme.gradients,
    surface: 'linear-gradient(to bottom, #1e293b, #0f172a)'
  }
};

export default { lightTheme, darkTheme }; 