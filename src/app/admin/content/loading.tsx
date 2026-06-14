export default function ContentLoading() {
  return (
    <div className="admin-loading-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title shimmer" />
        <div className="skeleton-subtitle shimmer" />
      </div>
      <div className="skeleton-stats" style={{ gridTemplateColumns: "1fr" }}>
        <div className="skeleton-card shimmer" style={{ height: 200 }} />
        <div className="skeleton-card shimmer" style={{ height: 200 }} />
      </div>
      <style>{`
        .admin-loading-skeleton { padding: 2rem; animation: fadeInSkeleton 0.15s ease; }
        @keyframes fadeInSkeleton { from { opacity: 0; } to { opacity: 1; } }
        .shimmer {
          background: linear-gradient(90deg, rgba(183,150,120,0.08) 25%, rgba(183,150,120,0.18) 50%, rgba(183,150,120,0.08) 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-header { margin-bottom: 2rem; }
        .skeleton-title { width: 220px; height: 32px; margin-bottom: 10px; }
        .skeleton-subtitle { width: 320px; height: 16px; }
        .skeleton-stats { display: grid; gap: 1.2rem; margin-bottom: 2rem; }
        .skeleton-card { border-radius: 16px; }
      `}</style>
    </div>
  );
}
