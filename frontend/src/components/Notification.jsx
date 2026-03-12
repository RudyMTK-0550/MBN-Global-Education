import { useState, useEffect, useCallback } from 'react'

let showNotificationFn = null

export function useNotification() {
  const show = useCallback((message, type = 'success') => {
    if (showNotificationFn) showNotificationFn(message, type)
  }, [])
  return show
}

export default function NotificationContainer() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    showNotificationFn = (message, type) => {
      const id = Date.now()
      setNotifications((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 3500)
    }
    return () => { showNotificationFn = null }
  }, [])

  return (
    <div className="notification-container">
      {notifications.map((n) => (
        <div key={n.id} className={`notification notification-${n.type}`}>
          {n.type === 'success' && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          )}
          {n.type === 'error' && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          <span>{n.message}</span>
        </div>
      ))}
    </div>
  )
}
