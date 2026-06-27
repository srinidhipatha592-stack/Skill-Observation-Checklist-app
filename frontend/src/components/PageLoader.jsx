import Sidebar from './Sidebar';

/**
 * PageLoader – full-screen loading animation used on every page.
 * Usage: <PageLoader />
 */
export default function PageLoader() {
  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', position: 'relative' }}>
      <Sidebar />

      <div
        style={{
          marginLeft: 'var(--sidebar-width)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        {/* Animated rings */}
        <div style={{ position: 'relative', width: 72, height: 72 }}>
          {/* Outer ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: '#2563EB',
              borderRightColor: '#2563EB',
              animation: 'loader-spin 1s linear infinite',
            }}
          />
          {/* Middle ring */}
          <div
            style={{
              position: 'absolute',
              inset: 10,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: '#60A5FA',
              borderLeftColor: '#60A5FA',
              animation: 'loader-spin 0.75s linear infinite reverse',
            }}
          />
          {/* Inner dot */}
          <div
            style={{
              position: 'absolute',
              inset: 22,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #60A5FA)',
              animation: 'loader-pulse 1s ease-in-out infinite',
            }}
          />
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: '#1E40AF',
              letterSpacing: '-0.01em',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Loading…
          </p>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 13,
              color: '#94A3B8',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Please wait a moment
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: 160,
            height: 4,
            background: '#E2E8F0',
            borderRadius: 99,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 99,
              background: 'linear-gradient(90deg, #2563EB, #60A5FA)',
              animation: 'loader-bar 1.4s ease-in-out infinite',
            }}
          />
        </div>

        <style>{`
          @keyframes loader-spin {
            to { transform: rotate(360deg); }
          }
          @keyframes loader-pulse {
            0%, 100% { transform: scale(0.8); opacity: 0.7; }
            50%       { transform: scale(1);   opacity: 1;   }
          }
          @keyframes loader-bar {
            0%   { width: 0%;    margin-left: 0; }
            50%  { width: 70%;   margin-left: 0; }
            100% { width: 0%;    margin-left: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}
