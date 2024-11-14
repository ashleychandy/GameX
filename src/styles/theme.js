const baseTheme = {
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  }
};

export const themeConfig = {
  light: {
    ...baseTheme,
    primary: '#6366f1',
    secondary: '#818cf8',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    background: '#f8fafc',
    surface: '#ffffff',
    surface2: '#f1f5f9',
    surface3: '#e2e8f0',
    border: '#e2e8f0',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      inverse: '#f8fafc',
      button: '#ffffff'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
      success: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
      warning: 'linear-gradient(135deg, #eab308 0%, #facc15 100%)'
    },
    shadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)'
    }
  },
  dark: {
    ...baseTheme,
    primary: '#818cf8',
    secondary: '#6366f1',
    success: '#4ade80',
    warning: '#facc15',
    error: '#f87171',
    background: '#0f172a',
    surface: '#1e293b',
    surface2: '#334155',
    surface3: '#475569',
    border: '#475569',
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      inverse: '#0f172a',
      button: '#ffffff'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
      success: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
      warning: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)'
    },
    shadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px rgba(0, 0, 0, 0.4)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.5)'
    }
  }
};

export const createCSSVariables = (theme) => {
  const variables = {};
  Object.entries(theme).forEach(([key, value]) => {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        variables[`--${key}-${subKey}`] = subValue;
      });
    } else {
      variables[`--${key}`] = value;
    }
  });
  return variables;
};

export { themeConfig as default, baseTheme, createCSSVariables }; 