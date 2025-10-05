/**
 * Form Template Controller
 * Manages the application form template configuration
 */

import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/responses.js';

const prisma = new PrismaClient();

const FORM_TEMPLATE_KEY = 'APPLICATION_FORM_TEMPLATE';

/**
 * Get the current form template
 * GET /api/form-template
 */
export const getFormTemplate = async (req, res) => {
  try {
    console.log('📖 GET FORM TEMPLATE - Fetching from database...');
    const template = await prisma.formTemplate.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    console.log('📖 GET FORM TEMPLATE - Database result:', template ? 'Found' : 'Not found');

    if (!template) {
      // Return default template if none exists
      console.log('📖 GET FORM TEMPLATE - Returning default template');
      const defaultTemplate = getDefaultFormTemplate();
      return successResponse(res, defaultTemplate, 'Default form template retrieved');
    }

    console.log('📖 GET FORM TEMPLATE - Returning saved template');
    const formConfig = {
      fields: JSON.parse(template.fields),
      fieldMapping: template.fieldMapping ? JSON.parse(template.fieldMapping) : {},
      updatedAt: template.updatedAt,
      updatedBy: template.updatedBy
    };
    return successResponse(res, formConfig, 'Form template retrieved successfully');
  } catch (error) {
    console.error('❌ GET FORM TEMPLATE - Error:', error);
    return errorResponse(res, 'Failed to fetch form template', 500);
  }
};

/**
 * Update the form template (Admin only)
 * PUT /api/form-template
 */
export const updateFormTemplate = async (req, res) => {
  try {
    console.log('📝 UPDATE FORM TEMPLATE - Request body:', JSON.stringify(req.body, null, 2));
    const { fields, fieldMapping } = req.body;

    if (!fields || !Array.isArray(fields)) {
      console.error('❌ Invalid form template data - fields:', fields);
      return errorResponse(res, 'Invalid form template data', 400);
    }

    // Validate each field
    for (const field of fields) {
      if (!field.id || !field.type || !field.label) {
        console.error('❌ Invalid field:', field);
        return errorResponse(res, 'Each field must have id, type, and label', 400);
      }
    }

    console.log('💾 Saving form config to FormTemplate table...');

    // Check if template exists
    const existing = await prisma.formTemplate.findFirst();

    let result;
    if (existing) {
      // Update existing
      result = await prisma.formTemplate.update({
        where: { id: existing.id },
        data: {
          fields: JSON.stringify(fields),
          fieldMapping: fieldMapping ? JSON.stringify(fieldMapping) : null,
          updatedBy: req.user.id,
        }
      });
    } else {
      // Create new
      result = await prisma.formTemplate.create({
        data: {
          fields: JSON.stringify(fields),
          fieldMapping: fieldMapping ? JSON.stringify(fieldMapping) : null,
          updatedBy: req.user.id,
        }
      });
    }

    const formConfig = {
      fields,
      fieldMapping,
      updatedAt: result.updatedAt,
      updatedBy: result.updatedBy
    };

    console.log('✅ Form template saved successfully:', result.id);
    return successResponse(res, formConfig, 'Form template updated successfully');
  } catch (error) {
    console.error('❌ Error updating form template:', error);
    return errorResponse(res, 'Failed to update form template: ' + error.message, 500);
  }
};

/**
 * Reset form template to default (Admin only)
 * POST /api/form-template/reset
 */
export const resetFormTemplate = async (req, res) => {
  try {
    const defaultTemplate = getDefaultFormTemplate();

    // Check if template exists
    const existing = await prisma.formTemplate.findFirst();

    if (existing) {
      // Update existing
      await prisma.formTemplate.update({
        where: { id: existing.id },
        data: {
          fields: JSON.stringify(defaultTemplate.fields),
          fieldMapping: null,
          updatedBy: req.user.id,
        }
      });
    } else {
      // Create new
      await prisma.formTemplate.create({
        data: {
          fields: JSON.stringify(defaultTemplate.fields),
          fieldMapping: null,
          updatedBy: req.user.id,
        }
      });
    }

    return successResponse(res, defaultTemplate, 'Form template reset to default');
  } catch (error) {
    console.error('Error resetting form template:', error);
    return errorResponse(res, 'Failed to reset form template', 500);
  }
};

/**
 * Default form template structure
 */
function getDefaultFormTemplate() {
  return {
    fields: [
      // Personal Information
      { id: 'firstName', type: 'text', label: 'First Name', required: true, placeholder: 'Enter your first name', section: 'Personal Information' },
      { id: 'lastName', type: 'text', label: 'Last Name', required: true, placeholder: 'Enter your last name', section: 'Personal Information' },
      { id: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'your.email@example.com', section: 'Personal Information' },
      { id: 'phone', type: 'text', label: 'Phone Number', required: true, placeholder: '+1234567890', section: 'Personal Information' },
      { id: 'age', type: 'number', label: 'Age', required: false, placeholder: 'Your age', section: 'Personal Information' },
      { id: 'gender', type: 'select', label: 'Gender', required: false, options: ['Male', 'Female', 'Other', 'Prefer not to say'], section: 'Personal Information' },

      // Location
      { id: 'city', type: 'text', label: 'City', required: true, placeholder: 'Your city', section: 'Location' },
      { id: 'country', type: 'text', label: 'Country', required: true, placeholder: 'Your country', section: 'Location' },
      { id: 'timezone', type: 'text', label: 'Timezone', required: false, placeholder: 'e.g., GMT+0, EST, PST', section: 'Location' },

      // Education
      { id: 'educationLevel', type: 'select', label: 'Education Level', required: false,
        options: ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other'],
        section: 'Education'
      },
      { id: 'degreeName', type: 'text', label: 'Degree/Major', required: false, placeholder: 'e.g., Computer Science', section: 'Education' },
      { id: 'educationInstitution', type: 'text', label: 'Institution Name', required: false, placeholder: 'University name', section: 'Education' },

      // Work Setup
      { id: 'hasLaptop', type: 'radio', label: 'Do you have a laptop/computer?', required: true, options: ['Yes', 'No'], section: 'Work Setup' },
      { id: 'hasReliableInternet', type: 'radio', label: 'Do you have reliable internet?', required: true, options: ['Yes', 'No'], section: 'Work Setup' },
      { id: 'remoteWorkAvailable', type: 'radio', label: 'Can you work remotely?', required: true, options: ['Yes', 'No'], section: 'Work Setup' },
      { id: 'employmentStatus', type: 'select', label: 'Current Employment Status', required: false,
        options: ['Employed Full-time', 'Employed Part-time', 'Freelancer', 'Student', 'Unemployed', 'Other'],
        section: 'Work Setup'
      },

      // Availability
      { id: 'availabilityType', type: 'select', label: 'Availability', required: true,
        options: ['Full-time', 'Part-time', 'Flexible'],
        section: 'Availability'
      },
      { id: 'hoursPerWeek', type: 'number', label: 'Hours Available Per Week', required: false, placeholder: 'e.g., 40', section: 'Availability' },
      { id: 'preferredStartTime', type: 'text', label: 'Preferred Start Time', required: false, placeholder: 'e.g., 9:00 AM', section: 'Availability' },
      { id: 'preferredEndTime', type: 'text', label: 'Preferred End Time', required: false, placeholder: 'e.g., 5:00 PM', section: 'Availability' },
      { id: 'interestedLongTerm', type: 'radio', label: 'Interested in long-term work?', required: false, options: ['Yes', 'No'], section: 'Availability' },

      // Experience
      { id: 'yearsOfExperience', type: 'number', label: 'Years of Experience', required: false, placeholder: 'Years in data annotation', section: 'Experience' },
      { id: 'previousCompanies', type: 'text', label: 'Previous Companies', required: false, placeholder: 'Company names (comma-separated)', section: 'Experience' },
      { id: 'relevantExperience', type: 'textarea', label: 'Describe Your Relevant Experience', required: false, placeholder: 'Tell us about your experience...', section: 'Experience' },

      // Skills
      { id: 'annotationTypes', type: 'multiselect', label: 'Annotation Types Experience', required: false,
        options: ['Image', 'Video', 'Text', 'Audio', '3D'],
        section: 'Skills'
      },
      { id: 'annotationMethods', type: 'multiselect', label: 'Annotation Methods', required: false,
        options: ['Bounding Box', 'Polygon', 'Polyline', 'Keypoint', 'Segmentation', 'Classification', 'Transcription', 'NER', 'Other'],
        section: 'Skills'
      },
      { id: 'annotationTools', type: 'multiselect', label: 'Annotation Tools Experience', required: false,
        options: ['CVAT', 'Labelbox', 'V7', 'Scale AI', 'Supervisely', 'Roboflow', 'Other'],
        section: 'Skills'
      },
      { id: 'strongestTool', type: 'text', label: 'Strongest Annotation Tool', required: false, placeholder: 'Which tool are you best at?', section: 'Skills' },
      { id: 'languageProficiency', type: 'multiselect', label: 'Language Proficiency', required: false,
        options: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Other'],
        section: 'Skills'
      },

      // Additional
      { id: 'hasTrainedOthers', type: 'radio', label: 'Have you trained others in annotation?', required: false, options: ['Yes', 'No'], section: 'Additional Information' },
      { id: 'complexTaskDescription', type: 'textarea', label: 'Describe a complex task you completed', required: false, placeholder: 'Tell us about a challenging project...', section: 'Additional Information' },
      { id: 'howHeardAbout', type: 'select', label: 'How did you hear about us?', required: false,
        options: ['LinkedIn', 'Job Board', 'Friend/Referral', 'Website', 'Social Media', 'Other'],
        section: 'Additional Information'
      },
    ],
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  };
}
