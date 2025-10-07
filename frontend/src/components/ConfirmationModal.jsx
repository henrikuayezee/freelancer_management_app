/**
 * ConfirmationModal Component
 * Reusable confirmation dialog for critical actions
 */

import { useState } from 'react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'info', 'success'
  requireInput = false,
  inputLabel = '',
  inputPlaceholder = '',
}) {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      if (requireInput) {
        await onConfirm(inputValue);
      } else {
        await onConfirm();
      }
      setInputValue('');
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setInputValue('');
    onClose();
  };

  const getConfirmButtonStyle = () => {
    const baseStyle = {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '6px',
      cursor: isProcessing ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      opacity: isProcessing ? 0.6 : 1,
    };

    switch (type) {
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: '#dc2626',
          color: 'white',
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: '#f59e0b',
          color: 'white',
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: '#10b981',
          color: 'white',
        };
      case 'info':
      default:
        return {
          ...baseStyle,
          backgroundColor: '#2563eb',
          color: 'white',
        };
    }
  };

  const getIconStyle = () => {
    switch (type) {
      case 'danger':
        return {
          backgroundColor: '#fee2e2',
          color: '#dc2626',
        };
      case 'warning':
        return {
          backgroundColor: '#fef3c7',
          color: '#f59e0b',
        };
      case 'success':
        return {
          backgroundColor: '#d1fae5',
          color: '#10b981',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#dbeafe',
          color: '#2563eb',
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div style={styles.overlay} onClick={handleCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div style={{ ...styles.iconContainer, ...getIconStyle() }}>
          <span style={styles.icon}>{getIcon()}</span>
        </div>

        {/* Title */}
        <h2 style={styles.title}>{title}</h2>

        {/* Message */}
        <p style={styles.message}>{message}</p>

        {/* Optional Input */}
        {requireInput && (
          <div style={styles.inputContainer}>
            {inputLabel && <label style={styles.inputLabel}>{inputLabel}</label>}
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              style={styles.textarea}
              rows={3}
              disabled={isProcessing}
            />
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button
            onClick={handleCancel}
            style={styles.cancelButton}
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            style={getConfirmButtonStyle()}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    textAlign: 'center',
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  icon: {
    fontSize: '32px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '12px',
  },
  message: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  inputContainer: {
    marginBottom: '24px',
    textAlign: 'left',
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
};
