/**
 * AyaData Logo Component
 * Official AyaData logo
 */

export default function Logo({ size = 'medium' }) {
  const sizeMap = {
    small: { height: '32px' },
    medium: { height: '48px' },
    large: { height: '64px' },
    xlarge: { height: '80px' },
  };

  return (
    <img
      src="https://www.ayadata.ai/wp-content/uploads/2024/04/Ayadata-logo_New-02.png"
      alt="AyaData"
      style={{
        ...sizeMap[size],
        width: 'auto',
        objectFit: 'contain',
      }}
    />
  );
}
