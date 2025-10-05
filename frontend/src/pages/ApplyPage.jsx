/**
 * Freelancer Application Page
 * Public form for freelancers to apply
 * Dynamically renders form based on admin-configured template
 */

import { useState, useEffect } from 'react';
import { applicationsAPI, formTemplateAPI } from '../services/api';

export default function ApplyPage() {
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFormTemplate();
  }, []);

  const loadFormTemplate = async () => {
    try {
      setLoadingTemplate(true);
      const response = await formTemplateAPI.getTemplate();
      // The API returns { success: true, data: { fields: [...], updatedAt, updatedBy } }
      const fields = response.data.data?.fields || response.data.fields || [];
      setFormFields(fields);

      // Initialize form data with default values
      const initialData = {};
      fields.forEach(field => {
        if (field.type === 'checkbox') {
          initialData[field.id] = false;
        } else if (field.type === 'checkboxGroup') {
          initialData[field.id] = [];
        } else {
          initialData[field.id] = '';
        }
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Failed to load form template:', error);
      setError('Failed to load application form. Please try again later.');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      const field = formFields.find(f => f.id === name);
      if (field && field.type === 'checkboxGroup') {
        // Handle checkbox group
        const currentValues = formData[name] || [];
        if (checked) {
          setFormData(prev => ({ ...prev, [name]: [...currentValues, value] }));
        } else {
          setFormData(prev => ({ ...prev, [name]: currentValues.filter(v => v !== value) }));
        }
      } else {
        // Handle single checkbox
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await applicationsAPI.submit(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'date':
        return (
          <input
            type={field.type}
            name={field.id}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            style={styles.input}
          />
        );

      case 'textarea':
        return (
          <textarea
            name={field.id}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            style={{ ...styles.input, resize: 'vertical' }}
          />
        );

      case 'select':
        return (
          <select
            name={field.id}
            value={value}
            onChange={handleChange}
            required={field.required}
            style={styles.input}
          >
            <option value="">Select...</option>
            {(field.options || []).map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div style={styles.radioGroup}>
            {(field.options || []).map((option, index) => (
              <label key={index} style={styles.radioLabel}>
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={handleChange}
                  required={field.required}
                />
                <span style={styles.radioText}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name={field.id}
              checked={value === true}
              onChange={handleChange}
            />
            <span style={styles.checkboxText}>{field.placeholder || field.label}</span>
          </label>
        );

      case 'checkboxGroup':
        return (
          <div style={styles.checkboxGroup}>
            {(field.options || []).map((option, index) => (
              <label key={index} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name={field.id}
                  value={option}
                  checked={(value || []).includes(option)}
                  onChange={handleChange}
                />
                <span style={styles.checkboxText}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            name={field.id}
            onChange={handleChange}
            required={field.required}
            style={styles.input}
          />
        );

      default:
        return null;
    }
  };

  if (loadingTemplate) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loadingText}>Loading application form...</div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={{ ...styles.title, color: '#10b981' }}>✓ Application Submitted!</h1>
          <p style={styles.text}>
            Thank you for applying! We'll review your application and contact you via email soon.
          </p>
          <a href="/" style={styles.link}>← Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Apply as Freelancer</h1>
        <p style={styles.subtitle}>Join our data annotation team</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          {formFields.map((field) => (
            <div key={field.id} style={styles.formGroup}>
              <label style={styles.label}>
                {field.label}
                {field.required && <span style={styles.required}> *</span>}
              </label>
              {renderField(field)}
            </div>
          ))}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <div style={styles.footer}>
          <a href="/" style={styles.link}>← Back to Home</a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '40px 20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  radioText: {
    fontSize: '14px',
    color: '#333',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkboxText: {
    fontSize: '14px',
    color: '#333',
  },
  button: {
    padding: '14px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '16px',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '6px',
    fontSize: '14px',
  },
  text: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  footer: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '14px',
  },
  loadingText: {
    padding: '40px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#6b7280',
  },
};
