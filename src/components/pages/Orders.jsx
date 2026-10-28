import { useEffect, useState } from 'react';
import { Container, Badge, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const statusConfig = {
  Pending: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', icon: '⏳' },
  Confirmed: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6', icon: '✅' },
  Shipped: { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1', icon: '🚚' },
  'Out for Delivery': { bg: '#ede9fe', color: '#5b21b6', dot: '#8b5cf6', icon: '📦' },
  Delivered: { bg: '#dcfce7', color: '#166534', dot: '#16a34a', icon: '✓' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444', icon: '✕' }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const location = useLocation();
  const justPlaced = location.state?.orderNumber;

  const load = () => {
    setLoading(true);
    axios
      .get('https://digital-backend-fv2v.onrender.com/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setOrders(res.data || []))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (justPlaced) {
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await axios.put(
        `https://digital-backend-fv2v.onrender.com/api/orders/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  // ═══════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" style={{ color: '#1e40af' }} />
        <p className="mt-3 text-muted small">Loading your orders...</p>
      </Container>
    );
  }

  // ═══════════════════════════════════════════
  // EMPTY
  // ═══════════════════════════════════════════
  if (orders.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center py-4 py-md-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
          <h4 className="fw-bold mb-2" style={{ color: '#0f172a' }}>
            No Orders Yet
          </h4>
          <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '400px' }}>
            You haven't placed any orders yet. Start shopping and find something you love!
          </p>
          <Link
            to="/"
            className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              color: '#ffffff',
              padding: '0.75rem 2rem',
              borderRadius: '12px',
              fontSize: '0.9rem',
              boxShadow: '0 6px 20px rgba(30, 64, 175, 0.3)'
            }}
          >
            🛍️ Start Shopping
          </Link>
        </div>
      </Container>
    );
  }

  // ═══════════════════════════════════════════
  // MAIN
  // ═══════════════════════════════════════════
  return (
    <div
    style={{
      background: '#f9fafb',
      minHeight: '100vh',
      paddingTop: '2rem',
      paddingBottom: '3rem'
    }}
  >
    <Container fluid className="px-3 px-md-4" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div className="mb-4">
          <span
            className="d-inline-block fw-semibold mb-2"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#3b82f6'
            }}
          >
            Order History
          </span>
          <div className="d-flex align-items-end justify-content-between flex-wrap gap-2">
            <h2
              className="fw-bold mb-0"
              style={{
                color: '#0f172a',
                fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)',
                letterSpacing: '-0.02em'
              }}
            >
              My Orders{' '}
              <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.95rem' }}>
                ({orders.length} {orders.length === 1 ? 'order' : 'orders'})
              </span>
            </h2>
            <Link
              to="/"
              className="text-decoration-none fw-semibold small d-none d-sm-inline-flex align-items-center gap-1"
              style={{ color: '#1e40af' }}
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Success banner */}
        {justPlaced && (
          <Alert
            className="border-0 mb-4 d-flex align-items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
              borderRadius: '14px',
              color: '#166534'
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#16a34a',
                color: '#ffffff',
                fontSize: '1.2rem',
                fontWeight: 700
              }}
            >
              ✓
            </div>
            <div>
              <div className="fw-bold" style={{ fontSize: '0.95rem' }}>
                Order Placed Successfully!
              </div>
              <div className="small" style={{ opacity: 0.9 }}>
                Order No: <strong>{justPlaced}</strong> · Our team will contact you shortly
              </div>
            </div>
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="border-0 small" style={{ borderRadius: '12px' }}>
            ⚠️ {error}
          </Alert>
        )}

        {/* Orders List */}
        <div className="d-flex flex-column gap-3">
          {orders.map(order => {
            const cfg = statusConfig[order.status] || statusConfig.Pending;
            const canCancel = order.status === 'Pending';

            return (
              <div
                key={order._id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease'
                }}
              >
                <div className="p-3 p-md-4">
                  {/* ─────── HEADER ─────── */}
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <span
                          className="fw-semibold text-uppercase"
                          style={{
                            fontSize: '0.62rem',
                            letterSpacing: '0.12em',
                            color: '#64748b'
                          }}
                        >
                          Order
                        </span>
                        <h6
                          className="fw-bold mb-0"
                          style={{
                            color: '#0f172a',
                            fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          #{order.orderNumber}
                        </h6>
                      </div>
                      <div
                        className="d-flex align-items-center gap-2 flex-wrap"
                        style={{ color: '#94a3b8', fontSize: '0.78rem' }}
                      >
                        <span>📅 {new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <span
                      className="fw-semibold d-inline-flex align-items-center gap-2"
                      style={{
                        background: cfg.bg,
                        color: cfg.color,
                        fontSize: '0.72rem',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        letterSpacing: '0.02em',
                        lineHeight: 1
                      }}
                    >
                      <span style={{ fontSize: '0.85rem' }}>{cfg.icon}</span>
                      {order.status}
                    </span>
                  </div>

                  {/* ─────── ITEMS — Clickable ─────── */}
                  <Row className="g-2">
                    {order.items.map((item, idx) => (
                      <Col xs={12} md={6} key={idx}>
                        <Link
                          to={`/product/${item.product}`}
                          className="text-decoration-none"
                          style={{ display: 'block' }}
                        >
                          <div
                            className="d-flex gap-3 align-items-center p-2"
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#1e40af';
                              e.currentTarget.style.background = '#eff6ff';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#e2e8f0';
                              e.currentTarget.style.background = '#f8fafc';
                            }}
                          >
                            {/* Image */}
                            <div
                              className="d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: '56px',
                                height: '56px',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '4px'
                              }}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                            </div>

                            {/* Info */}
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                className="fw-semibold text-truncate"
                                style={{ color: '#0f172a', fontSize: '0.85rem' }}
                              >
                                {item.name}
                              </div>
                              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                Qty: {item.quantity} × ₹{Number(item.price).toLocaleString()}
                              </div>
                              {item.gifts?.length > 0 && (
                                <div
                                  className="d-inline-flex align-items-center gap-1 mt-1"
                                  style={{
                                    background: '#eff6ff',
                                    color: '#1e40af',
                                    fontSize: '0.68rem',
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #bfdbfe'
                                  }}
                                >
                                  🎁 {item.gifts[0].name}
                                </div>
                              )}
                            </div>

                            {/* Arrow */}
                            <div
                              className="flex-shrink-0"
                              style={{ color: '#1e40af', fontSize: '0.9rem', fontWeight: 700 }}
                            >
                              →
                            </div>
                          </div>
                        </Link>
                      </Col>
                    ))}
                  </Row>

                  {/* ─────── FOOTER ─────── */}
                  <div
                    className="d-flex justify-content-between align-items-end flex-wrap gap-3 mt-3 pt-3"
                    style={{ borderTop: '1px dashed #e2e8f0' }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        className="d-flex align-items-start gap-2 mb-1"
                        style={{ color: '#64748b', fontSize: '0.78rem' }}
                      >
                        <span>📍</span>
                        <span>
                          {order.shippingAddress?.fullName}
                          {order.shippingAddress?.city &&
                            `, ${order.shippingAddress.city}`}
                          {order.shippingAddress?.pincode &&
                            ` - ${order.shippingAddress.pincode}`}
                        </span>
                      </div>
                      <div className="d-flex flex-wrap gap-2 mt-1">
                        {/* Payment Method */}
                        <div
                          className="d-inline-flex align-items-center gap-1"
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: '6px'
                          }}
                        >
                          💳 {order.paymentMethod}
                        </div>

                        {/* ✅ Payment Status (Paid/Unpaid) */}
                        <div
                          className="d-inline-flex align-items-center gap-1"
                          style={{
                            background: order.isPaid ? '#dcfce7' : '#fef3c7',
                            color: order.isPaid ? '#166534' : '#92400e',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            border: order.isPaid ? '1px solid #bbf7d0' : '1px solid #fde68a'
                          }}
                        >
                          {order.isPaid ? '✅ Paid' : '⏳ Unpaid'}
                        </div>
                      </div>
                    </div>

                    <div className="text-end ms-auto">
                      <div
                        className="fw-semibold text-uppercase mb-1"
                        style={{
                          fontSize: '0.6rem',
                          letterSpacing: '0.1em',
                          color: '#64748b'
                        }}
                      >
                        Total
                      </div>
                      <div
                        className="fw-bold mb-2"
                        style={{
                          color: '#1e40af',
                          fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
                          letterSpacing: '-0.02em'
                        }}
                      >
                        ₹{Number(order.totalPrice).toLocaleString()}
                      </div>
                      {canCancel && (
                        <Button
                          size="sm"
                          onClick={() => cancelOrder(order._id)}
                          className="fw-semibold border-0 d-inline-flex align-items-center gap-1"
                          style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '0.75rem',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            border: '1px solid #fecaca'
                          }}
                        >
                          ✕ Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue shopping — mobile */}
        <div className="text-center mt-4 d-sm-none">
          <Link
            to="/"
            className="text-decoration-none fw-semibold small"
            style={{ color: '#1e40af' }}
          >
            ← Continue Shopping
          </Link>
        </div>
      </Container>
    </div>
  );
}