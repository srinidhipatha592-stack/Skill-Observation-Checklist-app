import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "../api/axios";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
} from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || "");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/login", form);
      const { access_token, role, name, email, id } = res.data;
      
      if (role !== "admin") {
        setError("Access Denied. Administrator privileges are required.");
        setLoading(false);
        return;
      }

      localStorage.setItem("access_token", access_token);      
      localStorage.setItem("user_role", role);
      localStorage.setItem("user_name", name);
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_id", id);

      navigate("/admin-dashboard");
      
    } catch (err) {
      let errorMsg = "Invalid credentials. Please try again.";
      if (err?.response?.data?.detail) {
        if (typeof err.response.data.detail === "string") {
          errorMsg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail[0]?.msg || errorMsg;
        }
      }
      setError(errorMsg);
      // Force a tiny re-render for shake animation if error is same
      setTimeout(() => setError(errorMsg), 50);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Left decorative panel */}
      <div style={styles.panel}>
        <div style={styles.panelInner}>
          <div style={styles.panelLogo}>
            <MdAdminPanelSettings size={40} color="#fff" />
          </div>
          <h1 style={styles.panelHeading}>System<br />Administration<br />Portal.</h1>
          <p style={styles.panelSub}>
            Secure access for authorized administrators to manage the SkillWatch platform.
          </p>
        </div>

        {/* Background blobs */}
        <div style={styles.blob1} />
        <div style={styles.blob2} />
      </div>

      {/* Right form panel */}
      <div style={styles.formSide}>
        <div style={styles.formCard}>
          <div style={styles.mobileLogo}>
            <MdAdminPanelSettings size={28} color="#0F172A" />
            <span style={styles.mobileLogoText}>Admin Portal</span>
          </div>

          <h2 style={styles.formHeading}>Admin Login</h2>
          <p style={styles.formSub}>Enter your credentials to access the admin dashboard.</p>

          {error && (
            <div style={styles.errorBox} className="shake-animation">
              <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email/Username */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Admin Email or Username</label>
              <div style={styles.inputWrap}>
                <FiMail size={16} style={styles.inputIcon} />
                <input
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="admin@skillcheck.com"
                  value={form.identifier}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <FiLock size={16} style={styles.inputIcon} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingRight: 44 }}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.btn, ...styles.btnDisabled } : styles.btn}
            >
              {loading ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} />
                  Authenticating…
                </span>
              ) : (
                "Login to Admin Portal"
              )}
            </button>
          </form>

          <p style={styles.footer}>
            Not an administrator?{" "}
            <Link to="/login" style={styles.footerLink}>
              Return to User Login
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .login-form-card { animation: fadeUp 0.45s ease both; }
        .shake-animation { animation: shake 0.3s ease-in-out; }
        @media (max-width: 768px) {
          .login-panel { display: none !important; }
          .login-form-side { width: 100% !important; padding: 24px 16px !important; }
          .login-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: "#F8FAFC",
  },
  panel: {
    className: "login-panel",
    flex: "0 0 480px",
    background: "linear-gradient(145deg, #0F172A 0%, #1E293B 45%, #334155 100%)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
  },
  panelInner: {
    position: "relative",
    zIndex: 2,
    maxWidth: 360,
  },
  panelLogo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    border: "1px solid rgba(255,255,255,0.25)",
  },
  panelHeading: {
    fontSize: 36,
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.2,
    marginBottom: 16,
    letterSpacing: "-0.5px",
  },
  panelSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 1.6,
    marginBottom: 32,
  },
  blob1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    top: -80,
    right: -100,
    zIndex: 1,
  },
  blob2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    bottom: -60,
    left: -80,
    zIndex: 1,
  },
  formSide: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  },
  formCard: {
    width: "100%",
    maxWidth: 420,
    animation: "fadeUp 0.45s ease both",
  },
  mobileLogo: {
    display: "none",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  mobileLogoText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
  },
  formHeading: {
    fontSize: 28,
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: 6,
    letterSpacing: "-0.3px",
  },
  formSub: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 28,
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "12px 14px",
    borderRadius: 10,
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 20,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
  },
  inputWrap: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94A3B8",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "11px 14px 11px 40px",
    fontSize: 14,
    border: "1.5px solid #E2E8F0",
    borderRadius: 10,
    background: "#fff",
    color: "#0F172A",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputFocus: {
    borderColor: "#0F172A",
    boxShadow: "0 0 0 3px rgba(15,23,42,0.12)",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94A3B8",
    display: "flex",
    alignItems: "center",
    padding: 4,
  },
  btn: {
    marginTop: 4,
    padding: "12px",
    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s",
    boxShadow: "0 4px 14px rgba(15,23,42,0.35)",
  },
  btnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  spinnerWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 13,
    color: "#64748B",
  },
  footerLink: {
    color: "#0F172A",
    fontWeight: 500,
    textDecoration: "none",
  },
};
