import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiUser,
  FiCheckCircle
} from "react-icons/fi";
import { MdChildCare, MdOutlineSupervisorAccount } from "react-icons/md";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "teacher"
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        username: form.username || null,
        password: form.password,
        role: form.role
      };

      await axios.post("/api/auth/register", payload);
      
      setSuccess("Account created successfully! Logging you in...");
      
      // Auto-login
      const loginRes = await axios.post("/api/auth/login", {
        identifier: form.email,
        password: form.password
      });
      
      const { access_token, role, name, email, id } = loginRes.data;
      localStorage.setItem("access_token", access_token);      
      localStorage.setItem("user_role", role);
      localStorage.setItem("user_name", name);
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_id", id);
      
      setTimeout(() => {
        if (role === "admin") {
            navigate("/dashboard");
        } else if (role === "teacher") {
            navigate("/observations");
        } else if (role === "parent") {
            navigate("/parent-portal");
        } else {
            navigate("/dashboard");
        }
      }, 1500);
      
    } catch (err) {
      let errorMsg = "Registration failed. Please try again.";
      if (err?.response?.data?.detail) {
        if (typeof err.response.data.detail === "string") {
          errorMsg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail[0]?.msg || errorMsg;
        }
      }
      setError(errorMsg);
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
            <MdChildCare size={40} color="#fff" />
          </div>
          <h1 style={styles.panelHeading}>Join our community,<br />start tracking<br />today.</h1>
          <p style={styles.panelSub}>
            Create an account to begin monitoring milestones and collaborating with educators and parents.
          </p>

          <div style={styles.pillRow}>
            {["Secure", "Fast", "Collaborative"].map((r) => (
              <span key={r} style={styles.pill}>{r}</span>
            ))}
          </div>

          {/* Decorative floating cards */}
          <div style={styles.floatCard}>
            <span style={styles.floatEmoji}>📈</span>
            <div>
              <div style={styles.floatTitle}>Track Progress</div>
              <div style={styles.floatMeta}>Monitor developmental milestones seamlessly</div>
            </div>
          </div>

          <div style={{ ...styles.floatCard, ...styles.floatCardAlt }}>
            <span style={styles.floatEmoji}>🤝</span>
            <div>
              <div style={styles.floatTitle}>Collaborate</div>
              <div style={styles.floatMeta}>Connect with parents and teachers instantly</div>
            </div>
          </div>
        </div>

        {/* Background blobs */}
        <div style={styles.blob1} />
        <div style={styles.blob2} />
      </div>

      {/* Right form panel */}
      <div style={styles.formSide}>
        <div style={styles.formCard}>
          {/* Mobile logo */}
          <div style={styles.mobileLogo}>
            <MdChildCare size={28} color="#2563EB" />
            <span style={styles.mobileLogoText}>SkillWatch</span>
          </div>

          <h2 style={styles.formHeading}>Create an account</h2>
          <p style={styles.formSub}>Enter your details to get started</p>

          {error && (
            <div style={styles.errorBox}>
              <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={styles.successBox}>
              <FiCheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Full Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrap}>
                <FiUser size={16} style={styles.inputIcon} />
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                />
              </div>
            </div>

            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email address</label>
              <div style={styles.inputWrap}>
                <FiMail size={16} style={styles.inputIcon} />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@school.edu"
                  value={form.email}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                />
              </div>
            </div>

            {/* Username (optional) */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Username (Optional)</label>
              <div style={styles.inputWrap}>
                <FiUser size={16} style={styles.inputIcon} />
                <input
                  name="username"
                  type="text"
                  placeholder="johndoe123"
                  value={form.username}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                />
              </div>
            </div>

            {/* Role */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Role</label>
              <div style={styles.inputWrap}>
                <MdOutlineSupervisorAccount size={18} style={{...styles.inputIcon, left: 13}} />
                <select
                  name="role"
                  required
                  value={form.role}
                  onChange={handleChange}
                  style={styles.selectInput}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                >
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  {/* Admin role is typically assigned, not registered directly by the user, but we can allow it for testing */}
                </select>
              </div>
            </div>

            <div style={styles.rowGroup}>
                {/* Password */}
                <div style={{...styles.fieldGroup, flex: 1}}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrap}>
                    <FiLock size={16} style={styles.inputIcon} />
                    <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
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

                {/* Confirm Password */}
                <div style={{...styles.fieldGroup, flex: 1}}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.inputWrap}>
                    <FiLock size={16} style={styles.inputIcon} />
                    <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    style={{ ...styles.input, paddingRight: 44 }}
                    onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                    onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                    />
                    <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                    tabIndex={-1}
                    >
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                </div>
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
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.footerLink}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Keyframe styles injected via a style tag */}
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

        .login-form-card {
          animation: fadeUp 0.45s ease both;
        }

        @media (max-width: 768px) {
          .login-panel { display: none !important; }
          .login-form-side {
            width: 100% !important;
            padding: 24px 16px !important;
          }
          .login-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Inline styles ─────────────────────────────────────────────── */
const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: "#F8FAFC",
  },

  /* Left decorative panel */
  panel: {
    className: "login-panel",
    flex: "0 0 480px",
    background: "linear-gradient(145deg, #10B981 0%, #059669 45%, #047857 100%)",
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
  pillRow: {
    display: "flex",
    gap: 8,
    marginBottom: 48,
  },
  pill: {
    padding: "5px 14px",
    borderRadius: 100,
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 500,
    border: "1px solid rgba(255,255,255,0.25)",
  },
  floatCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 14,
    padding: "14px 18px",
    marginBottom: 12,
  },
  floatCardAlt: {
    background: "rgba(255,255,255,0.08)",
  },
  floatEmoji: {
    fontSize: 24,
    lineHeight: 1,
  },
  floatTitle: {
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
  },
  floatMeta: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginTop: 2,
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

  /* Right form side */
  formSide: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  },
  formCard: {
    width: "100%",
    maxWidth: 460,
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
    color: "#1E293B",
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
    marginBottom: 24,
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
    marginBottom: 16,
  },
  
  successBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "12px 14px",
    borderRadius: 10,
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    color: "#059669",
    fontSize: 13,
    marginBottom: 16,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  rowGroup: {
    display: "flex",
    gap: 12,
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
  selectInput: {
    width: "100%",
    padding: "11px 14px 11px 40px",
    fontSize: 14,
    border: "1.5px solid #E2E8F0",
    borderRadius: 10,
    background: "#fff",
    color: "#0F172A",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    appearance: "none",
  },
  inputFocus: {
    borderColor: "#10B981",
    boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.12)",
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
    marginTop: 8,
    padding: "12px",
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
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
    marginTop: 20,
    textAlign: "center",
    fontSize: 13,
    color: "#64748B",
  },
  footerLink: {
    color: "#10B981",
    fontWeight: 500,
    textDecoration: "none",
  },
};
