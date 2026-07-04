import React, { useMemo } from 'react';
import { Activity, Database, Eye, Heart, MessageSquare, ShieldCheck, Users } from 'lucide-react';

const metricIcons = {
  users: Users,
  verifiedUsers: ShieldCheck,
  likes: Heart,
  messages: MessageSquare,
  profileViews: Eye,
  conversations: Activity,
};

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString([], {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const AdminOverview = ({ report, onSelectSection }) => {
  const metricCards = useMemo(() => {
    if (!report) return [];

    return [
      ['users', 'Total users', report.metrics.users],
      ['verifiedUsers', 'Verified users', report.metrics.verifiedUsers],
      ['likes', 'Likes sent', report.metrics.likes],
      ['messages', 'Messages', report.metrics.messages],
      ['profileViews', 'Profile views', report.metrics.profileViews],
      ['conversations', 'Conversations', report.metrics.conversations],
    ];
  }, [report]);

  if (!report) return <div className="admin-loading">Loading report...</div>;

  return (
    <>
      <section className="admin-metrics">
        {metricCards.map(([key, label, value]) => {
          const Icon = metricIcons[key] || Database;
          return (
            <article className="admin-metric" key={key}>
              <Icon size={22} />
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          );
        })}
      </section>

      <section className="admin-grid">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Table Counts</h2>
              <p>Live totals from database models</p>
            </div>
            <Database size={22} />
          </div>
          <div className="table-count-list">
            {report.tableCounts.map((table) => (
              <button key={table.name} onClick={() => onSelectSection(table.name)}>
                <span>{table.name}</span>
                <strong>{table.count}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest user, message, like, and view events</p>
            </div>
            <Activity size={22} />
          </div>
          <div className="activity-list">
            {report.recentActivity.map((item, index) => (
              <div className="activity-item" key={`${item.type}-${item.createdAt}-${index}`}>
                <span>{item.type}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </div>
                <time>{formatDate(item.createdAt)}</time>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminOverview;
