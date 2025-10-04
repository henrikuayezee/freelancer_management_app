/**
 * Reusable Button Component
 * Follows AyaData design system
 */

import { colors, typography, spacing, borderRadius, shadows } from '../../styles/designSystem';

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const baseStyles = {
    padding: size === 'small' ? `${spacing[2]} ${spacing[4]}` :
             size === 'large' ? `${spacing[4]} ${spacing[8]}` :
             `${spacing[3]} ${spacing[6]}`,
    fontSize: size === 'small' ? typography.fontSize.sm :
              size === 'large' ? typography.fontSize.lg :
              typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.base,
    borderRadius: borderRadius.base,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.accent[500],
      color: colors.text.inverse,
      boxShadow: shadows.sm,
    },
    secondary: {
      backgroundColor: colors.neutral[0],
      color: colors.primary[500],
      border: `2px solid ${colors.primary[500]}`,
      boxShadow: shadows.sm,
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.accent[500],
      border: `2px solid ${colors.accent[500]}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text.secondary,
    },
    danger: {
      backgroundColor: colors.error[500],
      color: colors.text.inverse,
      boxShadow: shadows.sm,
    },
  };

  const handleMouseEnter = (e) => {
    if (disabled) return;

    if (variant === 'primary') {
      e.target.style.backgroundColor = colors.accent[600];
      e.target.style.transform = 'translateY(-1px)';
      e.target.style.boxShadow = shadows.md;
    } else if (variant === 'secondary') {
      e.target.style.backgroundColor = colors.primary[50];
      e.target.style.borderColor = colors.primary[600];
    } else if (variant === 'ghost') {
      e.target.style.backgroundColor = colors.neutral[100];
    } else if (variant === 'danger') {
      e.target.style.backgroundColor = colors.error[600];
      e.target.style.transform = 'translateY(-1px)';
      e.target.style.boxShadow = shadows.md;
    }
  };

  const handleMouseLeave = (e) => {
    if (disabled) return;

    if (variant === 'primary') {
      e.target.style.backgroundColor = colors.accent[500];
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = shadows.sm;
    } else if (variant === 'secondary') {
      e.target.style.backgroundColor = colors.neutral[0];
      e.target.style.borderColor = colors.primary[500];
    } else if (variant === 'ghost') {
      e.target.style.backgroundColor = 'transparent';
    } else if (variant === 'danger') {
      e.target.style.backgroundColor = colors.error[500];
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = shadows.sm;
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...baseStyles, ...variantStyles[variant] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}
