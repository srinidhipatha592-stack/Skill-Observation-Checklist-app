import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiLogOut } from 'react-icons/fi';

export default function PendingApproval() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <FiClock size={48} color="#2563EB" />
        </div>
        
        <h1 style={styles.title}>Account Pending Approval</h1>
        
        <p style={styles.text}>
          Your teacher account has been successfully created and is currently awaiting approval from a school administrator.
        </p>
        
        <p style={styles.subtext}>
          You will be able to access your dashboard and assigned students once your account status is updated to "Active". Please check back later or contact your administrator if you have any questions.
        </p>
        
        <button onClick={handleLogout} style={styles.btn}>
          <FiLogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
      
      {/* Keyframe styles injected via a style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'Inter', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    background: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeUp 0.45s ease both',
  },
  iconWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '16px',
    letterSpacing: '-0.5px',
  },
  text: {
    fontSize: '15px',
    color: '#334155',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  subtext: {
    fontSize: '14px',
    color: '#64748B',
    lineHeight: '1.6',
    marginBottom: '32px',
    padding: '16px',
    background: '#F1F5F9',
    borderRadius: '8px',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#F1F5F9',
    color: '#334155',
    fontSize: '15px',
    fontWeight: '600',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};
