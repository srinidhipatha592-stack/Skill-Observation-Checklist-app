import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import axios from "../api/axios";

import { getDashboardStats } from "../services/dashboardApi";
import { getObservations } from "../services/observationApi";
import { getChildProgress } from "../services/childProgressApi";

import DashboardCharts from "../components/DashboardCharts";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  MdPeopleAlt,
  MdFactCheck,
  MdNotificationsNone,
  MdHistory,
  MdGroups,
  MdShield,
  MdSchool,
  MdFamilyRestroom,
  MdAdd,
  MdPersonAdd,
  MdBarChart,
  MdEmojiEvents,
  MdAnalytics,
  MdArrowForward,
  MdStar,
  MdTrendingUp,
  MdOpenInNew,
} from "react-icons/md";
import PageLoader from '../components/PageLoader';

function Dashboard() {
  const role = localStorage.getItem("user_role");
  const userName = localStorage.getItem("user_name");

  const [stats, setStats] = useState({
    total_users: 0,
    total_admins: 0,
    total_teachers: 0,
    total_parents: 0,
    total_children: 0,
    total_observations: 0,
    total_notifications: 0,
    total_activity_logs: 0,
    trends: {},
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [observations, setObservations] = useState([]);
  const [recentObservations, setRecentObservations] = useState([]);
  const [topChild, setTopChild] = useState(null);
  const [childProgress, setChildProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        await Promise.all([
          loadStats(),
          loadRecentLogs(),
          loadObservations(),
          loadTopChild(),
          loadChildProgress(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadRecentLogs = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("/api/activity-logs/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentLogs(response.data.slice(0, 5));
    } catch (error) {
      console.log(error);
    }
  };

  const loadObservations = async () => {
    try {
      const data = await getObservations();
      console.log("OBSERVATIONS DATA:");
      setObservations(data);
      setRecentObservations(
        [...data]
          .sort(
            (a, b) =>
              new Date(b.observation_date) - new Date(a.observation_date),
          )
          .slice(0, 5),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const loadTopChild = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("/api/dashboard/top-child", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopChild(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadChildProgress = async () => {
    try {
      const data = await getChildProgress();
      const sorted = [...data].sort(
        (a, b) => b.average_rating - a.average_rating,
      );
      setChildProgress(sorted);
    } catch (error) {
      console.log(error);
    }
  };

  /* ── helpers ── */
  const getRatingStars = (rating) => {
    const full = Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <MdStar
        key={i}
        size={14}
        style={{ color: i < full ? "#f59e0b" : "#e2e8f0" }}
      />
    ));
  };

  const getSkillColor = (skill) => {
    const colors = {
      communication: "#3b82f6",
      speaking: "#10b981",
      drawing: "#f59e0b",
      counting: "#8b5cf6",
      running: "#ef4444",
      writing: "#06b6d4",
      default: "#64748b",
    };
    return colors[(skill || "").toLowerCase()] || colors.default;
  };

  /* ── helpers: time formatting ── */
  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  /* ── styles ── */
  const card = {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    padding: "20px",
  };

  if (loading) return <PageLoader />;

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
      <Sidebar />

      <div
        style={{
          marginLeft: "var(--sidebar-width)",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <Topbar
          title="Dashboard"
          breadcrumbs={[
            { label: "Main Console", path: "/dashboard" },
            { label: "Dashboard", path: null },
          ]}
          searchPlaceholder="Quick search children..."
        />

        <div
          style={{
            padding: "24px 40px",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* ── Page heading ── */}
          <div style={{ marginBottom: "20px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Welcome back, {userName || "Administrator"}
            </h1>
            <p
              style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}
            >
              Here's what's happening with your observations today.
            </p>
          </div>

          {/* ── Stat cards ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            {(role === "admin"
              ? [
                  {
                    to: "/children",
                    icon: <MdPeopleAlt size={20} />,
                    bg: "#eff6ff",
                    color: "#2563eb",
                    label: "Total Children",
                    value: stats.total_children,
                    trend: stats.trends?.total_children || "+ 12%",
                  },
                  {
                    to: "/observation-list",
                    icon: <MdFactCheck size={20} />,
                    bg: "#eef2ff",
                    color: "#6366f1",
                    label: "Total Observations",
                    value: stats.total_observations,
                    trend: stats.trends?.total_observations || "+ 5%",
                  },
                  {
                    to: "/user-management",
                    icon: <MdSchool size={20} />,
                    bg: "#ecfeff",
                    color: "#0891b2",
                    label: "Total Teachers",
                    value: stats.total_teachers,
                    trend: stats.trends?.total_teachers || "+ 2%",
                  },
                  {
                    to: "/notifications",
                    icon: <MdNotificationsNone size={20} />,
                    bg: "#fef2f2",
                    color: "#ef4444",
                    label: "Total Notifications",
                    value: stats.total_notifications,
                    trend: stats.trends?.total_notifications || "- 10%",
                  },
                ]
              : role === "teacher"
              ? [
                  {
                    to: "/children",
                    icon: <MdPeopleAlt size={20} />,
                    bg: "#eff6ff",
                    color: "#2563eb",
                    label: "Assigned Students",
                    value: stats.total_assigned_students,
                  },
                  {
                    to: "/observation-list",
                    icon: <MdFactCheck size={20} />,
                    bg: "#eef2ff",
                    color: "#6366f1",
                    label: "Total Observations",
                    value: stats.total_observations,
                  }
                ]
              : [
                  {
                    to: "/parent-portal",
                    icon: <MdPeopleAlt size={20} />,
                    bg: "#eff6ff",
                    color: "#2563eb",
                    label: "Total Children",
                    value: stats.total_children,
                  },
                  {
                    to: "/reports",
                    icon: <MdFactCheck size={20} />,
                    bg: "#eef2ff",
                    color: "#6366f1",
                    label: "Total Observations",
                    value: stats.total_observations,
                  }
                ]
            ).map((s) => (
              <Link key={s.label} to={s.to} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    ...card,
                    cursor: "pointer",
                    transition: "all .2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 10px 25px rgba(0,0,0,.12)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: s.bg,
                        color: s.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {s.icon}
                    </div>
                    {s.trend && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: s.trend.includes("-") ? "#ef4444" : "#16a34a",
                          background: s.trend.includes("-")
                            ? "#fef2f2"
                            : "#f0fdf4",
                          borderRadius: "20px",
                          padding: "2px 8px",
                        }}
                      >
                        {s.trend.replace("+", "↑").replace("-", "↓")}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: 500,
                        }}
                      >
                        {s.label}
                      </p>
                      <h3
                        style={{
                          margin: "2px 0 0",
                          fontSize: "26px",
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        {s.value}
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontWeight: 500,
                        marginBottom: "4px",
                      }}
                    >
                      from last month
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Admin-only extra cards */}
            {role === "admin" && (
              <>
                {[
                  {
                    to: "/user-management",
                    icon: <MdGroups size={20} />,
                    bg: "#fdf4ff",
                    color: "#a855f7",
                    label: "Total Users",
                    value: stats.total_users,
                    trend: stats.trends?.total_users || "+ 3%",
                  },
                  {
                    to: "/user-management",
                    icon: <MdShield size={20} />,
                    bg: "#fff7ed",
                    color: "#ea580c",
                    label: "Total Admins",
                    value: stats.total_admins,
                    trend: stats.trends?.total_admins || "- 0%",
                  },
                  {
                    to: "/user-management",
                    icon: <MdFamilyRestroom size={20} />,
                    bg: "#fdf2f8",
                    color: "#db2777",
                    label: "Total Parents",
                    value: stats.total_parents,
                    trend: stats.trends?.total_parents || "+ 5%",
                  },
                  {
                    to: "/activity-logs",
                    icon: <MdHistory size={20} />,
                    bg: "#f0fdf4",
                    color: "#16a34a",
                    label: "Activity Logs",
                    value: stats.total_activity_logs,
                    trend: stats.trends?.total_activity_logs || "+ 8%",
                  },
                ].map((s) => (
                  <Link
                    key={s.label}
                    to={s.to}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        ...card,
                        cursor: "pointer",
                        transition: "all .2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 10px 25px rgba(0,0,0,.12)";
                        e.currentTarget.style.transform = "translateY(-4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 1px 3px rgba(0,0,0,.06)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            background: s.bg,
                            color: s.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {s.icon}
                        </div>
                        {s.trend && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: s.trend.includes("-")
                                ? "#ef4444"
                                : "#16a34a",
                              background: s.trend.includes("-")
                                ? "#fef2f2"
                                : "#f0fdf4",
                              borderRadius: "20px",
                              padding: "2px 8px",
                            }}
                          >
                            {s.trend.replace("+", "↑").replace("-", "↓")}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "#64748b",
                              fontWeight: 500,
                            }}
                          >
                            {s.label}
                          </p>
                          <h3
                            style={{
                              margin: "2px 0 0",
                              fontSize: "26px",
                              fontWeight: 800,
                              color: "#0f172a",
                            }}
                          >
                            {s.value}
                          </h3>
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            fontWeight: 500,
                            marginBottom: "4px",
                          }}
                        >
                          from last month
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* ── Charts row ── */}
          <div style={{ marginBottom: "20px" }}>
            <DashboardCharts observations={observations} />
          </div>

          {/* ── Recent Observations table + Quick Actions ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 340px",
              gap: "20px",
              marginBottom: "20px",
              alignItems: "stretch",
            }}
          >
            {/* Recent Observations */}
            <div style={{ ...card, height: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Recent Observations
                </h2>
                <Link
                  to="/observation-list"
                  style={{
                    fontSize: "12px",
                    color: "#2563eb",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  View All
                </Link>
              </div>

              {recentObservations.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                  No observations yet.
                </p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Child Name", "Skill", "Rating", "Teacher", "Date"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              padding: "0 12px 10px",
                              borderBottom: "1px solid #f1f5f9",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {recentObservations.map((obs) => (
                      <tr key={obs.id}>
                        <td
                          style={{
                            padding: "12px 12px",
                            borderBottom: "1px solid #f8fafc",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <div
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                background: [
                                  "#dcfce7",
                                  "#fce7f3",
                                  "#e0e7ff",
                                  "#fef3c7",
                                  "#fee2e2",
                                ][(obs.child_name || "?").charCodeAt(0) % 5],
                                color: [
                                  "#16a34a",
                                  "#db2777",
                                  "#4f46e5",
                                  "#d97706",
                                  "#dc2626",
                                ][(obs.child_name || "?").charCodeAt(0) % 5],
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {(obs.child_name || "?")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            {obs.child_name || "—"}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px 12px",
                            borderBottom: "1px solid #f8fafc",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              background: getSkillColor(obs.skill_area) + "18",
                              color: getSkillColor(obs.skill_area),
                              borderRadius: "6px",
                              padding: "3px 8px",
                            }}
                          >
                            {obs.skill_area || "—"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px 12px",
                            borderBottom: "1px solid #f8fafc",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "2px",
                            }}
                          >
                            {getRatingStars(obs.rating)}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px 12px",
                            borderBottom: "1px solid #f8fafc",
                            fontSize: "13px",
                            color: "#64748b",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {obs.teacher_name || "Unknown"}
                        </td>
                        <td
                          style={{
                            padding: "12px 12px",
                            borderBottom: "1px solid #f8fafc",
                            fontSize: "12px",
                            color: "#64748b",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {obs.observation_date
                            ? new Date(obs.observation_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quick Actions */}
            <div style={card}>
              <h2
                style={{
                  margin: "0 0 16px",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Quick Actions
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  (role === "admin" || role === "teacher") && {
                    to: "/add-child",
                    icon: <MdPersonAdd size={18} />,
                    bg: "#eff6ff",
                    color: "#2563eb",
                    label: "Add Child",
                  },
                  (role === "admin" || role === "teacher") && {
                    to: "/observations",
                    icon: <MdAdd size={18} />,
                    bg: "#f0fdf4",
                    color: "#16a34a",
                    label: "Add Observation",
                  },
                  {
                    to: "/reports",
                    icon: <MdBarChart size={18} />,
                    bg: "#fdf4ff",
                    color: "#a855f7",
                    label: "Generate Report",
                  },
                  {
                    to: "/progress",
                    icon: <MdAnalytics size={18} />,
                    bg: "#fff7ed",
                    color: "#ea580c",
                    label: "View Progress",
                  },
                  role === "admin" && {
                    to: "/notifications",
                    icon: <MdNotificationsNone size={18} />,
                    bg: "#fef2f2",
                    color: "#ef4444",
                    label: "View Notifications",
                  },
                ].filter(Boolean).map((a) => (
                  <Link
                    key={a.label}
                    to={a.to}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        transition: "all .2s ease",
                        background: "#fff",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#cbd5e1";
                        e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.background = "#fff";
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: a.bg,
                          color: a.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {a.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {a.label}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom row: Top Child + Leaderboard + Recent Activity ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
            }}
          >
            {/* Top Child */}
            <div style={card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "#fffbeb",
                    color: "#d97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdEmojiEvents size={17} />
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Top Child
                </h2>
              </div>

              {topChild ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px",
                      background: "#fffbeb",
                      borderRadius: "10px",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "#fde68a",
                        color: "#92400e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {(topChild.child_name || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {topChild.child_name}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "2px",
                          marginTop: "2px",
                        }}
                      >
                        {getRatingStars(topChild.average_rating)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div
                      style={{
                        flex: 1,
                        background: "#eff6ff",
                        borderRadius: "8px",
                        padding: "10px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: 800,
                          color: "#2563eb",
                        }}
                      >
                        {topChild.average_rating}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "10px",
                          color: "#64748b",
                          fontWeight: 600,
                        }}
                      >
                        AVG RATING
                      </p>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: "#f0fdf4",
                        borderRadius: "8px",
                        padding: "10px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: 800,
                          color: "#16a34a",
                        }}
                      >
                        {topChild.total_observations}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "10px",
                          color: "#64748b",
                          fontWeight: 600,
                        }}
                      >
                        OBSERVATIONS
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/child-performance/${topChild.child_id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <button
                      style={{
                        marginTop: "14px",
                        width: "100%",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        padding: "10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      View Profile <MdArrowForward size={15} />
                    </button>
                  </Link>
                </>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                  No data available.
                </p>
              )}
            </div>

            {/* Child Progress Leaderboard */}
            <div style={card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdTrendingUp size={17} />
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Progress Leaderboard
                </h2>
              </div>

              {childProgress.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                  No progress data.
                </p>
              ) : (
                childProgress.slice(0, 5).map((child, i) => (
                  <div
                    key={child.child_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 0",
                      borderBottom: i < 4 ? "1px solid #f1f5f9" : "none",
                    }}
                  >
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background:
                          i === 0 ? "#fde68a" : i === 1 ? "#e2e8f0" : "#fed7aa",
                        color:
                          i === 0 ? "#92400e" : i === 1 ? "#475569" : "#9a3412",
                        fontSize: "10px",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/child-performance/${child.child_id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {child.child_name}
                        </p>
                      </Link>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "11px",
                          color: "#94a3b8",
                        }}
                      >
                        {child.total_observations} observations
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {child.average_rating}
                      </span>
                      <MdStar size={13} style={{ color: "#f59e0b" }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Activity */}
            <div style={card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "#f0fdf4",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdHistory size={17} />
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Recent Activity
                </h2>
              </div>

              {recentLogs.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                  No activity found.
                </p>
              ) : (
                recentLogs.slice(0, 5).map((log, i) => (
                  <div
                    key={log.id}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "10px 0",
                      borderBottom: i < 4 ? "1px solid #f1f5f9" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#16a34a",
                        marginTop: "5px",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {log.action}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "11px",
                          color: "#94a3b8",
                        }}
                      >
                        {formatRelativeTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
