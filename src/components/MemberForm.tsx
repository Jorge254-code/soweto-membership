import React, { useState } from 'react';
import { MemberFormData } from '../types';
import { validateEmail, validatePhone } from '../utils';
import './MemberForm.css';

interface MemberFormProps {
  onSubmit: (memberData: MemberFormData) => void;
  onCancel: () => void;
  initialData?: Partial<MemberFormData>;
  isEditing?: boolean;
}

const MemberForm: React.FC<MemberFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isEditing = false
}) => {
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    dateOfBirth: initialData.dateOfBirth || '',
    address: initialData.address || '',
    emergencyContactName: initialData.emergencyContactName || '',
    emergencyContactPhone: initialData.emergencyContactPhone || '',
    emergencyContactRelationship: initialData.emergencyContactRelationship || '',
    memberType: initialData.memberType || 'fulltime'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    }

    if (!formData.emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    } else if (!validatePhone(formData.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = 'Please enter a valid phone number';
    }

    if (!formData.emergencyContactRelationship.trim()) {
      newErrors.emergencyContactRelationship = 'Emergency contact relationship is required';
    }

    if (!formData.memberType) {
      newErrors.memberType = 'Member type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="member-form-container">
      <h2>{isEditing ? 'Edit Member' : 'Add New Member'}</h2>
      <form onSubmit={handleSubmit} className="member-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth *</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={errors.dateOfBirth ? 'error' : ''}
          />
          {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="address">Address *</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className={errors.address ? 'error' : ''}
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        <div className="form-group">
          <label>Member Type *</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="memberType"
                value="fulltime"
                checked={formData.memberType === 'fulltime'}
                onChange={handleChange}
              />
              <div>
                <span className="radio-label">Fulltime Member</span>
                <span className="radio-description">Regular ongoing membership with monthly dues</span>
              </div>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="memberType"
                value="onetime"
                checked={formData.memberType === 'onetime'}
                onChange={handleChange}
              />
              <div>
                <span className="radio-label">One Time Member</span>
                <span className="radio-description">Single payment membership without recurring dues</span>
              </div>
            </label>
          </div>
          {errors.memberType && <span className="error-message">{errors.memberType}</span>}
        </div>

        <h3>Emergency Contact</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="emergencyContactName">Name *</label>
            <input
              type="text"
              id="emergencyContactName"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              className={errors.emergencyContactName ? 'error' : ''}
            />
            {errors.emergencyContactName && <span className="error-message">{errors.emergencyContactName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="emergencyContactPhone">Phone *</label>
            <input
              type="tel"
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              className={errors.emergencyContactPhone ? 'error' : ''}
            />
            {errors.emergencyContactPhone && <span className="error-message">{errors.emergencyContactPhone}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="emergencyContactRelationship">Relationship *</label>
          <select
            id="emergencyContactRelationship"
            name="emergencyContactRelationship"
            value={formData.emergencyContactRelationship}
            onChange={handleChange}
            className={errors.emergencyContactRelationship ? 'error' : ''}
          >
            <option value="">Select Relationship</option>
            <option value="Spouse">Spouse</option>
            <option value="Parent">Parent</option>
            <option value="Child">Child</option>
            <option value="Sibling">Sibling</option>
            <option value="Friend">Friend</option>
            <option value="Other">Other</option>
          </select>
          {errors.emergencyContactRelationship && <span className="error-message">{errors.emergencyContactRelationship}</span>}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            {isEditing ? 'Back to Members' : 'Cancel'}
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;
