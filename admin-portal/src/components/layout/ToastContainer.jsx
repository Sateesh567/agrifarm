// components/layout/ToastContainer.jsx
import React from 'react'

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{ICONS[t.type] || '🔔'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
