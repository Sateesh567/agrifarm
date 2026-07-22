// components/layout/NotifPanel.jsx
import React from 'react'

const ICONS = {
  warn: '⚠️',
  danger: '🚨',
  info: 'ℹ️',
  success: '✅'
}

export default function NotifPanel({ notifications, onClose }) {
  return (
    <div className="notif-panel-overlay">
      <div className="notif-panel-content">
        <div className="notif-panel-header">
          <h3>📢 System Alerts</h3>
          <button className="notif-panel-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="notif-panel-body">
          {notifications.length === 0 ? (
            <p className="no-notifs">All systems operational. No active alerts.</p>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className={`notif-item ${n.type || 'info'}`}>
                <span className="notif-icon">{ICONS[n.type] || '🔔'}</span>
                <span className="notif-msg">{n.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`
        .notif-panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .notif-panel-content {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          width: 90%;
          max-width: 450px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        .notif-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border);
        }
        .notif-panel-header h3 {
          margin: 0;
          font-family: var(--font-heading);
          font-size: 1.1rem;
        }
        .notif-panel-close-btn {
          background: none;
          border: none;
          color: var(--text2);
          font-size: 1.5rem;
          cursor: pointer;
        }
        .notif-panel-close-btn:hover {
          color: var(--text);
        }
        .notif-panel-body {
          padding: 16px;
          max-height: 300px;
          overflow-y: auto;
        }
        .notif-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border);
          margin-bottom: 10px;
          font-size: 0.9rem;
        }
        .notif-item.warn {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.3);
        }
        .notif-item.danger {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
        }
        .notif-item.info {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
        }
        .no-notifs {
          text-align: center;
          color: var(--text3);
          padding: 20px 0;
          margin: 0;
        }
      `}</style>
    </div>
  )
}
