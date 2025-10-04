/**
 * Reusable Badge Component
 * Follows AyaData design system
 */

import { colors, typography, spacing, borderRadius } from '../../styles/designSystem';

export default function Badge({ children, variant = 'primary', size = 'medium' }) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: size === 'small' ? `${spacing[1]} ${spacing[2]}` : `${spacing[1]} ${spacing[3]}`,
    fontSize: size === 'small' ? typography.fontSize.xs : typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    borderRadius: borderRadius.full,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary[100],
      color: colors.primary[700],
    },
    accent: {
      backgroundColor: colors.accent[100],
      color: colors.accent[700],
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
    neutral: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[700],
    },
  };

  return (
    <span style={{ ...baseStyles, ...variantStyles[variant] }}>
      {children}
    </span>
  );
}
