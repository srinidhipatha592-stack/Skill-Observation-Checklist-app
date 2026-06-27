import { useState, useEffect } from "react";
import axios from "../api/axios";
import AdminSidebar from "../components/AdminSidebar";
import { FiCheck, FiX, FiAlertCircle } from "react-icons/fi";

export default function AdminApprovals() {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingTeachers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/teachers/pending");
      setPendingTeachers(res.data);
    } catch (err) {
      setError("Failed to load pending teachers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await axios.put(`/api/admin/teachers/${userId}/approval`, { action: "approve" });
      fetchPendingTeachers();
    } catch (err) {
      alert("Failed to approve teacher");
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Are you sure you want to reject this teacher application?")) return;
    try {
      await axios.put(`/api/admin/teachers/${userId}/approval`, { action: "reject" });
      fetchPendingTeachers();
    } catch (err) {
      alert("Failed to reject teacher");
    }
  };

  return (
    <div style={styles.root}>
      <AdminSidebar />
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>Teacher Approvals</h1>
          <p style={styles.pageSub}>Review and manage pending teacher accounts.</p>
        </header>

        {error && (
          <div style={styles.errorBox}>
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : pendingTeachers.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No pending teacher approvals at this time.</p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>School</th>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Qualification</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTeachers.map((teacher) => (
                  <tr key={teacher.id} style={styles.tr}>
                    <td style={styles.td}>{teacher.name}</td>
                    <td style={styles.td}>{teacher.email}</td>
                    <td style={styles.td}>{teacher.school_name || "N/A"}</td>
                    <td style={styles.td}>{teacher.employee_id || "N/A"}</td>
                    <td style={styles.td}>{teacher.qualification || "N/A"}</td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button
                          onClick={() => handleApprove(teacher.id)}
                          style={{ ...styles.btn, ...styles.btnApprove }}
                          title="Approve"
                        >
                          <FiCheck size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(teacher.id)}
                          style={{ ...styles.btn, ...styles.btnReject }}
                          title="Reject"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "'Inter', sans-serif" },
  main: { flex: 1, marginLeft: "260px", padding: "32px 40px" },
  header: { marginBottom: "32px" },
  pageTitle: { fontSize: "24px", fontWeight: 700, color: "#0F172A", margin: "0 0 4px 0" },
  pageSub: { fontSize: "15px", color: "#64748B", margin: 0 },
  errorBox: {
    display: "flex", alignItems: "center", gap: "8px", padding: "12px",
    backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA",
    borderRadius: "8px", marginBottom: "20px"
  },
  emptyState: {
    padding: "40px", textAlign: "center", color: "#64748B", backgroundColor: "#fff",
    borderRadius: "12px", border: "1px dashed #CBD5E1"
  },
  tableWrap: {
    backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden"
  },
  table: {
    width: "100%", borderCollapse: "collapse", textAlign: "left"
  },
  th: {
    padding: "16px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0",
    color: "#475569", fontWeight: 600, fontSize: "13px", textTransform: "uppercase"
  },
  tr: {
    borderBottom: "1px solid #E2E8F0"
  },
  td: {
    padding: "16px", color: "#334155", fontSize: "14px", verticalAlign: "middle"
  },
  actionBtns: {
    display: "flex", gap: "8px"
  },
  btn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "32px", height: "32px", borderRadius: "6px", border: "none",
    cursor: "pointer", transition: "all 0.2s"
  },
  btnApprove: {
    backgroundColor: "#ECFDF5", color: "#059669"
  },
  btnReject: {
    backgroundColor: "#FEF2F2", color: "#DC2626"
  }
};
