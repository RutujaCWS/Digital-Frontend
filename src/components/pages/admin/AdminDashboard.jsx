import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    delivered: 0,
    revenue: 0
  });
  const [support, setSupport] = useState({
    open: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0
  });
  const [staff, setStaff] = useState({
    admin: 0,
    backoffice: 0,
    network: 0
  });
  const [offers, setOffers] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // ✅ FIX: useEffect madhe wrap kela — infinite loop thambvla
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      axios
        .get('https://digitalworldkopargaonbackend.vercel.app/api/orders/admin/stats', { headers })
        .then(r => setStats(r.data || {})),
      axios
        .get('https://digitalworldkopargaonbackend.vercel.app/api/support/admin/stats', { headers })
        .then(r => setSupport(r.data || {})),
      axios
        .get('https://digitalworldkopargaonbackend.vercel.app/api/staff/meta/stats', { headers })
        .then(r => setStaff(r.data || {})),
      axios
        .get('https://digitalworldkopargaonbackend.vercel.app/api/special-offers', { headers })
        .then(r => {
          const list = r.data || [];
          const now = new Date();
          let active = 0, scheduled = 0, expired = 0;
          list.forEach(o => {
            const start = new Date(o.startDate);
            const end = new Date(o.endDate);
            if (!o.isActive) return;
            if (now < start) scheduled++;
            else if (now > end) expired++;
            else active++;
          });
          setOffers({
            total: list.length,
            active,
            scheduled,
            expired
          });
        })
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div
        style={{
          background: '#f8fafc',
          minHeight: '100vh',
          paddingTop: '4rem'
        }}
      >
        <Container className="text-center">
          <Spinner animation="border" style={{ color: '#1e40af' }} />
          <p className="mt-3 text-muted small">Loading dashboard...</p>
        </Container>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#f8fafc',
        minHeight: '100vh',
        paddingTop: '2rem',
        paddingBottom: '3rem'
      }}
    >
      <Container fluid className="px-3 px-md-4" style={{ maxWidth: '1400px' }}>
        {/* HEADER */}
        <div className="mb-4">
          <h2
            className="fw-bold mb-1"
            style={{
              color: '#0f172a',
              fontSize: 'clamp(1.4rem, 3.5vw, 1.75rem)',
              letterSpacing: '-0.02em'
            }}
          >
            Admin Dashboard
          </h2>
          <p className="text-muted small mb-0">
            Overview of orders, support tickets & management
          </p>
        </div>

        {/* ORDERS OVERVIEW */}
        <Card
          className="border-0 mb-3"
          style={{
            borderRadius: '14px',
            background: '#ffffff',
            border: '1px solid #e2e8f0'
          }}
        >
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6
                className="fw-bold mb-0"
                style={{ color: '#0f172a', fontSize: '0.95rem' }}
              >
                Orders Overview
              </h6>
              <Link
                to="/admin/orders"
                className="text-decoration-none fw-semibold small"
                style={{ color: '#1e40af' }}
              >
                View All →
              </Link>
            </div>

            <Row className="g-3">
              <Col xs={6} lg={3}>
                <div className="p-3" style={{ borderLeft: '3px solid #1e40af' }}>
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    Total Orders
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      color: '#0f172a',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    {Number(stats.totalOrders || 0).toLocaleString()}
                  </div>
                </div>
              </Col>

              <Col xs={6} lg={3}>
                <div className="p-3" style={{ borderLeft: '3px solid #d97706' }}>
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    Pending Orders
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      color: '#0f172a',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    {Number(stats.pending || 0).toLocaleString()}
                  </div>
                </div>
              </Col>

              <Col xs={6} lg={3}>
                <div className="p-3" style={{ borderLeft: '3px solid #16a34a' }}>
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    Delivered
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      color: '#0f172a',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    {Number(stats.delivered || 0).toLocaleString()}
                  </div>
                </div>
              </Col>

              <Col xs={6} lg={3}>
                <div className="p-3" style={{ borderLeft: '3px solid #0891b2' }}>
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    Revenue
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      color: '#0f172a',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    ₹{Number(stats.revenue || 0).toLocaleString()}
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SUPPORT TICKETS */}
        <Card
          className="border-0 mb-3"
          style={{
            borderRadius: '14px',
            background: '#ffffff',
            border: '1px solid #e2e8f0'
          }}
        >
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6
                className="fw-bold mb-0"
                style={{ color: '#0f172a', fontSize: '0.95rem' }}
              >
                Support Tickets
              </h6>
              <Link
                to="/admin/support"
                className="text-decoration-none fw-semibold small"
                style={{ color: '#1e40af' }}
              >
                View All →
              </Link>
            </div>

            <Row className="g-3">
              <Col xs={6} lg={3}>
                <div className="p-3" style={{ borderLeft: '3px solid #dc2626' }}>
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    Open Tickets
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      color: '#0f172a',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    {Number(support.open || 0).toLocaleString()}
                  </div>
                </div>
              </Col>

              <Col xs={6} lg={3}>
                <div className="p-3" style={{ borderLeft: '3px solid #3b82f6' }}>
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    Assigned
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      color: '#0f172a',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    {Number(support.assigned || 0).toLocaleString()}
                  </div>
                </div>
              </Col>

              <Col xs={6} lg={3}>
                <div className="p-3" style={{ borderLeft: '3px solid #6366f1' }}>
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    In Progress
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      color: '#0f172a',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    {Number(support.inProgress || 0).toLocaleString()}
                  </div>
                </div>
              </Col>

              <Col xs={6} lg={3}>
                <div className="p-3" style={{ borderLeft: '3px solid #16a34a' }}>
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    Resolved
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      color: '#0f172a',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    {Number(support.resolved || 0).toLocaleString()}
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* STAFF OVERVIEW */}
        <Card
          className="border-0 mb-3"
          style={{
            borderRadius: '14px',
            background: '#ffffff',
            border: '1px solid #e2e8f0'
          }}
        >
          <Card.Body className="p-3 p-md-4">
            <h6
              className="fw-bold mb-3"
              style={{ color: '#0f172a', fontSize: '0.95rem' }}
            >
              Staff Overview
            </h6>

            <Row className="g-3">
              <Col xs={12} md={4}>
                <div
                  className="p-3"
                  style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    Back Office
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      color: '#0f172a',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    {Number(staff.backoffice || 0).toLocaleString()}
                  </div>
                  <div
                    className="small"
                    style={{ color: '#94a3b8', fontSize: '0.72rem' }}
                  >
                    Order & admin support
                  </div>
                </div>
              </Col>

              <Col xs={12} md={4}>
                <div
                  className="p-3"
                  style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    Network Engineers
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      color: '#0f172a',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    {Number(staff.network || 0).toLocaleString()}
                  </div>
                  <div
                    className="small"
                    style={{ color: '#94a3b8', fontSize: '0.72rem' }}
                  >
                    Field service team
                  </div>
                </div>
              </Col>

              <Col xs={12} md={4}>
                <div
                  className="p-3"
                  style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    Admins
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      color: '#0f172a',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    {Number(staff.admin || 0).toLocaleString()}
                  </div>
                  <div
                    className="small"
                    style={{ color: '#94a3b8', fontSize: '0.72rem' }}
                  >
                    System administrators
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* MANAGEMENT */}
        <Card
          className="border-0"
          style={{
            borderRadius: '14px',
            background: '#ffffff',
            border: '1px solid #e2e8f0'
          }}
        >
          <Card.Body className="p-3 p-md-4">
            <h6
              className="fw-bold mb-3"
              style={{ color: '#0f172a', fontSize: '0.95rem' }}
            >
              Management
            </h6>

            <Row className="g-3">
              {[
                {
                  to: '/admin/site-settings',
                  title: 'Site Settings',
                  desc: 'Company info, About, Contact'
                },
                {
                  to: '/admin/whatsapp',                          
                  title: 'WhatsApp',                           
                  desc: 'Connect number & auto-send orders'       
                },
                {
                  to: '/admin/staff',
                  title: 'Staff',
                  desc: 'Manage staff & roles'
                },
                {
                  to: '/admin/offers',
                  title: '🎉 Special Offers',
                  desc: 'Create sale events & discounts'
                },
                {
                  to: '/admin/categories',
                  title: 'Categories',
                  desc: 'Homepage category strip'
                },
                {
                  to: '/admin/products',
                  title: 'Products',
                  desc: 'Add, edit & manage products'
                },
                {
                  to: '/admin/brands',
                  title: 'Brands',
                  desc: 'Authorized dealer section'
                },
                {
                  to: '/admin/contacts',
                  title: 'Contact Messages',
                  desc: 'Enquiries from contact form'
                },
                {
                  to: '/admin/gallery',
                  title: 'Gallery',
                  desc: 'Manage photos & videos'
                },
                {
                  to: '/admin/reviews',
                  title: 'Reviews',
                  desc: 'Approve customer reviews'
                },
                {
                  to: '/admin/reports',
                  title: '📊 Reports & Profit',
                  desc: 'Monthly revenue & profit tracking'
                },
                {
                  to: '/admin/system',
                  title: 'System',
                  desc: 'Health & logs'
                }
              ].map(m => (
                <Col xs={12} sm={6} lg={4} xl={3} key={m.to}>
                  <Link
                    to={m.to}
                    className="d-block text-decoration-none h-100"
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <div
                      className="fw-semibold mb-1"
                      style={{ color: '#0f172a', fontSize: '0.9rem' }}
                    >
                      {m.title}
                    </div>
                    <div
                      className="small"
                      style={{
                        color: '#64748b',
                        fontSize: '0.75rem',
                        lineHeight: 1.5
                      }}
                    >
                      {m.desc}
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}