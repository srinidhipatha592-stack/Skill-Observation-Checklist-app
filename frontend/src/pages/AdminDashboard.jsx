import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import axios from "../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalChecklists: 0,
    completedObservations: 0,
    pendingReviews: 0,
    monthlyGrowth: 0,
  });

  useEffect(() => {
    // Placeholder fetch logic
    setStats({
      totalUsers: 145,
      activeUsers: 120,
      totalChecklists: 24,
      completedObservations: 580,
      pendingReviews: 12,
      monthlyGrowth: 15,
    });
  }, []);

  return (
    <div style={styles.root}>
      <AdminSidebar />
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>
          <p style={styles.pageSub}>Overview of platform statistics and activity</p>
        </header>

        <div style={styles.statsGrid}>
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} style={styles.statCard}>
              <div style={styles.statLabel}>
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
              </div>
              <div style={styles.statValue}>
                {key === "monthlyGrowth" ? `+${value}%` : value}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.contentPlaceholder}>
          <h2>Recent Activities & Charts</h2>
          <p style={{ color: "#64748B", marginTop: "8px" }}>
            (Full implementation of charts and logs will be added in future phases.)
          </p>
        </div>
      </main>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
  },
  main: {
    flex: 1,
    marginLeft: "260px",
    padding: "32px 40px",
  },
  header: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 4px 0",
  },
  pageSub: {
    fontSize: "15px",
    color: "#64748B",
    margin: 0,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  statCard: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  statLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#64748B",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#0F172A",
  },
  contentPlaceholder: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    border: "1px dashed #CBD5E1",
    textAlign: "center",
    color: "#475569",
  }
};
