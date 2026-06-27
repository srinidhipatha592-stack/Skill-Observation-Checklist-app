import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../api/axios";
import {
  FiMail,
  FiSend,
  FiUsers,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiFileText,
  FiFile,
  FiDownload,
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import PageLoader from '../components/PageLoader';

const token = () => localStorage.getItem("access_token");

const cardStyle = {
  background: "#fff",
  borderRadius: 20,
  padding: 28,
  boxShadow: "0 4px 24px rgba(0,0,0,.07)",
  border: "1px solid #E2E8F0",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 20,
};

const cardTitleStyle = {
  margin: 0,
  fontSize: 17,
  fontWeight: 700,
  color: "#0F172A",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  fontSize: 14,
  color: "#0F172A",
  background: "#F8FAFC",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export default function EmailReports() {
  const [users, setUsers] = useState([]);
  const [children, setChildren] = useState([]);
  const [observations, setObservations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");
  const [parentSearch, setParentSearch] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [usersRes, childrenRes, obsRes] = await Promise.all([
        axios.get("/api/users/", {
          headers: { Authorization: `Bearer ${token()}` },
        }),
        axios.get("/api/children/", {
          headers: { Authorization: `Bearer ${token()}` },
        }),
        axios.get("/api/observations/", {
          headers: { Authorization: `Bearer ${token()}` },
        }),
      ]);
      setUsers(usersRes.data.filter((u) => u.role === "parent"));
      setChildren(childrenRes.data);
      setObservations(obsRes.data);
    } catch (err) {
      setError("Failed to load initial data.");
    } finally {
      setLoading(false);
    }
  };

  const selectedParent = users.find((u) => u.id === selectedParentId);
  const parentChildren = selectedParent
    ? children.filter((c) => c.parent_email === selectedParent.email)
    : [];
  const selectedChild = parentChildren.find(
    (c) => String(c.id) === selectedChildId
  );
  const childObservations = selectedChild
    ? observations
        .filter((o) => String(o.child_id) === selectedChildId)
        .sort((a, b) => {
          const dA = new Date(a.observation_date || a.created_at || a.date);
          const dB = new Date(b.observation_date || b.created_at || b.date);
          return dB - dA;
        })
    : [];

  const totalObs = childObservations.length;
  const avgRating = totalObs
    ? (
        childObservations.reduce((acc, o) => acc + o.rating, 0) / totalObs
      ).toFixed(1)
    : "N/A";

  const skillCount = {};
  childObservations.forEach((o) => {
    const s = o.skill_name || o.skill || "General";
    if (!skillCount[s]) skillCount[s] = { sum: 0, count: 0 };
    skillCount[s].sum += o.rating;
    skillCount[s].count += 1;
  });

  let bestSkill = "N/A";
  let weakestSkill = "N/A";
  if (Object.keys(skillCount).length > 0) {
    const sortedSkills = Object.entries(skillCount)
      .map(([k, v]) => ({ skill: k, avg: v.sum / v.count }))
      .sort((a, b) => b.avg - a.avg);
    bestSkill = sortedSkills[0].skill;
    weakestSkill = sortedSkills[sortedSkills.length - 1].skill;
  }

  const generatePDFDoc = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.text("Skill Observation Report", 14, 22);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 28, 196, 28);
    
    // Child Info
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont(undefined, 'bold');
    doc.text("Child Details", 14, 40);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Name: ${selectedChild.name}`, 14, 48);
    doc.text(`Age: ${selectedChild.age || "N/A"}`, 14, 55);
    doc.text(`Classroom: ${selectedChild.classroom || "N/A"}`, 80, 55);
    doc.text(`Parent: ${selectedParent.name} (${selectedParent.email})`, 14, 62);

    // Summary Stats
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("Observation Summary", 14, 78);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Observations: ${totalObs}`, 14, 86);
    doc.text(`Average Rating: ${avgRating} / 5`, 80, 86);
    doc.text(`Best Skill: ${bestSkill}`, 14, 93);
    doc.text(`Needs Work: ${weakestSkill}`, 80, 93);

    // Recommendations
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("Recommendations", 14, 109);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    
    const strengthText = `Strengths: ${selectedChild.name} shows great aptitude in ${bestSkill}. Encourage continued practice.`;
    const improveText = `Areas to Improve: Focus on activities that build confidence in ${weakestSkill}.`;
    
    const splitStrength = doc.splitTextToSize(strengthText, 180);
    doc.text(splitStrength, 14, 117);
    const strengthHeight = splitStrength.length * 7;
    
    const splitImprove = doc.splitTextToSize(improveText, 180);
    doc.text(splitImprove, 14, 117 + strengthHeight);
    const improveHeight = splitImprove.length * 7;

    const tableStartY = 117 + strengthHeight + improveHeight + 10;

    if (childObservations.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text("Recent Observations", 14, tableStartY);
      autoTable(doc, {
        startY: tableStartY + 6,
        head: [["Date", "Skill", "Rating", "Notes"]],
        body: childObservations.slice(0, 15).map((o) => {
          const d = o.observation_date || o.created_at || o.date;
          return [
            d ? new Date(d).toLocaleDateString() : "",
            o.skill_name || o.skill || "General",
            `${o.rating}/5`,
            o.notes || "",
          ];
        }),
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      });
    }
    return doc;
  };

  const handleDownload = () => {
    if (!selectedChild) return;
    const doc = generatePDFDoc();
    doc.save(
      `Skill_Observation_Report_${selectedChild.name.replace(/ /g, "_")}.pdf`
    );
  };

  const handleSend = () => {
    if (!selectedParentId || !selectedChildId) return;
    
    // First download the PDF so the user can easily attach it
    handleDownload();
    
    const subject = `Skill Observation Report – ${selectedChild?.name}`;
    const body = `Dear ${selectedParent?.name},\n\nPlease find attached the latest Skill Observation Checklist Report for your child, ${selectedChild?.name}.\n\nThe report contains:\n• Progress Summary\n• Observation History\n• Personalised Recommendations\n\nRegards,\nSchool Administration`;

    // Construct the Gmail link
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedParent.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open Gmail in a new tab
    window.open(gmailUrl, '_blank');
    
    setSuccess(`Downloaded PDF and opened Gmail. Please attach the downloaded PDF to the email.`);
    
    // Optional: Reset selections if needed, but keeping them might be better
    // so the user knows who they just processed.
  };

  if (loading) return <PageLoader />;
const filteredParents = users.filter(
    (u) =>
      u.name.toLowerCase().includes(parentSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(parentSearch.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Sidebar />
      <div
        style={{
          marginLeft: "var(--sidebar-width)",
          padding: "32px 40px",
          fontFamily: "'Inter', sans-serif",
          boxSizing: "border-box",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0F172A" }}
          >
            Email Reports
          </h1>
          <p style={{ margin: "6px 0 0", color: "#64748B", fontSize: 15 }}>
            Generate and send professional child progress reports to parents.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 14,
              padding: "14px 18px",
              color: "#DC2626",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FiAlertCircle size={16} /> {error}
            </div>
            <button
              onClick={() => setError("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626" }}
            >
              <FiX size={16} />
            </button>
          </div>
        )}
        {success && (
          <div
            style={{
              background: "#ECFDF5",
              border: "1px solid #A7F3D0",
              borderRadius: 14,
              padding: "14px 18px",
              color: "#059669",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FiCheckCircle size={16} /> {success}
            </div>
            <button
              onClick={() => setSuccess("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#059669" }}
            >
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* Two-column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 28,
            alignItems: "start",
          }}
        >
          {/* ── LEFT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Parent Selection */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <FiUsers color="#2563EB" size={20} />
                <h3 style={cardTitleStyle}>Select Parent</h3>
              </div>
              <input
                type="text"
                placeholder="Search parent by name or email…"
                value={parentSearch}
                onChange={(e) => setParentSearch(e.target.value)}
                style={inputStyle}
              />
              <div
                style={{
                  maxHeight: 220,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                {filteredParents.length === 0 && (
                  <div style={{ color: "#94A3B8", fontSize: 14, padding: "10px 0" }}>
                    No parents found.
                  </div>
                )}
                {filteredParents.map((parent) => (
                  <div
                    key={parent.id}
                    onClick={() => { setSelectedParentId(parent.id); setSelectedChildId(""); }}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      cursor: "pointer",
                      border: `2px solid ${selectedParentId === parent.id ? "#2563EB" : "#E2E8F0"}`,
                      background: selectedParentId === parent.id ? "#EFF6FF" : "#fff",
                      transition: "all 0.18s",
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>
                      {parent.name}
                    </div>
                    <div style={{ color: "#64748B", fontSize: 13 }}>{parent.email}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Child Selection */}
            <div
              style={{
                ...cardStyle,
                opacity: selectedParentId ? 1 : 0.5,
                pointerEvents: selectedParentId ? "auto" : "none",
              }}
            >
              <div style={cardHeaderStyle}>
                <FiUser color="#10B981" size={20} />
                <h3 style={cardTitleStyle}>Select Child</h3>
              </div>
              {!selectedParentId ? (
                <div style={{ color: "#94A3B8", fontSize: 14 }}>
                  Please select a parent first.
                </div>
              ) : parentChildren.length === 0 ? (
                <div style={{ color: "#94A3B8", fontSize: 14 }}>
                  No children linked to this parent.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {parentChildren.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => setSelectedChildId(String(child.id))}
                      style={{
                        padding: "14px",
                        borderRadius: 10,
                        cursor: "pointer",
                        border: `2px solid ${selectedChildId === String(child.id) ? "#10B981" : "#E2E8F0"}`,
                        background: selectedChildId === String(child.id) ? "#ECFDF5" : "#fff",
                        transition: "all 0.18s",
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 15 }}>
                        {child.name}
                      </div>
                      <div style={{ color: "#64748B", fontSize: 13 }}>
                        Age: {child.age || "–"} • Class: {child.classroom || "–"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Email Preview */}
            <div
              style={{
                ...cardStyle,
                opacity: selectedChildId ? 1 : 0.5,
                pointerEvents: selectedChildId ? "auto" : "none",
              }}
            >
              <div style={cardHeaderStyle}>
                <FiMail color="#8B5CF6" size={20} />
                <h3 style={cardTitleStyle}>Email Preview</h3>
              </div>
              {!selectedChildId ? (
                <div style={{ color: "#94A3B8", fontSize: 14 }}>
                  Select a child to preview the email.
                </div>
              ) : (
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                    padding: 18,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#334155",
                  }}
                >
                  <p><strong>To:</strong> {selectedParent?.email}</p>
                  <p><strong>Subject:</strong> Skill Observation Report – {selectedChild?.name}</p>
                  <hr style={{ border: "none", borderTop: "1px solid #E2E8F0", margin: "12px 0" }} />
                  <p>Dear {selectedParent?.name},</p>
                  <p>
                    Please find below the latest Skill Observation Checklist Report for your
                    child, <strong>{selectedChild?.name}</strong>.
                  </p>
                  <p>
                    The report contains:<br />
                    • Progress Summary<br />
                    • Observation History<br />
                    • Personalised Recommendations
                  </p>
                  <p style={{ marginTop: 16, color: "#2563EB", fontWeight: 600 }}>
                    <FiFileText size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                    {`Skill_Observation_Report_${selectedChild?.name.replace(/ /g, "_")}.pdf`}
                  </p>
                  <p style={{ marginTop: 16, color: "#64748B" }}>
                    Regards,<br />School Administration
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button
                  onClick={handleDownload}
                  disabled={!selectedChildId}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#fff",
                    border: "2px solid #2563EB",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#2563EB",
                    cursor: !selectedChildId ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    opacity: !selectedChildId ? 0.6 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <FiDownload size={16} /> Download PDF
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !selectedChildId || !selectedParentId}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#2563EB",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#fff",
                    cursor: sending || !selectedChildId ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    opacity: sending || !selectedChildId ? 0.65 : 1,
                    boxShadow: "0 4px 14px rgba(37,99,235,.35)",
                    transition: "all 0.2s",
                  }}
                >
                  <FiSend size={16} /> {sending ? "Sending…" : "Send Email"}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Report Preview ── */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <FiFile color="#8B5CF6" size={20} />
                <h3 style={cardTitleStyle}>Report Preview</h3>
              </div>

              {!selectedChildId ? (
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: 14,
                    padding: "60px 0",
                    textAlign: "center",
                  }}
                >
                  <FiFileText size={44} color="#E2E8F0" style={{ marginBottom: 12 }} />
                  <p>Select a child to view the report preview.</p>
                </div>
              ) : (
                <div>
                  {/* Child info */}
                  <div
                    style={{
                      background: "#F8FAFC",
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 20,
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <h4 style={{ margin: "0 0 10px", fontSize: 18, color: "#0F172A" }}>
                      {selectedChild.name}
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        fontSize: 13,
                        color: "#64748B",
                      }}
                    >
                      <div><strong>Age:</strong> {selectedChild.age || "–"}</div>
                      <div><strong>Class:</strong> {selectedChild.classroom || "–"}</div>
                      <div><strong>Parent:</strong> {selectedParent?.name}</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <h5
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#0F172A",
                      margin: "0 0 12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Observation Summary
                  </h5>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >
                    {[
                      { label: "Total Obs", value: totalObs, bg: "#EFF6FF", c: "#1D4ED8", lc: "#3B82F6" },
                      { label: "Avg Rating", value: avgRating, bg: "#ECFDF5", c: "#047857", lc: "#10B981" },
                      { label: "Best Skill", value: bestSkill, bg: "#FEF3C7", c: "#B45309", lc: "#D97706" },
                      { label: "Needs Work", value: weakestSkill, bg: "#FEE2E2", c: "#B91C1C", lc: "#EF4444" },
                    ].map((s) => (
                      <div key={s.label} style={{ background: s.bg, padding: 14, borderRadius: 10 }}>
                        <div style={{ fontSize: 12, color: s.lc, fontWeight: 600 }}>{s.label}</div>
                        <div
                          style={{
                            fontSize: s.label.includes("Skill") ? 13 : 20,
                            color: s.c,
                            fontWeight: 700,
                            marginTop: 4,
                            wordBreak: "break-word",
                          }}
                        >
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <h5
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#0F172A",
                      margin: "0 0 10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Recommendations
                  </h5>
                  <div style={{ marginBottom: 24, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                    <p>
                      <strong>Strengths:</strong> {selectedChild.name} shows great aptitude in{" "}
                      <em>{bestSkill}</em>. Encourage continued practice.
                    </p>
                    <p>
                      <strong>Areas to Improve:</strong> Focus on activities that build confidence
                      in <em>{weakestSkill}</em>.
                    </p>
                  </div>

                  {/* Recent Observations table */}
                  <h5
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#0F172A",
                      margin: "0 0 10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Recent Observations
                  </h5>
                  {childObservations.length > 0 ? (
                    <div
                      style={{ border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: 13,
                          textAlign: "left",
                        }}
                      >
                        <thead>
                          <tr style={{ background: "#F8FAFC", color: "#64748B" }}>
                            {["Date", "Skill", "Rating"].map((h) => (
                              <th
                                key={h}
                                style={{
                                  padding: "10px 12px",
                                  borderBottom: "1px solid #E2E8F0",
                                  fontWeight: 600,
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {childObservations.slice(0, 5).map((o) => {
                            const d = o.observation_date || o.created_at || o.date;
                            return (
                            <tr key={o.id}>
                              <td style={{ padding: "10px 12px", borderBottom: "1px solid #F1F5F9" }}>
                                {d ? new Date(d).toLocaleDateString() : ""}
                              </td>
                              <td style={{ padding: "10px 12px", borderBottom: "1px solid #F1F5F9" }}>
                                {o.skill_name || o.skill || "General"}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  borderBottom: "1px solid #F1F5F9",
                                  fontWeight: 600,
                                  color: "#F59E0B",
                                }}
                              >
                                {o.rating}/5
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ color: "#94A3B8", fontSize: 14 }}>
                      No observations recorded yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
