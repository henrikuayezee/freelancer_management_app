/**
 * Design System
 * AyaData brand colors and professional design tokens
 */

export const colors = {
  // Primary colors - AyaData Navy Blue
  primary: {
    50: '#e6eaf4',
    100: '#ccd5e9',
    200: '#99abd3',
    300: '#6681bd',
    400: '#3357a7',
    500: '#012870',  // Main primary - AyaData Navy
    600: '#01215a',
    700: '#011943',
    800: '#01122d',
    900: '#000a16',
  },

  // Accent - AyaData Bright Blue
  accent: {
    50: '#eef3fe',
    100: '#dde7fd',
    200: '#bbcffb',
    300: '#99b7f9',
    400: '#779ff7',
    500: '#4872F5',  // Main accent - AyaData Bright Blue
    600: '#1a52f0',
    700: '#1442c4',
    800: '#0f3193',
    900: '#0a2162',
  },

  // Success - Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  // Warning - Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  // Error - Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Neutral grays - Proper contrast
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#fafafa',
    dark: '#121C27',  // AyaData dark background
  },

  // Text colors
  text: {
    primary: '#121C27',
    secondary: '#525252',
    tertiary: '#737373',
    disabled: '#a3a3a3',
    inverse: '#ffffff',
  },

  // Border colors
  border: {
    light: '#f5f5f5',
    default: '#e5e5e5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
  },
};

export const typography = {
  fontFamily: {
    base: '"Montserrat", "Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  base: '0.5rem',   // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
};

export const transitions = {
  fast: 'all 0.15s ease-in-out',
  base: 'all 0.2s ease-in-out',
  slow: 'all 0.3s ease-in-out',
};

// Component-specific styles
export const components = {
  button: {
    primary: {
      backgroundColor: colors.accent[500],
      color: colors.text.inverse,
      padding: `${spacing[3]} ${spacing[6]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      borderRadius: borderRadius.base,
      border: 'none',
      cursor: 'pointer',
      transition: transitions.base,
      boxShadow: shadows.sm,
      hover: {
        backgroundColor: colors.accent[600],
        boxShadow: shadows.md,
        transform: 'translateY(-1px)',
      },
    },
    secondary: {
      backgroundColor: colors.neutral[0],
      color: colors.accent[500],
      padding: `${spacing[3]} ${spacing[6]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      borderRadius: borderRadius.base,
      border: `2px solid ${colors.accent[500]}`,
      cursor: 'pointer',
      transition: transitions.base,
      hover: {
        backgroundColor: colors.accent[50],
        borderColor: colors.accent[600],
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text.secondary,
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.base,
      border: 'none',
      cursor: 'pointer',
      transition: transitions.base,
      hover: {
        backgroundColor: colors.neutral[100],
        color: colors.text.primary,
      },
    },
  },

  card: {
    base: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      border: `1px solid ${colors.border.default}`,
      boxShadow: shadows.sm,
      transition: transitions.base,
    },
    hover: {
      boxShadow: shadows.md,
      borderColor: colors.border.medium,
    },
  },

  input: {
    base: {
      width: '100%',
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      fontFamily: typography.fontFamily.base,
      color: colors.text.primary,
      backgroundColor: colors.background.primary,
      border: `1px solid ${colors.border.default}`,
      borderRadius: borderRadius.base,
      transition: transitions.base,
      outline: 'none',
      focus: {
        borderColor: colors.accent[500],
        boxShadow: `0 0 0 3px ${colors.accent[100]}`,
      },
    },
  },

  badge: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${spacing[1]} ${spacing[3]}`,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      borderRadius: borderRadius.full,
      textTransform: 'uppercase',
      letterSpacing: typography.letterSpacing.wide,
    },
    success: {
      backgroundColor: colors.success[100],
      color: colors.success[700],
    },
    warning: {
      backgroundColor: colors.warning[100],
      color: colors.warning[700],
    },
    error: {
      backgroundColor: colors.error[100],
      color: colors.error[700],
    },
    primary: {
      backgroundColor: colors.primary[100],
      color: colors.primary[700],
    },
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  components,
};
