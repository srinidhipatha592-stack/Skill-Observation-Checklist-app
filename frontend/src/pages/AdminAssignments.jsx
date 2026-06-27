import { useState, useEffect } from "react";
import axios from "../api/axios";
import AdminSidebar from "../components/AdminSidebar";
import { FiCheck, FiAlertCircle } from "react-icons/fi";

export default function AdminAssignments() {
  const [teachers, setTeachers] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [assignedChildIds, setAssignedChildIds] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [usersRes, childrenRes] = await Promise.all([
        axios.get("/api/users"),
        axios.get("/api/children")
      ]);
      
      const activeTeachers = usersRes.data.filter(
        (u) => u.role === "teacher" && u.status === "active"
      );
      setTeachers(activeTeachers);
      setChildren(childrenRes.data);
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = async (e) => {
    const teacherId = e.target.value;
    setSelectedTeacher(teacherId);
    setError("");
    setSuccess("");
    
    if (!teacherId) {
      setAssignedChildIds([]);
      return;
    }
    
    try {
      const res = await axios.get(`/api/admin/teachers/${teacherId}/assignments`);
      setAssignedChildIds(res.data.child_ids || []);
    } catch (err) {
      setError("Failed to load existing assignments for this teacher.");
    }
  };

  const handleCheckboxChange = (childId) => {
    setAssignedChildIds((prev) => {
      if (prev.includes(childId)) {
        return prev.filter((id) => id !== childId);
      } else {
        return [...prev, childId];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedTeacher) return;
    
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      await axios.post(`/api/admin/teachers/${selectedTeacher}/assign`, {
        child_ids: assignedChildIds
      });
      
      setSuccess("Assignments updated successfully!");
    } catch (err) {
      setError("Failed to update assignments.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.root}>
      <AdminSidebar />
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>Teacher-Student Assignments</h1>
          <p style={styles.pageSub}>Assign which students each teacher is responsible for.</p>
        </header>

        {error && (
          <div style={styles.errorBox}>
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div style={styles.successBox}>
            <FiCheck size={18} />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={styles.content}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>1. Select Teacher</h2>
              <select
                value={selectedTeacher}
                onChange={handleTeacherChange}
                style={styles.select}
              >
                <option value="">-- Choose a Teacher --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedTeacher && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>2. Assign Students</h2>
                <div style={styles.studentList}>
                  {children.length === 0 ? (
                    <p>No students found in the system.</p>
                  ) : (
                    children.map((child) => (
                      <label key={child.id} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={assignedChildIds.includes(child.id)}
                          onChange={() => handleCheckboxChange(child.id)}
                          style={styles.checkbox}
                        />
                        <div style={styles.childInfo}>
                          <span style={styles.childName}>{child.name}</span>
                          <span style={styles.childMeta}>Age: {child.age} | Class: {child.classroom || 'N/A'}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                
                <div style={styles.actions}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={saving ? { ...styles.btn, opacity: 0.7 } : styles.btn}
                  >
                    {saving ? "Saving..." : "Save Assignments"}
                  </button>
                </div>
              </div>
            )}
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
  successBox: {
    display: "flex", alignItems: "center", gap: "8px", padding: "12px",
    backgroundColor: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0",
    borderRadius: "8px", marginBottom: "20px"
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "800px"
  },
  card: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1E293B",
    marginBottom: "16px"
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    outline: "none",
    backgroundColor: "#fff"
  },
  studentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "400px",
    overflowY: "auto",
    padding: "4px",
    marginBottom: "24px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    cursor: "pointer",
    transition: "background 0.2s"
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer"
  },
  childInfo: {
    display: "flex",
    flexDirection: "column"
  },
  childName: {
    fontWeight: 500,
    color: "#1E293B",
    fontSize: "15px"
  },
  childMeta: {
    color: "#64748B",
    fontSize: "13px",
    marginTop: "4px"
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    borderTop: "1px solid #E2E8F0",
    paddingTop: "20px"
  },
  btn: {
    padding: "12px 24px",
    backgroundColor: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s"
  }
};
