import { useEffect, useState, useMemo } from 'react';
import {
  Container, Card, Table, Badge, Form, Button,
  Modal, Row, Col, Alert, Spinner, Pagination
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const statusConfig = {
  Pending: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', icon: '⏳' },
  Confirmed: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6', icon: '✅' },
  Shipped: { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1', icon: '🚚' },
  'Out for Delivery': { bg: '#ede9fe', color: '#5b21b6', dot: '#8b5cf6', icon: '📦' },
  Delivered: { bg: '#dcfce7', color: '#166534', dot: '#16a34a', icon: '✓' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626', icon: '✕' }
};

const ITEMS_PER_PAGE = 5;

// Shared styles
const inputStyle = {
  background: '#ffffff',
  borderColor: '#d1d5db',
  borderRadius: '8px',
  fontSize: '0.9rem'
};

const primaryBtn = {
  background: '#1e40af',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  padding: '0.5rem 1.1rem',
  fontWeight: 600
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showView, setShowView] = useState(false);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    const url = filter
      ? `https://digital-backend-phi.vercel.app/api/orders?status=${filter}`
      : 'https://digital-backend-phi.vercel.app/api/orders';
    axios
      .get(url, { headers })
      .then(r => setOrders(r.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ✅ Stats
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'Pending').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const cancelled = orders.filter(o => o.status === 'Cancelled').length;
    const revenue = orders
    .filter(o => o.status === 'Delivered' && o.isPaid === true) 
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    return { total, pending, delivered, cancelled, revenue };
  }, [orders]);

  // ✅ Search filter (client-side)
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      o =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  // ✅ Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const openView = (order) => {
    setCurrent(order);
    setShowView(true);
  };

  const updatePaymentStatus = async (id, isPaid) => {
    if (!window.confirm(`Mark this order as ${isPaid ? 'PAID' : 'UNPAID'}?`)) return;
    try {
      await axios.put(
        `https://digital-backend-phi.vercel.app/api/orders/${id}/payment`,
        { isPaid },
        { headers }
      );
      setMsg(`✅ Payment marked as ${isPaid ? 'Paid' : 'Unpaid'}`);
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment');
    }
  };

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Change status to "${status}"?`)) return;
    try {
      await axios.put(
        `https://digital-backend-phi.vercel.app/api/orders/${id}/status`,
        { status },
        { headers }
      );
      setMsg(`✅ Status changed to ${status}`);
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  // Helpers
  const totalItems = (order) =>
    order?.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;

  const hasAnyGift = (order) =>
    order?.items?.some(it => it.gifts && it.gifts.length > 0) || false;

  const totalGifts = (order) =>
    order?.items?.reduce((sum, it) => sum + (it.gifts?.length || 0), 0) || 0;

  const productSummary = (order) => {
    if (!order?.items || order.items.length === 0) return { first: 'N/A', more: 0 };
    const first = order.items[0].name;
    return { first, more: order.items.length - 1 };
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

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
        {/* HEADER */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h2
                className="fw-bold mb-1"
                style={{
                  color: '#111827',
                  fontSize: 'clamp(1.35rem, 3vw, 1.6rem)',
                  letterSpacing: '-0.02em'
                }}
              >
                All Orders
              </h2>
              <p className="text-muted small mb-0" style={{ color: '#6b7280' }}>
                Manage customer orders & update delivery status
              </p>
            </div>
          </div>
        </div>

        {msg && (
          <Alert
            variant="success"
            className="border-0 small"
            style={{ borderRadius: '10px' }}
          >
            {msg}
          </Alert>
        )}

        {/* STATS */}
        <Row className="g-3 mb-4">
          <Col xs={6} lg={3}>
            <div
              className="p-3"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderLeft: '3px solid #1e40af',
                borderRadius: '10px'
              }}
            >
              <div
                className="text-uppercase fw-semibold mb-1"
                style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}
              >
                Total Orders
              </div>
              <div
                className="fw-bold"
                style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
              >
                {stats.total}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div
              className="p-3"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderLeft: '3px solid #f59e0b',
                borderRadius: '10px'
              }}
            >
              <div
                className="text-uppercase fw-semibold mb-1"
                style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}
              >
                Pending
              </div>
              <div
                className="fw-bold"
                style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
              >
                {stats.pending}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div
              className="p-3"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderLeft: '3px solid #16a34a',
                borderRadius: '10px'
              }}
            >
              <div
                className="text-uppercase fw-semibold mb-1"
                style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}
              >
                Delivered
              </div>
              <div
                className="fw-bold"
                style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
              >
                {stats.delivered}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div
              className="p-3"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderLeft: '3px solid #0891b2',
                borderRadius: '10px'
              }}
            >
              <div
                className="text-uppercase fw-semibold mb-1"
                style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}
              >
                Revenue
              </div>
              <div
                className="fw-bold"
                style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
              >
                ₹{stats.revenue.toLocaleString()}
              </div>
            </div>
          </Col>
        </Row>

        {/* FILTERS */}
        <div
          className="mb-3 p-3"
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px'
          }}
        >
          <Row className="g-2 align-items-center">
            <Col xs={12} md={6}>
              <Form.Control
                placeholder="Search by order #, customer name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={inputStyle}
              />
            </Col>
            <Col xs={12} md={6}>
              <Form.Select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={inputStyle}
              >
                <option value="">All Statuses</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <div
            className="mt-2 small"
            style={{ color: '#6b7280', fontSize: '0.78rem' }}
          >
            Showing <strong style={{ color: '#111827' }}>{filteredOrders.length}</strong> of{' '}
            {orders.length} orders
          </div>
        </div>

        {/* ORDERS LIST */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
        >
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: '#1e40af' }} />
              <p className="mt-3 text-muted small mb-0">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
              <p className="text-muted small mb-0">No orders found.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <p className="text-muted small mb-0">
                No orders match your filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="d-none d-lg-block">
                <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Order', 'Customer', 'Products', 'Qty', 'Gifts', 'Total', 'Payment','Pay Status', 'Status', 'Date', 'Actions'].map(
                        (h, i) => (
                          <th
                            key={h}
                            className={`border-0 fw-semibold ${i === 10 ? 'text-end' : ''}`}
                            style={{
                              color: '#6b7280',
                              fontSize: '0.68rem',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              padding: '0.75rem 1rem',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map(o => {
                      const cfg = statusConfig[o.status] || statusConfig.Pending;
                      const { first, more } = productSummary(o);
                      return (
                        <tr key={o._id}>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div
                              className="fw-semibold"
                              style={{ color: '#111827', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                            >
                              {o.orderNumber}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                  color: '#ffffff',
                                  fontSize: '0.7rem'
                                }}
                              >
                                {getInitials(o.user?.name)}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  className="fw-semibold text-truncate"
                                  style={{ color: '#111827', fontSize: '0.82rem', maxWidth: '150px' }}
                                >
                                  {o.user?.name || 'N/A'}
                                </div>
                                <div
                                  className="text-muted text-truncate"
                                  style={{ fontSize: '0.7rem', maxWidth: '150px' }}
                                >
                                  {o.user?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', maxWidth: '200px' }}>
                            <div
                              className="fw-semibold text-truncate"
                              style={{ color: '#111827', fontSize: '0.82rem' }}
                            >
                              {first}
                            </div>
                            {more > 0 && (
                              <div
                                className="text-muted"
                                style={{ fontSize: '0.7rem' }}
                              >
                                +{more} more
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="fw-semibold"
                              style={{
                                background: '#eff6ff',
                                color: '#1e40af',
                                fontSize: '0.72rem',
                                padding: '3px 10px',
                                borderRadius: '6px'
                              }}
                            >
                              {totalItems(o)}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {hasAnyGift(o) ? (
                              <span
                                className="fw-semibold"
                                style={{
                                  background: '#eff6ff',
                                  color: '#1e40af',
                                  fontSize: '0.72rem',
                                  padding: '3px 10px',
                                  borderRadius: '6px'
                                }}
                              >
                                🎁 {totalGifts(o)}
                              </span>
                            ) : (
                              <span className="text-muted" style={{ fontSize: '0.75rem' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="fw-bold d-block"
                              style={{ color: '#111827', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                            >
                              ₹{Number(o.totalPrice).toLocaleString()}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="fw-semibold"
                              style={{
                                background: o.isPaid ? '#dcfce7' : '#fef3c7',
                                color: o.isPaid ? '#166534' : '#92400e',
                                fontSize: '0.68rem',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {o.paymentMethod}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              onClick={() => updatePaymentStatus(o._id, !o.isPaid)}
                              title="Click to toggle Paid/Unpaid"
                              className="fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                background: o.isPaid ? '#dcfce7' : '#fef3c7',
                                color: o.isPaid ? '#166534' : '#92400e',
                                fontSize: '0.68rem',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                border: o.isPaid ? '1px solid #bbf7d0' : '1px solid #fde68a'
                              }}
                            >
                              {o.isPaid ? '✅ Paid' : '⏳ Unpaid'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                background: cfg.bg,
                                color: cfg.color,
                                fontSize: '0.68rem',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                lineHeight: 1,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <span
                                style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '50%',
                                  background: cfg.dot
                                }}
                              />
                              {o.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ color: '#6b7280', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                              {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="text-end" style={{ padding: '0.85rem 1rem' }}>
                            <button
                              onClick={() => openView(o)}
                              title="View"
                              className="border-0 d-inline-flex align-items-center gap-1 fw-semibold"
                              style={{
                                background: '#eff6ff',
                                color: '#1e40af',
                                fontSize: '0.75rem',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                border: '1px solid #bfdbfe'
                              }}
                            >
                              👁️ View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Tablet + Mobile Card view */}
              <div className="d-lg-none p-2 d-flex flex-column gap-2">
                {paginatedOrders.map(o => {
                  const cfg = statusConfig[o.status] || statusConfig.Pending;
                  const { first, more } = productSummary(o);
                  return (
                    <div
                      key={o._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '0.85rem',
                        borderLeft: `3px solid ${cfg.dot}`
                      }}
                    >
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <div
                            className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                              color: '#ffffff',
                              fontSize: '0.78rem'
                            }}
                          >
                            {getInitials(o.user?.name)}
                          </div>
                          <div>
                            <div
                              className="fw-semibold"
                              style={{ color: '#111827', fontSize: '0.88rem' }}
                            >
                              {o.user?.name || 'N/A'}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {o.orderNumber}
                            </div>
                          </div>
                        </div>
                        <span
                          className="fw-semibold d-inline-flex align-items-center gap-1 flex-shrink-0"
                          style={{
                            background: cfg.bg,
                            color: cfg.color,
                            fontSize: '0.65rem',
                            padding: '3px 9px',
                            borderRadius: '20px',
                            lineHeight: 1
                          }}
                        >
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: cfg.dot
                            }}
                          />
                          {o.status}
                        </span>
                      </div>

                      {/* Product summary */}
                      <div
                        className="mb-3 p-2"
                        style={{
                          background: '#f9fafb',
                          border: '1px solid #f3f4f6',
                          borderRadius: '8px'
                        }}
                      >
                        <div
                          className="fw-semibold text-truncate"
                          style={{ color: '#111827', fontSize: '0.82rem' }}
                        >
                          {first}
                        </div>
                        {more > 0 && (
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                            +{more} more item{more > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      {/* Info grid */}
                      <div className="d-flex flex-column gap-2 mb-3" style={{ fontSize: '0.78rem' }}>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Items</span>
                          <span className="fw-semibold" style={{ color: '#111827' }}>
                            {totalItems(o)} qty
                          </span>
                        </div>
                        {hasAnyGift(o) && (
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Gifts</span>
                            <span className="fw-semibold" style={{ color: '#1e40af' }}>
                              🎁 {totalGifts(o)}
                            </span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Payment</span>
                          <span className="fw-semibold" style={{ color: '#111827' }}>
                            {o.paymentMethod}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Date</span>
                          <span style={{ color: '#6b7280' }}>
                            {new Date(o.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        className="d-flex justify-content-between align-items-center gap-2 pt-2"
                        style={{ borderTop: '1px solid #f3f4f6' }}
                      >
                        <div>
                          <div
                            className="text-uppercase fw-semibold"
                            style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#6b7280' }}
                          >
                            Total
                          </div>
                          <div
                            className="fw-bold"
                            style={{ color: '#1e40af', fontSize: '1rem' }}
                          >
                            ₹{Number(o.totalPrice).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => openView(o)}
                          className="border-0 fw-semibold d-inline-flex align-items-center gap-1"
                          style={{
                            background: '#1e40af',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-3 px-md-4 py-3"
                  style={{ borderTop: '1px solid #f3f4f6' }}
                >
                  <div className="small" style={{ color: '#6b7280', fontSize: '0.78rem' }}>
                    Showing{' '}
                    <strong style={{ color: '#111827' }}>
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    </strong>{' '}
                    –{' '}
                    <strong style={{ color: '#111827' }}>
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
                    </strong>{' '}
                    of <strong style={{ color: '#111827' }}>{filteredOrders.length}</strong>
                  </div>

                  <Pagination className="mb-0" size="sm">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    />
                    {pageNumbers[0] > 1 && (
                      <>
                        <Pagination.Item
                          onClick={() => setCurrentPage(1)}
                          active={currentPage === 1}
                        >
                          1
                        </Pagination.Item>
                        {pageNumbers[0] > 2 && <Pagination.Ellipsis disabled />}
                      </>
                    )}
                    {pageNumbers.map(p => (
                      <Pagination.Item
                        key={p}
                        active={p === currentPage}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Pagination.Item>
                    ))}
                    {pageNumbers[pageNumbers.length - 1] < totalPages && (
                      <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                          <Pagination.Ellipsis disabled />
                        )}
                        <Pagination.Item
                          onClick={() => setCurrentPage(totalPages)}
                          active={currentPage === totalPages}
                        >
                          {totalPages}
                        </Pagination.Item>
                      </>
                    )}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </Container>

      {/* ═══════════════════════════════════════════
          ORDER DETAILS MODAL
      ═══════════════════════════════════════════ */}
      <Modal
        show={showView}
        onHide={() => setShowView(false)}
        size="xl"
        centered
        contentClassName="border-0"
        scrollable
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
            Order Details — {current?.orderNumber}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-0" style={{ maxHeight: '75vh' }}>
          {current && (
            <>
              {/* Order + Customer Info */}
              <Row className="g-3 mb-3">
                <Col xs={12} md={6}>
                  <div
                    className="p-3 h-100"
                    style={{
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px'
                    }}
                  >
                    <div
                      className="fw-semibold text-uppercase mb-3"
                      style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: '#6b7280' }}
                    >
                      📋 Order Info
                    </div>
                    <div
                      className="d-flex flex-column gap-2"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Order #</span>
                        <span className="fw-semibold" style={{ color: '#111827' }}>
                          {current.orderNumber}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Date</span>
                        <span style={{ color: '#374151' }}>
                          {new Date(current.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Payment</span>
                        <span
                          className="fw-semibold"
                          style={{
                            background: current.isPaid ? '#dcfce7' : '#fef3c7',
                            color: current.isPaid ? '#166534' : '#92400e',
                            fontSize: '0.7rem',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          {current.paymentMethod}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Status</span>
                        {(() => {
                          const cfg = statusConfig[current.status] || statusConfig.Pending;
                          return (
                            <span
                              className="fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                background: cfg.bg,
                                color: cfg.color,
                                fontSize: '0.7rem',
                                padding: '3px 8px',
                                borderRadius: '20px',
                                lineHeight: 1
                              }}
                            >
                              <span
                                style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '50%',
                                  background: cfg.dot
                                }}
                              />
                              {current.status}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={12} md={6}>
                  <div
                    className="p-3 h-100"
                    style={{
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px'
                    }}
                  >
                    <div
                      className="fw-semibold text-uppercase mb-3"
                      style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: '#6b7280' }}
                    >
                      👤 Customer Info
                    </div>
                    <div
                      className="d-flex flex-column gap-2"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <div>
                        <div className="text-muted small">Name</div>
                        <div className="fw-semibold" style={{ color: '#111827' }}>
                          {current.user?.name || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted small">Email</div>
                        {current.user?.email ? (
                          <a
                            href={`mailto:${current.user.email}`}
                            className="text-decoration-none fw-semibold"
                            style={{ color: '#1e40af' }}
                          >
                            {current.user.email}
                          </a>
                        ) : (
                          <span className="fw-semibold">N/A</span>
                        )}
                      </div>
                      {current.user?.phone && (
                        <div>
                          <div className="text-muted small">Phone</div>
                          <a
                            href={`tel:${current.user.phone}`}
                            className="text-decoration-none fw-semibold"
                            style={{ color: '#1e40af' }}
                          >
                            {current.user.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Shipping */}
              <div
                className="p-3 mb-3"
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px'
                }}
              >
                <div
                  className="fw-semibold text-uppercase mb-2"
                  style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: '#6b7280' }}
                >
                  📍 Shipping Address
                </div>
                <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>
                  <div className="fw-semibold" style={{ color: '#111827' }}>
                    {current.shippingAddress?.fullName}
                  </div>
                  {current.shippingAddress?.phone && (
                    <div>
                      <a
                        href={`tel:${current.shippingAddress.phone}`}
                        className="text-decoration-none"
                        style={{ color: '#1e40af' }}
                      >
                        📞 {current.shippingAddress.phone}
                      </a>
                    </div>
                  )}
                  <div>{current.shippingAddress?.address}</div>
                  <div>
                    {current.shippingAddress?.city}
                    {current.shippingAddress?.state &&
                      `, ${current.shippingAddress.state}`}
                    {current.shippingAddress?.pincode &&
                      ` — ${current.shippingAddress.pincode}`}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div
                className="fw-semibold text-uppercase mb-2"
                style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: '#6b7280' }}
              >
                🛍️ Items ({current.items?.length || 0})
              </div>

              <div className="d-flex flex-column gap-2 mb-3">
                {current.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px'
                    }}
                  >
                    <Row className="g-2 align-items-center">
                      <Col xs={3} md={2}>
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '4px',
                            height: '60px'
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
                      </Col>
                      <Col xs={9} md={6}>
                        <div
                          className="fw-semibold text-truncate"
                          style={{ color: '#111827', fontSize: '0.85rem' }}
                        >
                          {item.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          ₹{Number(item.price).toLocaleString()} × {item.quantity}
                        </div>
                      </Col>
                      <Col xs={12} md={4} className="text-md-end">
                        <div
                          className="fw-bold"
                          style={{ color: '#1e40af', fontSize: '0.95rem' }}
                        >
                          ₹{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                        </div>
                      </Col>
                    </Row>

                    {item.gifts && item.gifts.length > 0 && (
                      <div
                        className="mt-2 pt-2"
                        style={{ borderTop: '1px dashed #e5e7eb' }}
                      >
                        <div
                          className="fw-semibold mb-1"
                          style={{ color: '#1e40af', fontSize: '0.72rem' }}
                        >
                          🎁 Free Gifts:
                        </div>
                        {item.gifts.map((g, gi) => (
                          <div
                            key={gi}
                            className="d-flex align-items-center gap-2"
                            style={{ fontSize: '0.78rem', color: '#374151' }}
                          >
                            <span>🎁</span>
                            <span className="fw-semibold">{g.name}</span>
                            {g.value > 0 && (
                              <span className="text-muted">
                                (Worth ₹{Number(g.value).toLocaleString()})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            
            {/* Price Breakdown */}
              <div
                className="p-3 mb-3"
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px'
                }}
              >
                <div
                  className="fw-semibold text-uppercase mb-3"
                  style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: '#6b7280' }}
                >
                  💰 Price Breakdown
                </div>
                <div className="d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
                  
                  {/* 1. Base Price (Items cha total, GST sodun) */}
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Base Price</span>
                    <span className="fw-semibold" style={{ color: '#111827' }}>
                      ₹{(current.items || []).reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0).toLocaleString()}
                    </span>
                  </div>

                  {/* 2. GST (Base Price madhun kadhlela) */}
                  {(() => {
                    const basePrice = (current.items || []).reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
                    const itemsPriceWithGst = Number(current.itemsPrice) || 0;
                    const gstAmount = itemsPriceWithGst - basePrice;

                    return gstAmount > 0 ? (
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">GST Included</span>
                        <span className="fw-semibold" style={{ color: '#6b7280' }}>
                          + ₹{gstAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ) : null;
                  })()}

                  {/* 3. Subtotal (Base + GST) */}
                  <div className="d-flex justify-content-between mt-1 pt-2" style={{ borderTop: '1px dashed #e5e7eb' }}>
                    <span className="text-muted fw-semibold">Subtotal</span>
                    <span className="fw-semibold" style={{ color: '#111827' }}>
                      ₹{Number(current.itemsPrice || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* 4. Discount / Offer */}
                  {Number(current.discount) > 0 && (
                    <div className="d-flex flex-column gap-1 mt-1">
                      <div className="d-flex justify-content-between text-danger">
                        <span>Discount</span>
                        <span className="fw-semibold">− ₹{Number(current.discount).toLocaleString()}</span>
                      </div>
                      {current.appliedOffers && current.appliedOffers.map((o, i) => (
                        <div key={i} className="small text-muted text-end" style={{ fontSize: '0.72rem' }}>
                          🎉 {o.title} (-₹{o.discount})
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 5. Delivery */}
                  <div className="d-flex justify-content-between mt-2">
                    <span className="text-muted">Delivery</span>
                    {current.deliveryCharge === 0 ? (
                      <span className="fw-semibold" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '3px 10px', borderRadius: '7px' }}>
                        FREE
                      </span>
                    ) : (
                      <span className="fw-semibold" style={{ color: '#111827' }}>
                        + ₹{Number(current.deliveryCharge).toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div
                    style={{
                      borderTop: '1px dashed #e5e7eb',
                      margin: '4px 0'
                    }}
                  />
                  
                  {/* 6. Final Total */}
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold" style={{ color: '#111827', fontSize: '1rem' }}>
                      Total
                    </span>
                    <span
                      className="fw-bold"
                      style={{ color: '#1e40af', fontSize: '1.2rem' }}
                    >
                      ₹{Number(current.totalPrice || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

                            {/* ✅ NEW: Change Payment Status */}
                            <div
                className="p-3 mb-3"
                style={{
                  background: '#059669', // Green color
                  borderRadius: '10px',
                  color: '#ffffff'
                }}
              >
                <div
                  className="fw-semibold text-uppercase mb-3"
                  style={{ fontSize: '0.62rem', letterSpacing: '0.1em', opacity: 0.85 }}
                >
                  💳 Change Payment Status (Currently: {current.isPaid ? '✅ Paid' : '⏳ Unpaid'})
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {[
                    { label: 'Paid', value: true, icon: '✅' },
                    { label: 'Unpaid', value: false, icon: '⏳' }
                  ].map(p => {
                    const isCurrent = current.isPaid === p.value;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        // ✅ Jar current asel tar click nahi hoil, pan konta select ahe te disel
                        onClick={() => !isCurrent && updatePaymentStatus(current._id, p.value)}
                        className="fw-semibold"
                        style={{
                          background: isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
                          color: isCurrent ? '#059669' : '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          fontSize: '0.75rem',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          cursor: isCurrent ? 'default' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span>{p.icon}</span>
                        {p.label}
                        {/* ✅ Fakt current asel tar ch tick mark disel */}
                        {isCurrent && <span> ✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Change */}
              <div
                className="p-3 mb-3"
                style={{
                  background: '#1e40af',
                  borderRadius: '10px',
                  color: '#ffffff'
                }}
              >
                <div
                  className="fw-semibold text-uppercase mb-3"
                  style={{ fontSize: '0.62rem', letterSpacing: '0.1em', opacity: 0.85 }}
                >
                  🔄 Change Order Status
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {STATUSES.map(s => {
                    const isCurrent = current.status === s;
                    const cfg = statusConfig[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateStatus(current._id, s)}
                        disabled={isCurrent}
                        className="fw-semibold"
                        style={{
                          background: isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
                          color: isCurrent ? '#1e40af' : '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          fontSize: '0.75rem',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          cursor: isCurrent ? 'default' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span>{cfg.icon}</span>
                        {s}
                        {isCurrent && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* History */}
              {current.statusHistory && current.statusHistory.length > 0 && (
                <div
                  className="p-3"
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px'
                  }}
                >
                  <div
                    className="fw-semibold text-uppercase mb-3"
                    style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: '#6b7280' }}
                  >
                    📜 Status History
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {current.statusHistory.map((h, i) => {
                      const cfg = statusConfig[h.status] || statusConfig.Pending;
                      return (
                        <div
                          key={i}
                          className="p-2"
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <span
                              className="fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                background: cfg.bg,
                                color: cfg.color,
                                fontSize: '0.68rem',
                                padding: '3px 9px',
                                borderRadius: '20px',
                                lineHeight: 1
                              }}
                            >
                              <span
                                style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '50%',
                                  background: cfg.dot
                                }}
                              />
                              {h.status}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {new Date(h.at).toLocaleString()}
                            </span>
                          </div>
                          {h.changedByName && (
                            <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                              by <strong>{h.changedByName}</strong>
                            </div>
                          )}
                          {h.note && (
                            <div
                              className="mt-1"
                              style={{
                                color: '#374151',
                                fontSize: '0.75rem',
                                fontStyle: 'italic'
                              }}
                            >
                              💬 {h.note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button
            variant="light"
            onClick={() => setShowView(false)}
            className="fw-semibold"
            style={{ fontSize: '0.875rem', borderRadius: '8px' }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}