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

  // 💡 Dynamic position sathi state
  const [coords, setCoords] = useState({ top: 0 });

  const fetchNotifications = useCallback(async () => {
    const userId = user?._id || user?.id;
    if (!userId || !token) return;
  
    try {
      const res = await axios.get(
        `https://digital-backend-phi.vercel.app/api/notifications/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  }, [user?._id, user?.id, token]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // 💡 Click kelyavar button chi height aani position ghene
  const handleToggle = (e) => {
    if (!showDropdown) {
      const rect = e.currentTarget.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8 }); // Button chya khali 8px gap
    }
    setShowDropdown(prev => !prev);
  };

  const handleClick = async (n) => {
    setShowDropdown(false);
  
    let targetPath = n.link;
    if (n.type === 'Order Status') targetPath = '/orders';
    else if (n.type === 'Support Request') {
      if (user?.role === 'admin') targetPath = '/admin/support';
      else if (user?.role === 'backoffice') targetPath = '/backoffice/support';
      else if (user?.role === 'user') targetPath = '/support';
    }
  
    if (targetPath) navigate(targetPath);
  
    try {
      await axios.put(
        `https://digital-backend-phi.vercel.app/api/notifications/${n._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setNotifications((prev) =>
        prev.map((item) => item._id === n._id ? { ...item, isRead: true } : item)
      );
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 💡 Check if mobile
  const isMobile = window.innerWidth < 576;

  return (
    <div className="position-relative d-inline-block">
      
      {showDropdown && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1040 }}
          onClick={() => setShowDropdown(false)}
        />
      )}

      <button
        type="button"
        className="btn position-relative d-flex align-items-center justify-content-center"
        onClick={handleToggle}
        style={{
          width: '46px',
          height: '42px',
          background: showDropdown ? '#e8efff' : '#f8fafc',
          color: '#1e293b',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          zIndex: 1050
        }}
      >
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px', border: '2px solid #fff' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          className={`bg-white border rounded-3 shadow ${isMobile ? 'position-fixed start-50 translate-middle-x' : 'position-absolute end-0'}`}
          style={{
            // 💡 Mobile sathi button chya khali (dynamic), Desktop sathi 100%
            top: isMobile ? `${coords.top}px` : '100%',
            marginTop: isMobile ? '0' : '8px',
            width: 'min(320px, calc(100vw - 24px))', 
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1050,
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}
        >
          <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center sticky-top">
            <strong className="small">🔔 Notifications</strong>
            <button
              type="button"
              className="btn-close"
              style={{ fontSize: '12px' }}
              onClick={() => setShowDropdown(false)}
            ></button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted small">No notifications</div>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                className={`p-3 border-bottom ${!n.isRead ? 'bg-primary bg-opacity-10' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleClick(n)}
              >
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <strong className="small text-dark">{n.type}</strong>
                  {!n.isRead && <span className="badge bg-primary" style={{ fontSize: '9px' }}>New</span>}
                </div>
                <div className="small text-muted" style={{ lineHeight: '1.4' }}>{n.message}</div>
                <div style={{ fontSize: '0.7rem' }} className="text-muted mt-2">
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