import { format, parseISO } from "date-fns";

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

export const formatPhone = (phone: string): string => {
  // Simple phone formatting for US numbers
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "active":
      return "#10b981"; // green
    case "expired":
      return "#ef4444"; // red
    case "pending":
      return "#f59e0b"; // yellow
    default:
      return "#6b7280"; // gray
  }
};

export const getMembershipStatusText = (status: string): string => {
  switch (status) {
    case "active":
      return "Active";
    case "expired":
      return "Expired";
    case "pending":
      return "Pending";
    default:
      return "Unknown";
  }
};

export const getMemberTypeText = (memberType: string): string => {
  switch (memberType) {
    case "fulltime":
      return "Fulltime";
    case "onetime":
      return "One Time";
    default:
      return "Unknown";
  }
};

export const getMemberTypeColor = (memberType: string): string => {
  switch (memberType) {
    case "fulltime":
      return "#0ea5e9"; // blue
    case "onetime":
      return "#f97316"; // orange
    default:
      return "#6b7280"; // gray
  }
};
