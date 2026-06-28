import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { MdEdit, MdDelete, MdPersonAdd, MdSearch } from "react-icons/md";

function UserManagement() {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(location.state?.defaultFilter || "all");
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/users/", getHeaders());
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
      } else {
        alert("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setEditingUserId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("teacher");
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!name || !email || !role || (!editingUserId && !password)) {
      alert("Fill all required fields");
      return;
    }

    try {
      const payload = { name, email, role };
      if (password) payload.password = password; // Only send password if updated

      if (editingUserId) {
        await axios.put(`/api/users/${editingUserId}`, payload, getHeaders());
        alert("User updated successfully");
      } else {
        await axios.post("/api/users/", payload, getHeaders());
        alert("User created successfully");
      }

      clearForm();
      fetchUsers();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.detail || "Failed to save user");
    }
  };

  const editUser = (user) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword("");
  };

  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/users/${userId}`, getHeaders());
      alert("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.log(error);
      alert("Failed to delete user");
    }
  };

  const filteredUsers = (users || []).filter((user) => {
    const nameStr = user.name || "";
    const emailStr = user.email || "";
    
    const matchesSearch =
      nameStr.toLowerCase().includes(search.toLowerCase()) ||
      emailStr.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Sidebar />
      <div
        style={{
          marginLeft: "var(--sidebar-width)",
          minHeight: "100vh",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <Topbar
          title="User Management"
          breadcrumbs={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "User Management", path: null }
          ]}
          showSearch={false}
        />

        <div
          style={{
            padding: "32px",
            maxWidth: "1200px",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Header Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", color: "#1e293b", fontWeight: "600" }}>Manage Users</h1>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                Create, update, and remove system users
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "24px" }}>
            {/* Form Section */}
            <div style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", height: "fit-content" }}>
              <h3 style={{ margin: "0 0 20px", color: "#0f172a", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <MdPersonAdd size={20} color="#3b82f6" />
                {editingUserId ? "Edit User" : "Create New User"}
              </h3>

              <form onSubmit={submitForm} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "14px", outline: "none" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "14px", outline: "none" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}>
                    Password {editingUserId && <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "normal" }}>(Leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "14px", outline: "none" }}
                    required={!editingUserId}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#334155" }}>Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "14px", outline: "none", backgroundColor: "#fff" }}
                  >
                    <option value="admin">Administrator</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="submit"
                    style={{ flex: 1, backgroundColor: "#3b82f6", color: "white", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "500", transition: "background 0.2s" }}
                  >
                    {editingUserId ? "Update" : "Create"}
                  </button>
                  {editingUserId && (
                    <button
                      type="button"
                      onClick={clearForm}
                      style={{ flex: 1, backgroundColor: "#f1f5f9", color: "#475569", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "500", transition: "background 0.2s" }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List Section */}
            <div style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px" }}>User List ({filteredUsers.length})</h3>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ position: "relative", width: "240px" }}>
                    <MdSearch size={18} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "14px", outline: "none" }}
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", backgroundColor: "#fff" }}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "8px" }}>
                  No users found matching your search.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                        <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Name</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Email</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Role</th>
                        <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                          <td style={{ padding: "12px 16px", fontSize: "14px", color: "#1e293b", fontWeight: "500" }}>{user.name}</td>
                          <td style={{ padding: "12px 16px", fontSize: "14px", color: "#475569" }}>{user.email}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "500",
                              backgroundColor: user.role === "admin" ? "#fef3c7" : user.role === "teacher" ? "#e0e7ff" : "#dcfce7",
                              color: user.role === "admin" ? "#d97706" : user.role === "teacher" ? "#4f46e5" : "#16a34a"
                            }}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <button onClick={() => editUser(user)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "#64748b" }} title="Edit">
                              <MdEdit size={18} />
                            </button>
                            <button onClick={() => deleteUser(user.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "#ef4444", marginLeft: "4px" }} title="Delete">
                              <MdDelete size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
