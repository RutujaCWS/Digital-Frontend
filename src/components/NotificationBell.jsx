import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBell } from 'react-icons/fa';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    const userId = user?._id || user?.id;
  
    if (!userId || !token) {
      console.log('User ID or token missing:', { userId, hasToken: !!token });
      return;
    }
  
    try {
      const res = await axios.get(
        `https://digital-backend-phi.vercel.app/api/notifications/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      console.log('Logged-in user ID:', userId);
      console.log('Fetched notifications:', res.data);
  
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(
        'Notification fetch error:',
        err.response?.status,
        err.response?.data || err.message
      );
    }
  }, [user?._id, user?.id, token]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  
  const handleClick = async (n) => {
    setShowDropdown(false);
  
    let targetPath = n.link;
  
    // १. ऑर्डर स्टेटससाठी
    if (n.type === 'Order Status') {
      targetPath = '/orders';
    } 
    // २. सपोर्ट रिक्वेस्टसाठी रोल नुसार रिडायरेक्ट
    
else if (n.type === 'Support Request') {
  if (user?.role === 'admin') {
    targetPath = '/admin/support';
  } else if (user?.role === 'backoffice') {
    targetPath = '/backoffice/support';
  } else if (user?.role === 'user') {
    targetPath = '/support';
  }
}

  
    console.log('Clicked notification:', n);
    console.log('Redirecting to:', targetPath);
  
    // Navigate even if marking the notification as read fails
    if (targetPath) {
      navigate(targetPath);
    }
  
    try {
      await axios.put(
        `https://digital-backend-phi.vercel.app/api/notifications/${n._id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === n._id
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (err) {
      console.error(
        'Mark notification as read failed:',
        err.response?.data || err.message
      );
    }
  };


  // if (!user || !['admin', 'backoffice'].includes(user.role)) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="position-relative">
      <button
  type="button"
  className="btn position-relative d-flex align-items-center justify-content-center"
  onClick={() => setShowDropdown(prev => !prev)}
  aria-label="Notifications"
  title="Notifications"
  style={{
    width: '46px',
    height: '42px',
    background: showDropdown ? '#e8efff' : '#f8fafc',
    color: '#1e293b',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: showDropdown
      ? '0 3px 10px rgba(37, 99, 235, 0.12)'
      : '0 1px 3px rgba(15, 23, 42, 0.06)',
    transition: 'all 0.2s ease'
  }}
>
  <FaBell size={18} />

  {unreadCount > 0 && (
    <span
      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
      style={{
        fontSize: '10px',
        minWidth: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #ffffff',
        padding: '0 4px'
      }}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )}
</button>

      {showDropdown && (
        <div
        className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow"
        style={{
          width: 'min(350px, calc(100vw - 24px))',
          maxHeight: '450px',
          overflowY: 'auto',
          zIndex: 1100,
          borderColor: '#e2e8f0',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.14)'
        }}
      >
          <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
  <strong>🔔 Notifications</strong>

  <button
    type="button"
    className="btn btn-sm btn-light border-0"
    onClick={() => setShowDropdown(false)}
    aria-label="Close notifications"
    title="Close"
  >
    ✕
  </button>
</div>

          {notifications.length === 0 ? (
            <div className="p-3 text-center text-muted small">No notifications</div>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                className={`p-3 border-bottom ${!n.isRead ? 'bg-primary bg-opacity-10' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleClick(n)}
              >
                <div className="d-flex justify-content-between">
                  <strong className="small">{n.type}</strong>
                  {!n.isRead && <span className="badge bg-primary">New</span>}
                </div>
                <div className="small text-muted">{n.message}</div>
                <div style={{ fontSize: '0.7rem' }} className="text-muted mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}