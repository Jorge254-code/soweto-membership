export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  joinDate: string;
  isActive: boolean;
  memberType: 'onetime' | 'fulltime';
}

export interface Membership {
  id: string;
  memberId: string;
  startDate: string;
  endDate: string;
  monthlyAmount: number;
  status: 'active' | 'expired' | 'pending';
  renewalDate: string;
}

export interface Payment {
  id: string;
  membershipId: string;
  memberId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check';
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
}

export interface WeeklyStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  activeMemberships: number;
  expiredMemberships: number;
  pendingRenewals: number;
  totalRevenue: number;
  newMembers: number;
  fulltimeMembers: number;
  onetimeMembers: number;
}

export interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  memberType: 'onetime' | 'fulltime';
}

export interface PaymentFormData {
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check';
  notes?: string;
}
