// Theme configuration
const themeConfig = {
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  }
};

// Base theme with shared properties
const baseTheme = {
  borderRadius: themeConfig.borderRadius,
  spacing: themeConfig.spacing,
  transition: {
    default: '0.2s ease-in-out',
    fast: '0.1s ease-in-out',
    slow: '0.3s ease-in-out'
  },
  components: {
    card: {
      padding: '2rem',
      borderRadius: '24px'
    },
    button: {
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem'
      }
    }
  }
};

// Theme colors and styles
export const themes = {
  light: {
    ...baseTheme,
    primary: '#6366f1',
    secondary: '#4f46e5',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    background: '#f8fafc',
    surface: '#ffffff',
    border: '#e2e8f0',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      inverse: '#ffffff'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      warning: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
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
    border: '#334155',
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      inverse: '#0f172a'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
      success: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
      warning: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)'
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.5)'
    }
  }
};

// Helper function to create CSS variables from theme
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

// Export everything needed
export { themeConfig, baseTheme };

export const theme = {
  primary: '#6366f1',
  secondary: '#4f46e5',
  background: '#0f172a',
  surface: '#1e293b',
  surfaceHover: '#334155',
  border: '#334155',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    inverse: '#ffffff'
  },
  gradients: {
    primary: 'linear-gradient(45deg, #6366f1, #4f46e5)',
    secondary: 'linear-gradient(45deg, #4f46e5, #3730a3)'
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  }
}; 