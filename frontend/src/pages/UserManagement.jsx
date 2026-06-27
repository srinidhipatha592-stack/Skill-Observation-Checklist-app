import Sidebar from '../components/Sidebar';
import { useEffect, useState } from "react";
import axios from "../api/axios";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users/");
      // Ensure we always set an array to prevent crashes
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
      alert("Failed to load users");
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

  const createUser = async () => {
    if (!name || !email || !password || !role) {
      alert("Fill all fields");
      return;
    }

    try {
      await axios.post("/api/users/", {
        name,
        email,
        password,
        role,
      });

      alert("User created successfully");
      clearForm();
      fetchUsers();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.detail || "Failed to create user");
    }
  };

  const updateUser = async () => {
    try {
      await axios.put(`/api/users/${editingUserId}`, {
        name,
        email,
        password,
        role,
      });

      alert("User updated successfully");
      clearForm();
      fetchUsers();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.detail || "Failed to update user");
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
    const confirmDelete = window.confirm("Delete this user?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/users/${userId}`);
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
      nameStr.toLowerCase().includes((search || "").toLowerCase()) ||
      emailStr.toLowerCase().includes((search || "").toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Sidebar />
      <div
        style={{
          marginLeft: "var(--sidebar-width)",
          padding: "30px",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <hr />

        <h2>{editingUserId ? "Edit User" : "Create User"}</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br />
        <br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>

          <option value="teacher">Teacher</option>

          <option value="parent">Parent</option>
        </select>

        <br />
        <br />

        {editingUserId ? (
          <>
            <button onClick={updateUser}>Update User</button>{" "}
            <button onClick={clearForm}>Cancel</button>
          </>
        ) : (
          <button onClick={createUser}>Create User</button>
        )}

        <hr />

        <h2>User List</h2>

        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "300px",
              padding: "10px",
            }}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              marginLeft: "10px",
              padding: "10px",
            }}
          >
            <option value="all">All Roles</option>

            <option value="admin">Admin</option>

            <option value="teacher">Teacher</option>

            <option value="parent">Parent</option>
          </select>
        </div>

        {loading ? (
          <p>Loading Users...</p>
        ) : (
          <table border="1" width="100%" cellPadding="10">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>

                  <td>{user.email}</td>

                  <td>{user.role}</td>

                  <td>
                    <button onClick={() => editUser(user)}>Edit</button>{" "}
                    <button onClick={() => deleteUser(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
export default UserManagement;
