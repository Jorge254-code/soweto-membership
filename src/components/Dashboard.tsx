import React, { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import dataService from "../services/dataService";
import { WeeklyStats, Member, Membership } from "../types";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getMembershipStatusText,
  getMemberTypeText,
  getMemberTypeColor,
} from "../utils";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [membersWithMemberships, setMembersWithMemberships] = useState<
    Array<Member & { membership?: Membership }>
  >([]);
  const [filter, setFilter] = useState<
    "all" | "active" | "expired" | "pending"
  >("all");

  const loadDashboardData = React.useCallback(() => {
    const stats = dataService.getWeeklyStats(currentWeek);
    const membersData = dataService.getMembersWithMemberships();

    setWeeklyStats(stats);
    setMembersWithMemberships(membersData);
  }, [currentWeek]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) =>
      direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const getWeekRange = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`;
  };

  const filteredMembers = membersWithMemberships.filter((member) => {
    if (filter === "all") return true;
    if (!member.membership) return filter === "pending";
    return member.membership.status === filter;
  });

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    color?: string;
  }> = ({ title, value, color = "#3b82f6" }) => (
    <div className="stat-card">
      <div className="stat-header">
        <h3>{title}</h3>
      </div>
      <div className="stat-value" style={{ color }}>
        {value}
      </div>
    </div>
  );

  if (!weeklyStats) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Membership Dashboard</h1>

        <div className="week-navigation">
          <button
            onClick={() => navigateWeek("prev")}
            className="btn btn-secondary"
          >
            ← Previous Week
          </button>
          <div className="current-week">
            <h2>{getWeekRange()}</h2>
            <button onClick={goToCurrentWeek} className="btn btn-link">
              Go to Current Week
            </button>
          </div>
          <button
            onClick={() => navigateWeek("next")}
            className="btn btn-secondary"
          >
            Next Week →
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Members" value={weeklyStats.totalMembers} />
        <StatCard
          title="Active Members"
          value={weeklyStats.activeMembers}
          color="#10b981"
        />
        <StatCard
          title="Inactive Members"
          value={weeklyStats.inactiveMembers}
          color="#6b7280"
        />
        <StatCard
          title="Active Memberships"
          value={weeklyStats.activeMemberships}
          color="#10b981"
        />
        <StatCard
          title="Expired Memberships"
          value={weeklyStats.expiredMemberships}
          color="#ef4444"
        />
        <StatCard
          title="Pending Renewals"
          value={weeklyStats.pendingRenewals}
          color="#f59e0b"
        />
        <StatCard
          title="Weekly Revenue"
          value={formatCurrency(weeklyStats.totalRevenue)}
          color="#10b981"
        />
        <StatCard
          title="New Members"
          value={weeklyStats.newMembers}
          color="#8b5cf6"
        />
        <StatCard
          title="Fulltime Members"
          value={weeklyStats.fulltimeMembers}
          color="#0ea5e9"
        />
        <StatCard
          title="One Time Members"
          value={weeklyStats.onetimeMembers}
          color="#f97316"
        />
      </div>

      <div className="members-section">
        <div className="section-header">
          <h2>Members Overview</h2>
          <div className="filter-controls">
            <label>Filter by membership:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Members</option>
              <option value="active">Active Membership</option>
              <option value="expired">Expired Membership</option>
              <option value="pending">No Membership</option>
            </select>
          </div>
        </div>

        <div className="members-table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Member Status</th>
                <th>Member Type</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Membership Status</th>
                <th>Monthly Amount</th>
                <th>Renewal Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className={!member.isActive ? "inactive-member" : ""}
                >
                  <td>
                    <div className="member-name">
                      {member.firstName} {member.lastName}
                    </div>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: member.isActive
                          ? "#10b981"
                          : "#6b7280",
                        color: "white",
                      }}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="type-badge"
                      style={{
                        backgroundColor: getMemberTypeColor(member.memberType),
                        color: "white",
                      }}
                    >
                      {getMemberTypeText(member.memberType)}
                    </span>
                  </td>
                  <td>{member.phone}</td>
                  <td>{formatDate(member.joinDate)}</td>
                  <td>
                    <div className="status-container">
                      {member.membership ? (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(
                              member.membership.status
                            ),
                            color: "white",
                          }}
                        >
                          {getMembershipStatusText(member.membership.status)}
                        </span>
                      ) : (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor("pending"),
                            color: "white",
                          }}
                        >
                          No Membership
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {member.membership
                      ? formatCurrency(member.membership.monthlyAmount)
                      : "-"}
                  </td>
                  <td>
                    {member.membership
                      ? formatDate(member.membership.renewalDate)
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMembers.length === 0 && (
            <div className="empty-state">
              <p>No members found matching the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
