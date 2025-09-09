import { v4 as uuidv4 } from "uuid";
import {
  format,
  addMonths,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
} from "date-fns";
import {
  Member,
  Membership,
  Payment,
  MemberFormData,
  PaymentFormData,
  WeeklyStats,
} from "../types";

class DataService {
  private STORAGE_KEYS = {
    MEMBERS: "church_members",
    MEMBERSHIPS: "church_memberships",
    PAYMENTS: "church_payments",
  };

  // Members
  getMembers(): Member[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.MEMBERS);
    return stored ? JSON.parse(stored) : [];
  }

  getMember(id: string): Member | undefined {
    const members = this.getMembers();
    return members.find((member) => member.id === id);
  }

  addMember(memberData: MemberFormData): Member {
    const members = this.getMembers();
    const newMember: Member = {
      id: uuidv4(),
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      email: "",
      phone: memberData.phone,
      dateOfBirth: memberData.dateOfBirth,
      address: memberData.address,
      emergencyContact: {
        name: memberData.emergencyContactName,
        phone: memberData.emergencyContactPhone,
        relationship: memberData.emergencyContactRelationship,
      },
      joinDate: format(new Date(), "yyyy-MM-dd"),
      isActive: true,
      memberType: memberData.memberType,
    };

    members.push(newMember);
    localStorage.setItem(this.STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    return newMember;
  }

  updateMember(id: string, memberData: Partial<Member>): Member | null {
    const members = this.getMembers();
    const index = members.findIndex((member) => member.id === id);

    if (index === -1) return null;

    members[index] = { ...members[index], ...memberData };
    localStorage.setItem(this.STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    return members[index];
  }

  deactivateMember(id: string): Member | null {
    return this.updateMember(id, { isActive: false });
  }

  reactivateMember(id: string): Member | null {
    return this.updateMember(id, { isActive: true });
  }

  deleteMember(id: string): boolean {
    const members = this.getMembers();
    const memberIndex = members.findIndex((member) => member.id === id);

    if (memberIndex === -1) return false;

    // Remove the member
    members.splice(memberIndex, 1);
    localStorage.setItem(this.STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    // Also remove associated membership and payments
    this.deleteMembershipsByMemberId(id);
    this.deletePaymentsByMemberId(id);

    return true;
  }

  private deleteMembershipsByMemberId(memberId: string): void {
    const memberships = this.getMemberships();
    const filteredMemberships = memberships.filter(
      (membership) => membership.memberId !== memberId
    );
    localStorage.setItem(
      this.STORAGE_KEYS.MEMBERSHIPS,
      JSON.stringify(filteredMemberships)
    );
  }

  private deletePaymentsByMemberId(memberId: string): void {
    const payments = this.getPayments();
    const filteredPayments = payments.filter(
      (payment) => payment.memberId !== memberId
    );
    localStorage.setItem(
      this.STORAGE_KEYS.PAYMENTS,
      JSON.stringify(filteredPayments)
    );
  }

  // Memberships
  getMemberships(): Membership[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.MEMBERSHIPS);
    return stored ? JSON.parse(stored) : [];
  }

  getMembershipByMemberId(memberId: string): Membership | undefined {
    const memberships = this.getMemberships();
    return memberships.find((membership) => membership.memberId === memberId);
  }

  createMembership(memberId: string, monthlyAmount: number): Membership {
    const memberships = this.getMemberships();
    const startDate = new Date();
    const endDate = addMonths(startDate, 1);

    const newMembership: Membership = {
      id: uuidv4(),
      memberId,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      monthlyAmount,
      status: "active",
      renewalDate: format(endDate, "yyyy-MM-dd"),
    };

    memberships.push(newMembership);
    localStorage.setItem(
      this.STORAGE_KEYS.MEMBERSHIPS,
      JSON.stringify(memberships)
    );
    return newMembership;
  }

  renewMembership(membershipId: string): Membership | null {
    const memberships = this.getMemberships();
    const index = memberships.findIndex(
      (membership) => membership.id === membershipId
    );

    if (index === -1) return null;

    const currentMembership = memberships[index];
    const newEndDate = addMonths(new Date(), 1);

    memberships[index] = {
      ...currentMembership,
      endDate: format(newEndDate, "yyyy-MM-dd"),
      renewalDate: format(newEndDate, "yyyy-MM-dd"),
      status: "active",
    };

    localStorage.setItem(
      this.STORAGE_KEYS.MEMBERSHIPS,
      JSON.stringify(memberships)
    );
    return memberships[index];
  }

  updateMembershipStatus(): void {
    const memberships = this.getMemberships();
    const today = new Date();

    const updatedMemberships = memberships.map((membership) => {
      const endDate = parseISO(membership.endDate);
      if (endDate < today && membership.status === "active") {
        return { ...membership, status: "expired" as const };
      }
      return membership;
    });

    localStorage.setItem(
      this.STORAGE_KEYS.MEMBERSHIPS,
      JSON.stringify(updatedMemberships)
    );
  }

  // Payments
  getPayments(): Payment[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.PAYMENTS);
    return stored ? JSON.parse(stored) : [];
  }

  addPayment(
    membershipId: string,
    memberId: string,
    paymentData: PaymentFormData
  ): Payment {
    const payments = this.getPayments();
    const newPayment: Payment = {
      id: uuidv4(),
      membershipId,
      memberId,
      amount: paymentData.amount,
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: paymentData.paymentMethod,
      status: "completed",
      notes: paymentData.notes,
    };

    payments.push(newPayment);
    localStorage.setItem(this.STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    // Renew membership after successful payment
    this.renewMembership(membershipId);

    return newPayment;
  }

  getPaymentsByMemberId(memberId: string): Payment[] {
    const payments = this.getPayments();
    return payments.filter((payment) => payment.memberId === memberId);
  }

  // Weekly Statistics
  getWeeklyStats(weekStart?: Date): WeeklyStats {
    const targetDate = weekStart || new Date();
    const weekStartDate = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday
    const weekEndDate = endOfWeek(targetDate, { weekStartsOn: 1 });

    const members = this.getMembers();
    const memberships = this.getMemberships();
    const payments = this.getPayments();

    // Update membership statuses first
    this.updateMembershipStatus();

    const activeMemberships = memberships.filter(
      (m) => m.status === "active"
    ).length;
    const expiredMemberships = memberships.filter(
      (m) => m.status === "expired"
    ).length;

    // Members who need renewal this week
    const pendingRenewals = memberships.filter((membership) => {
      const renewalDate = parseISO(membership.renewalDate);
      return (
        isWithinInterval(renewalDate, {
          start: weekStartDate,
          end: weekEndDate,
        }) && membership.status === "active"
      );
    }).length;

    // New members this week
    const newMembers = members.filter((member) => {
      const joinDate = parseISO(member.joinDate);
      return isWithinInterval(joinDate, {
        start: weekStartDate,
        end: weekEndDate,
      });
    }).length;

    // Revenue this week
    const weeklyPayments = payments.filter((payment) => {
      const paymentDate = parseISO(payment.paymentDate);
      return (
        isWithinInterval(paymentDate, {
          start: weekStartDate,
          end: weekEndDate,
        }) && payment.status === "completed"
      );
    });

    const totalRevenue = weeklyPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Member type counts
    const fulltimeMembers = members.filter(
      (member) => member.memberType === "fulltime"
    ).length;
    const onetimeMembers = members.filter(
      (member) => member.memberType === "onetime"
    ).length;

    // Active/inactive member counts
    const activeMembers = members.filter((member) => member.isActive).length;
    const inactiveMembers = members.filter((member) => !member.isActive).length;

    return {
      totalMembers: members.length,
      activeMembers,
      inactiveMembers,
      activeMemberships,
      expiredMemberships,
      pendingRenewals,
      totalRevenue,
      newMembers,
      fulltimeMembers,
      onetimeMembers,
    };
  }

  // Get members with their membership details for dashboard
  getMembersWithMemberships() {
    const members = this.getMembers();
    const memberships = this.getMemberships();

    return members.map((member) => {
      const membership = memberships.find((m) => m.memberId === member.id);
      return {
        ...member,
        membership,
      };
    });
  }

  // Initialize with sample data if empty
  initializeSampleData(): void {
    if (this.getMembers().length === 0) {
      const sampleMembers: MemberFormData[] = [
        {
          firstName: "John",
          lastName: "Doe",
          phone: "+1234567890",
          dateOfBirth: "1980-05-15",
          address: "123 Church St, City, State 12345",
          emergencyContactName: "Jane Doe",
          emergencyContactPhone: "+1234567891",
          emergencyContactRelationship: "Spouse",
          memberType: "fulltime",
        },
        {
          firstName: "Mary",
          lastName: "Smith",
          phone: "+1234567892",
          dateOfBirth: "1975-08-22",
          address: "456 Faith Ave, City, State 12345",
          emergencyContactName: "Bob Smith",
          emergencyContactPhone: "+1234567893",
          emergencyContactRelationship: "Husband",
          memberType: "onetime",
        },
      ];

      sampleMembers.forEach((memberData) => {
        const member = this.addMember(memberData);
        this.createMembership(member.id, 50); // KES 50 monthly membership
      });
    }
  }
}

const dataService = new DataService();
export default dataService;
