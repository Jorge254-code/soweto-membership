import React, { useState, useEffect } from 'react';
import { Member, Membership, Payment, PaymentFormData } from '../types';
import dataService from '../services/dataService';
import PaymentForm from '../components/PaymentForm';
import { formatDate, formatCurrency, getStatusColor, getMembershipStatusText } from '../utils';
import './Payments.css';

interface MemberWithMembership extends Member {
  membership?: Membership;
}

const Payments: React.FC = () => {
  const [membersWithMemberships, setMembersWithMemberships] = useState<MemberWithMembership[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberWithMembership | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [recentPayments, setRecentPayments] = useState<(Payment & { memberName: string })[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const members = dataService.getMembersWithMemberships();
    setMembersWithMemberships(members);

    // Get recent payments with member names
    const payments = dataService.getPayments()
      .slice(-20) // Last 20 payments
      .reverse()
      .map(payment => {
        const member = dataService.getMember(payment.memberId);
        return {
          ...payment,
          memberName: member ? `${member.firstName} ${member.lastName}` : 'Unknown Member'
        };
      });
    
    setRecentPayments(payments);
  };

  const handleProcessPayment = (member: MemberWithMembership) => {
    setSelectedMember(member);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = (paymentData: PaymentFormData) => {
    if (selectedMember && selectedMember.membership) {
      dataService.addPayment(
        selectedMember.membership.id,
        selectedMember.id,
        paymentData
      );
      
      alert('Payment processed successfully!');
      setShowPaymentForm(false);
      setSelectedMember(null);
      loadData();
    }
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setSelectedMember(null);
  };

  const filteredMembers = membersWithMemberships.filter(member => {
    if (filter === 'all') return member.membership;
    if (!member.membership) return false;
    return member.membership.status === filter;
  });

  if (showPaymentForm && selectedMember && selectedMember.membership) {
    return (
      <PaymentForm
        memberName={`${selectedMember.firstName} ${selectedMember.lastName}`}
        membershipAmount={selectedMember.membership.monthlyAmount}
        onSubmit={handlePaymentSubmit}
        onCancel={handleCancelPayment}
      />
    );
  }

  return (
    <div className="payments-page">
      <div className="page-header">
        <h1>Membership Payments</h1>
        <p>Process monthly membership renewals and track payment history</p>
      </div>

      <div className="payments-content">
        <div className="members-section">
          <div className="section-header">
            <h2>Members Due for Payment</h2>
            <div className="filter-controls">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">All Memberships</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="members-payment-grid">
            {filteredMembers.map(member => (
              <div key={member.id} className="payment-member-card">
                <div className="member-info">
                  <h3>{member.firstName} {member.lastName}</h3>
                  <p>{member.email}</p>
                </div>

                {member.membership && (
                  <div className="membership-details">
                    <div className="status-section">
                      <span 
                        className="status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(member.membership.status),
                          color: 'white'
                        }}
                      >
                        {getMembershipStatusText(member.membership.status)}
                      </span>
                    </div>
                    
                    <div className="payment-details">
                      <div className="detail-item">
                        <span>Monthly Amount:</span>
                        <strong>{formatCurrency(member.membership.monthlyAmount)}</strong>
                      </div>
                      <div className="detail-item">
                        <span>Renewal Date:</span>
                        <strong>{formatDate(member.membership.renewalDate)}</strong>
                      </div>
                    </div>

                    <div className="payment-actions">
                      <button
                        onClick={() => handleProcessPayment(member)}
                        className={`btn ${
                          member.membership.status === 'expired' ? 'btn-primary' : 'btn-secondary'
                        }`}
                      >
                        {member.membership.status === 'expired' ? 'Renew Membership' : 'Process Payment'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="empty-state">
              <p>No members found with memberships matching the current filter.</p>
            </div>
          )}
        </div>

        <div className="recent-payments-section">
          <h2>Recent Payments</h2>
          <div className="payments-table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td>{payment.memberName}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td className="payment-method">
                      {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                    </td>
                    <td>
                      <span 
                        className="payment-status"
                        style={{ 
                          color: payment.status === 'completed' ? '#10b981' : '#f59e0b'
                        }}
                      >
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {recentPayments.length === 0 && (
              <div className="empty-payments">
                <p>No payments recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
