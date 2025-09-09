import React, { useState, useEffect } from "react";
import { Member, MemberFormData } from "../types";
import dataService from "../services/dataService";
import MemberForm from "../components/MemberForm";
import ConfirmationModal from "../components/ConfirmationModal";
import Notification from "../components/Notification";
import { formatDate, formatPhone, formatCurrency } from "../utils";
import "./Members.css";

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState<
    "all" | "fulltime" | "onetime"
  >("all");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDangerous?: boolean;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ isVisible: false, message: "", type: "success" });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = () => {
    const membersData = dataService.getMembers();
    setMembers(membersData);
  };

  const handleAddMember = (memberData: MemberFormData) => {
    const newMember = dataService.addMember(memberData);
    loadMembers();
    setShowForm(false);
    showNotification(
      `${newMember.firstName} ${newMember.lastName} has been added successfully!`,
      "success"
    );
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setNotification({ isVisible: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ isVisible: false, message: "", type: "success" });
  };

  const handleEditMember = (memberData: MemberFormData) => {
    if (editingMember) {
      const updatedMember = dataService.updateMember(editingMember.id, {
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        phone: memberData.phone,
        dateOfBirth: memberData.dateOfBirth,
        address: memberData.address,
        emergencyContact: {
          name: memberData.emergencyContactName,
          phone: memberData.emergencyContactPhone,
          relationship: memberData.emergencyContactRelationship,
        },
        memberType: memberData.memberType,
      });

      if (updatedMember) {
        loadMembers();
        setShowForm(false);
        setEditingMember(null);
        showNotification(
          `${updatedMember.firstName} ${updatedMember.lastName} has been updated successfully!`,
          "success"
        );
      } else {
        showNotification("Failed to update member. Please try again.", "error");
      }
    }
  };

  const handleCreateMembership = (memberId: string) => {
    const monthlyAmount = prompt("Enter monthly membership amount:");
    if (monthlyAmount && !isNaN(Number(monthlyAmount))) {
      dataService.createMembership(memberId, Number(monthlyAmount));
      alert("Membership created successfully!");
      loadMembers();
    }
  };

  const handleDeactivateMember = (member: Member) => {
    setConfirmModal({
      isOpen: true,
      title: "Deactivate Member",
      message: `Are you sure you want to deactivate ${member.firstName} ${member.lastName}? They will no longer appear in active member lists, but their data will be preserved.`,
      onConfirm: () => {
        dataService.deactivateMember(member.id);
        loadMembers();
        closeModal();
        showNotification(
          `${member.firstName} ${member.lastName} has been deactivated.`,
          "info"
        );
      },
      isDangerous: false,
    });
  };

  const handleReactivateMember = (member: Member) => {
    dataService.reactivateMember(member.id);
    loadMembers();
    showNotification(
      `${member.firstName} ${member.lastName} has been reactivated.`,
      "success"
    );
  };

  const handleDeleteMember = (member: Member) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Member",
      message: `Are you sure you want to permanently delete ${member.firstName} ${member.lastName}? This action cannot be undone. All associated memberships and payment records will also be deleted.`,
      onConfirm: () => {
        dataService.deleteMember(member.id);
        loadMembers();
        closeModal();
        showNotification(
          `${member.firstName} ${member.lastName} has been permanently deleted.`,
          "warning"
        );
      },
      isDangerous: true,
    });
  };

  const closeModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
    });
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = `${member.firstName} ${member.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      memberTypeFilter === "all" || member.memberType === memberTypeFilter;
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && member.isActive) ||
      (activeFilter === "inactive" && !member.isActive);
    return matchesSearch && matchesType && matchesActive;
  });

  const openEditForm = (member: Member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const getInitialFormData = (member: Member) => ({
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone,
    dateOfBirth: member.dateOfBirth,
    address: member.address,
    emergencyContactName: member.emergencyContact.name,
    emergencyContactPhone: member.emergencyContact.phone,
    emergencyContactRelationship: member.emergencyContact.relationship,
    memberType: member.memberType,
  });

  if (showForm) {
    return (
      <MemberForm
        onSubmit={editingMember ? handleEditMember : handleAddMember}
        onCancel={closeForm}
        initialData={editingMember ? getInitialFormData(editingMember) : {}}
        isEditing={!!editingMember}
      />
    );
  }

  return (
    <div className="members-page">
      <div className="page-header">
        <h1>Church Members</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Add New Member
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search members by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="filter-section">
          <label htmlFor="memberTypeFilter">Filter by Type:</label>
          <select
            id="memberTypeFilter"
            value={memberTypeFilter}
            onChange={(e) =>
              setMemberTypeFilter(
                e.target.value as "all" | "fulltime" | "onetime"
              )
            }
            className="filter-select"
          >
            <option value="all">All Members</option>
            <option value="fulltime">Fulltime Members</option>
            <option value="onetime">One Time Members</option>
          </select>
        </div>
        <div className="filter-section">
          <label htmlFor="activeFilter">Filter by Status:</label>
          <select
            id="activeFilter"
            value={activeFilter}
            onChange={(e) =>
              setActiveFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <div className="members-grid">
        {filteredMembers.map((member) => {
          const membership = dataService.getMembershipByMemberId(member.id);

          return (
            <div
              key={member.id}
              className={`member-card ${!member.isActive ? "inactive" : ""}`}
            >
              <div className="member-header">
                <h3>
                  {member.firstName} {member.lastName}
                </h3>
                <div className="member-status">
                  {member.isActive ? (
                    <span className="status-active">Active</span>
                  ) : (
                    <span className="status-inactive">Inactive</span>
                  )}
                </div>
              </div>

              <div className="member-info">
                <div className="info-item">
                  <strong>Phone:</strong> {formatPhone(member.phone)}
                </div>
                <div className="info-item">
                  <strong>Join Date:</strong> {formatDate(member.joinDate)}
                </div>
                <div className="info-item">
                  <strong>Member Type:</strong>
                  <span className={`member-type ${member.memberType}`}>
                    {member.memberType === "fulltime"
                      ? "Fulltime Member"
                      : "One Time Member"}
                  </span>
                </div>
                <div className="info-item">
                  <strong>Address:</strong> {member.address}
                </div>
              </div>

              <div className="emergency-contact">
                <h4>Emergency Contact</h4>
                <div className="info-item">
                  <strong>Name:</strong> {member.emergencyContact.name}
                </div>
                <div className="info-item">
                  <strong>Phone:</strong>{" "}
                  {formatPhone(member.emergencyContact.phone)}
                </div>
                <div className="info-item">
                  <strong>Relationship:</strong>{" "}
                  {member.emergencyContact.relationship}
                </div>
              </div>

              <div className="membership-info">
                <h4>Membership Status</h4>
                {membership ? (
                  <div>
                    <div className="info-item">
                      <strong>Status:</strong>
                      <span
                        className={`membership-status ${membership.status}`}
                      >
                        {membership.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="info-item">
                      <strong>Monthly Amount:</strong>{" "}
                      {formatCurrency(membership.monthlyAmount)}
                    </div>
                    <div className="info-item">
                      <strong>Renewal Date:</strong>{" "}
                      {formatDate(membership.renewalDate)}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>No active membership</p>
                    <button
                      onClick={() => handleCreateMembership(member.id)}
                      className="btn btn-small btn-primary"
                    >
                      Create Membership
                    </button>
                  </div>
                )}
              </div>

              <div className="member-actions">
                <button
                  onClick={() => openEditForm(member)}
                  className="btn btn-small btn-secondary"
                >
                  Edit
                </button>
                {member.isActive ? (
                  <button
                    onClick={() => handleDeactivateMember(member)}
                    className="btn btn-small btn-warning"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivateMember(member)}
                    className="btn btn-small btn-success"
                  >
                    Reactivate
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMember(member)}
                  className="btn btn-small btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="empty-state">
          <h3>No members found</h3>
          <p>
            {searchTerm
              ? "No members match your search criteria."
              : "Get started by adding your first church member."}
          </p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Add First Member
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeModal}
        isDangerous={confirmModal.isDangerous}
      />
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
};

export default Members;
