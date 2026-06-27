import AdminSidebar from "../components/AdminSidebar";

export default function AdminReports() {
  return (
    <div style={styles.root}>
      <AdminSidebar />
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>Reports Module</h1>
          <p style={styles.pageSub}>Generate and export system reports.</p>
        </header>

        <div style={styles.contentPlaceholder}>
          <h2>Reports Module</h2>
          <p style={{ color: "#64748B", marginTop: "8px" }}>
            This module is currently a placeholder. Full implementation (PDF, Excel, CSV exports) will be added in future phases.
          </p>
        </div>
      </main>
    </div>
  );
}

const styles = {
  root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
  main: { flex: 1, marginLeft: "260px", padding: "32px 40px" },
  header: { marginBottom: "32px" },
  pageTitle: { fontSize: "24px", fontWeight: 700, color: "#0F172A", margin: "0 0 4px 0" },
  pageSub: { fontSize: "15px", color: "#64748B", margin: 0 },
  contentPlaceholder: {
    backgroundColor: "#fff", padding: "60px 40px", borderRadius: "12px",
    border: "1px dashed #CBD5E1", textAlign: "center", color: "#475569"
  }
};
