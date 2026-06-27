import { Link, useLocation } from "react-router-dom";
import {
  FiPieChart,
  FiUsers,
  FiCheckSquare,
  FiBarChart2,
  FiSettings,
  FiLogOut
} from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";

export default function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/admin";
  };

  const navItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: FiPieChart },
    { name: "Approvals", path: "/admin/approvals", icon: FiUsers },
    { name: "Assignments", path: "/admin/assignments", icon: FiCheckSquare },
    { name: "Checklists", path: "/admin/checklists", icon: FiCheckSquare },
    { name: "Reports", path: "/admin/reports", icon: FiBarChart2 },
    { name: "Analytics", path: "/admin/analytics", icon: FiBarChart2 },
    { name: "Settings", path: "/admin/settings", icon: FiSettings },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoWrap}>
        <MdAdminPanelSettings size={28} color="#0F172A" />
        <span style={styles.logoText}>Admin Portal</span>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");
          return (
            <Link
              key={item.name}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <item.icon size={18} style={isActive ? { color: "#2563EB" } : {}} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div style={styles.bottomNav}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FiLogOut size={18} />
          <span>Admin Logout</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    backgroundColor: "#F8FAFC",
    borderRight: "1px solid #E2E8F0",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 40,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "24px 20px",
    borderBottom: "1px solid #E2E8F0",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0F172A",
  },
  nav: {
    flex: 1,
    padding: "20px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "8px",
    color: "#475569",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 500,
    transition: "background 0.2s, color 0.2s",
  },
  navItemActive: {
    backgroundColor: "#EFF6FF",
    color: "#1D4ED8",
    fontWeight: 600,
  },
  bottomNav: {
    padding: "20px 12px",
    borderTop: "1px solid #E2E8F0",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "none",
    border: "none",
    color: "#EF4444",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s",
  },
};
