/**
 * Reusable Card Component
 * Follows AyaData design system
 */

import { colors, borderRadius, shadows, spacing } from '../../styles/designSystem';

export default function Card({ children, padding = 'medium', hover = false, ...props }) {
  const paddingMap = {
    small: spacing[4],
    medium: spacing[6],
    large: spacing[8],
  };

  const baseStyles = {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: paddingMap[padding],
    border: `1px solid ${colors.border.default}`,
    boxShadow: shadows.sm,
    transition: 'all 0.2s ease',
  };

  const handleMouseEnter = (e) => {
    if (hover) {
      e.currentTarget.style.boxShadow = shadows.md;
      e.currentTarget.style.borderColor = colors.border.medium;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }
  };

  const handleMouseLeave = (e) => {
    if (hover) {
      e.currentTarget.style.boxShadow = shadows.sm;
      e.currentTarget.style.borderColor = colors.border.default;
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  return (
    <div
      style={baseStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
}
