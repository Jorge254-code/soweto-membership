import React, { useState } from 'react';
import { PaymentFormData } from '../types';
import { formatCurrency } from '../utils';
import './PaymentForm.css';

interface PaymentFormProps {
  memberName: string;
  membershipAmount: number;
  onSubmit: (paymentData: PaymentFormData) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  memberName,
  membershipAmount,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: membershipAmount,
    paymentMethod: 'cash',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'amount' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
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
    <div className="payment-form-container">
      <h2>Process Payment</h2>
      <div className="payment-info">
        <p><strong>Member:</strong> {memberName}</p>
        <p><strong>Monthly Membership:</strong> {formatCurrency(membershipAmount)}</p>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="amount">Payment Amount *</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={errors.amount ? 'error' : ''}
          />
          {errors.amount && <span className="error-message">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="paymentMethod">Payment Method *</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className={errors.paymentMethod ? 'error' : ''}
          >
            <option value="cash">Cash</option>
            <option value="card">Credit/Debit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="check">Check</option>
          </select>
          {errors.paymentMethod && <span className="error-message">{errors.paymentMethod}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any additional notes about the payment..."
          />
        </div>

        <div className="payment-summary">
          <h3>Payment Summary</h3>
          <div className="summary-item">
            <span>Amount:</span>
            <span>{formatCurrency(formData.amount)}</span>
          </div>
          <div className="summary-item">
            <span>Method:</span>
            <span>{formData.paymentMethod.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Process Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
