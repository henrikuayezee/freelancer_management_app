/**
 * Form Builder Page
 * Admin-only page to customize the application form
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { formTemplateAPI } from '../services/api';

const FormBuilderPage = () => {
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [newField, setNewField] = useState({
    id: '',
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    options: [],
  });

  // Field types available
  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'checkboxGroup', label: 'Checkbox Group' },
    { value: 'file', label: 'File Upload' },
  ];

  useEffect(() => {
    loadFormTemplate();
  }, []);

  const loadFormTemplate = async () => {
    try {
      console.log('📖 LOAD TEMPLATE - Starting load...');
      setLoading(true);
      const response = await formTemplateAPI.getTemplate();
      console.log('📖 LOAD TEMPLATE - Response:', response);
      console.log('📖 LOAD TEMPLATE - Response.data:', response.data);
      // The API returns { success: true, data: { fields: [...], updatedAt, updatedBy } }
      const fields = response.data.data?.fields || response.data.fields || [];
      console.log('📖 LOAD TEMPLATE - Fields:', fields);
      setFormFields(fields);
      console.log('✅ LOAD TEMPLATE - Form fields set:', fields);
    } catch (error) {
      console.error('❌ LOAD TEMPLATE - Error:', error);
      alert('Failed to load form template');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      console.log('💾 SAVE TEMPLATE - Starting save with fields:', formFields);
      setSaving(true);
      const response = await formTemplateAPI.updateTemplate({ fields: formFields });
      console.log('✅ SAVE TEMPLATE - Success:', response);
      alert('Form template saved successfully!');
    } catch (error) {
      console.error('❌ SAVE TEMPLATE - Error:', error);
      alert('Failed to save form template: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleResetTemplate = async () => {
    if (!window.confirm('Are you sure you want to reset to default form? This cannot be undone.')) {
      return;
    }
    try {
      setSaving(true);
      const response = await formTemplateAPI.resetTemplate();
      const fields = response.data.data?.fields || response.data.fields || [];
      setFormFields(fields);
      alert('Form template reset to default successfully!');
    } catch (error) {
      console.error('Failed to reset form template:', error);
      alert('Failed to reset form template');
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = () => {
    if (!newField.label) {
      alert('Please enter a field label');
      return;
    }
    const id = newField.id || newField.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const field = { ...newField, id };
    setFormFields([...formFields, field]);
    setNewField({ id: '', type: 'text', label: '', placeholder: '', required: false, options: [] });
    setShowAddField(false);
  };

  const handleEditField = (index) => {
    setEditingField(index);
    setNewField({ ...formFields[index] });
    setShowAddField(true);
  };

  const handleUpdateField = () => {
    if (!newField.label) {
      alert('Please enter a field label');
      return;
    }
    const updatedFields = [...formFields];
    updatedFields[editingField] = { ...newField };
    setFormFields(updatedFields);
    setNewField({ id: '', type: 'text', label: '', placeholder: '', required: false, options: [] });
    setShowAddField(false);
    setEditingField(null);
  };

  const handleDeleteField = (index) => {
    if (!window.confirm('Are you sure you want to delete this field?')) {
      return;
    }
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
  };

  const handleMoveField = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formFields.length) return;
    const updatedFields = [...formFields];
    [updatedFields[index], updatedFields[newIndex]] = [updatedFields[newIndex], updatedFields[index]];
    setFormFields(updatedFields);
  };

  const handleAddOption = () => {
    setNewField({ ...newField, options: [...(newField.options || []), ''] });
  };

  const handleUpdateOption = (index, value) => {
    const updatedOptions = [...(newField.options || [])];
    updatedOptions[index] = value;
    setNewField({ ...newField, options: updatedOptions });
  };

  const handleDeleteOption = (index) => {
    const updatedOptions = (newField.options || []).filter((_, i) => i !== index);
    setNewField({ ...newField, options: updatedOptions });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.container}>
          <div style={styles.loading}>Loading form builder...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Application Form Builder</h1>
          <div style={styles.headerActions}>
            <button onClick={() => setShowPreview(!showPreview)} style={styles.previewBtn}>
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button onClick={handleResetTemplate} style={styles.resetBtn} disabled={saving}>
              Reset to Default
            </button>
            <button onClick={handleSaveTemplate} style={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>

        <div style={styles.content}>
          {/* Field List */}
          <div style={showPreview ? styles.fieldListHalf : styles.fieldListFull}>
            <div style={styles.addFieldSection}>
              <button onClick={() => { setShowAddField(!showAddField); setEditingField(null); setNewField({ id: '', type: 'text', label: '', placeholder: '', required: false, options: [] }); }} style={styles.addFieldBtn}>
                {showAddField ? 'Cancel' : '+ Add New Field'}
              </button>
            </div>

            {showAddField && (
              <div style={styles.fieldEditor}>
                <h3 style={styles.editorTitle}>{editingField !== null ? 'Edit Field' : 'Add New Field'}</h3>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Field Type</label>
                  <select value={newField.type} onChange={(e) => setNewField({ ...newField, type: e.target.value })} style={styles.select}>
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Field ID (optional)</label>
                  <input type="text" value={newField.id} onChange={(e) => setNewField({ ...newField, id: e.target.value })} placeholder="Auto-generated from label" style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Label *</label>
                  <input type="text" value={newField.label} onChange={(e) => setNewField({ ...newField, label: e.target.value })} placeholder="Enter field label" style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Placeholder</label>
                  <input type="text" value={newField.placeholder || ''} onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })} placeholder="Enter placeholder text" style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" checked={newField.required} onChange={(e) => setNewField({ ...newField, required: e.target.checked })} />
                    <span style={styles.checkboxText}>Required field</span>
                  </label>
                </div>

                {/* Options for select, radio, checkboxGroup */}
                {(['select', 'radio', 'checkboxGroup'].includes(newField.type)) && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Options</label>
                    {(newField.options || []).map((option, index) => (
                      <div key={index} style={styles.optionRow}>
                        <input type="text" value={option} onChange={(e) => handleUpdateOption(index, e.target.value)} placeholder={`Option ${index + 1}`} style={styles.optionInput} />
                        <button onClick={() => handleDeleteOption(index)} style={styles.deleteOptionBtn}>×</button>
                      </div>
                    ))}
                    <button onClick={handleAddOption} style={styles.addOptionBtn}>+ Add Option</button>
                  </div>
                )}

                <div style={styles.editorActions}>
                  <button onClick={() => { setShowAddField(false); setEditingField(null); setNewField({ id: '', type: 'text', label: '', placeholder: '', required: false, options: [] }); }} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button onClick={editingField !== null ? handleUpdateField : handleAddField} style={styles.saveFieldBtn}>
                    {editingField !== null ? 'Update Field' : 'Add Field'}
                  </button>
                </div>
              </div>
            )}

            <div style={styles.fieldsList}>
              <h3 style={styles.sectionTitle}>Current Form Fields ({formFields.length})</h3>
              {formFields.length === 0 ? (
                <div style={styles.emptyState}>No fields added yet. Click "Add New Field" to get started.</div>
              ) : (
                formFields.map((field, index) => (
                  <div key={field.id} style={styles.fieldItem}>
                    <div style={styles.fieldInfo}>
                      <div style={styles.fieldHeader}>
                        <span style={styles.fieldLabel}>{field.label}</span>
                        {field.required && <span style={styles.requiredBadge}>Required</span>}
                      </div>
                      <div style={styles.fieldMeta}>
                        <span style={styles.fieldType}>{fieldTypes.find(t => t.value === field.type)?.label || field.type}</span>
                        <span style={styles.fieldId}>ID: {field.id}</span>
                      </div>
                      {field.options && field.options.length > 0 && (
                        <div style={styles.fieldOptions}>
                          Options: {field.options.join(', ')}
                        </div>
                      )}
                    </div>
                    <div style={styles.fieldActions}>
                      <button onClick={() => handleMoveField(index, 'up')} disabled={index === 0} style={styles.moveBtn} title="Move up">
                        ↑
                      </button>
                      <button onClick={() => handleMoveField(index, 'down')} disabled={index === formFields.length - 1} style={styles.moveBtn} title="Move down">
                        ↓
                      </button>
                      <button onClick={() => handleEditField(index)} style={styles.editBtn}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteField(index)} style={styles.deleteBtn}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div style={styles.previewPanel}>
              <h3 style={styles.sectionTitle}>Form Preview</h3>
              <div style={styles.previewForm}>
                {formFields.map((field) => (
                  <div key={field.id} style={styles.previewField}>
                    <label style={styles.previewLabel}>
                      {field.label}
                      {field.required && <span style={styles.previewRequired}> *</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea placeholder={field.placeholder} style={styles.previewTextarea} />
                    ) : field.type === 'select' ? (
                      <select style={styles.previewSelect}>
                        <option value="">Select...</option>
                        {(field.options || []).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'radio' ? (
                      <div style={styles.previewRadioGroup}>
                        {(field.options || []).map((opt, i) => (
                          <label key={i} style={styles.previewRadioLabel}>
                            <input type="radio" name={field.id} value={opt} />
                            <span style={styles.previewRadioText}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'checkboxGroup' ? (
                      <div style={styles.previewCheckboxGroup}>
                        {(field.options || []).map((opt, i) => (
                          <label key={i} style={styles.previewCheckboxLabel}>
                            <input type="checkbox" value={opt} />
                            <span style={styles.previewCheckboxText}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <label style={styles.previewCheckboxLabel}>
                        <input type="checkbox" />
                        <span style={styles.previewCheckboxText}>{field.placeholder || field.label}</span>
                      </label>
                    ) : (
                      <input type={field.type} placeholder={field.placeholder} style={styles.previewInput} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  previewBtn: {
    padding: '10px 20px',
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  resetBtn: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  saveBtn: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  content: {
    display: 'flex',
    gap: '20px',
  },
  fieldListFull: {
    flex: 1,
  },
  fieldListHalf: {
    flex: 1,
    maxWidth: '50%',
  },
  addFieldSection: {
    marginBottom: '20px',
  },
  addFieldBtn: {
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    width: '100%',
  },
  fieldEditor: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  editorTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  checkboxText: {
    marginLeft: '8px',
    fontSize: '14px',
    color: '#374151',
  },
  optionRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '8px',
  },
  optionInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  },
  deleteOptionBtn: {
    padding: '8px 12px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  addOptionBtn: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '8px',
  },
  editorActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  saveFieldBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  fieldsList: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px',
  },
  fieldItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '15px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    marginBottom: '10px',
    border: '1px solid #e5e7eb',
  },
  fieldInfo: {
    flex: 1,
  },
  fieldHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '5px',
  },
  fieldLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
  },
  requiredBadge: {
    padding: '2px 8px',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '11px',
    borderRadius: '4px',
    fontWeight: '500',
  },
  fieldMeta: {
    display: 'flex',
    gap: '15px',
    marginBottom: '5px',
  },
  fieldType: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500',
  },
  fieldId: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  fieldOptions: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '5px',
    fontStyle: 'italic',
  },
  fieldActions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  moveBtn: {
    padding: '5px 10px',
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  editBtn: {
    padding: '5px 12px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  deleteBtn: {
    padding: '5px 12px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  previewPanel: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
  },
  previewForm: {
    maxWidth: '600px',
  },
  previewField: {
    marginBottom: '20px',
  },
  previewLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  previewRequired: {
    color: '#ef4444',
  },
  previewInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  previewTextarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    minHeight: '100px',
    boxSizing: 'border-box',
  },
  previewSelect: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  previewRadioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  previewRadioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  previewRadioText: {
    marginLeft: '8px',
    fontSize: '14px',
    color: '#374151',
  },
  previewCheckboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  previewCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  previewCheckboxText: {
    marginLeft: '8px',
    fontSize: '14px',
    color: '#374151',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#6b7280',
  },
};

export default FormBuilderPage;
