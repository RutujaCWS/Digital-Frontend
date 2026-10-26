import { useEffect, useState, useMemo } from 'react';
import {
  Container, Card, Table, Badge, Button, Form,
  Modal, Row, Col, Alert, Spinner, Pagination
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const statusConfig = {
  New: { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626', icon: '🆕' },
  Read: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', icon: '👁️' },
  Replied: { bg: '#dcfce7', color: '#166534', dot: '#16a34a', icon: '✓' },
  Closed: { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af', icon: '🔒' }
};

const ENQUIRY_TYPES = [
  'Laptop / Desktop Enquiry',
  'Product Availability',
  'Computer Repair',
  'Printer Setup / Installation',
  'CCTV Installation',
  'Home Visit / Technical Support',
  'Order / Delivery Issue',
  'Warranty / Service',
  'Other'
];

const ITEMS_PER_PAGE = 5;

// Shared styles
const inputStyle = {
  background: '#ffffff',
  borderColor: '#d1d5db',
  borderRadius: '8px',
  fontSize: '0.9rem'
};

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.4rem'
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

export default function AdminContacts() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, replied: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showView, setShowView] = useState(false);
  const [current, setCurrent] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [msg, setMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (typeFilter) params.append('enquiryType', typeFilter);

    axios
      .get(`https://digital-backend-phi.vercel.app/api/contact?${params}`, { headers })
      .then(r => setMessages(r.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  };

  const loadStats = () => {
    axios
      .get('https://digital-backend-phi.vercel.app/api/contact/stats', { headers })
      .then(r => setStats(r.data || {}))
      .catch(() => {});
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Client-side search filter
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      m =>
        m.fullName?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  // ✅ Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / ITEMS_PER_PAGE));
  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMessages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMessages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchQuery]);

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

  const clearFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter || typeFilter || searchQuery;

  const openView = async (m) => {
    setCurrent(m);
    setAdminNote(m.adminNote || '');
    setShowView(true);

    if (m.status === 'New') {
      try {
        await axios.put(
          `https://digital-backend-phi.vercel.app/api/contact/${m._id}/status`,
          { status: 'Read' },
          { headers }
        );
        load();
        loadStats();
      } catch {}
    }
  };

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      await axios.put(
        `https://digital-backend-phi.vercel.app/api/contact/${current._id}/status`,
        { status: 'Replied', adminNote },
        { headers }
      );
      setMsg('✅ Status updated');
      setShowView(false);
      load();
      loadStats();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (id) => {
    try {
      await axios.put(
        `https://digital-backend-phi.vercel.app/api/contact/${id}/status`,
        { status: 'Closed' },
        { headers }
      );
      load();
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await axios.delete(`https://digital-backend-phi.vercel.app/api/contact/${id}`, { headers });
      setMsg('✅ Message deleted');
      setShowView(false);
      load();
      loadStats();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
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
          <h2
            className="fw-bold mb-1"
            style={{
              color: '#111827',
              fontSize: 'clamp(1.35rem, 3vw, 1.6rem)',
              letterSpacing: '-0.02em'
            }}
          >
            Contact Messages
          </h2>
          <p className="text-muted small mb-0" style={{ color: '#6b7280' }}>
            Manage enquiries from contact form
          </p>
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
          <Col xs={6} lg={2}>
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
                Total
              </div>
              <div
                className="fw-bold"
                style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
              >
                {stats.total || 0}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={2}>
            <div
              className="p-3"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderLeft: '3px solid #dc2626',
                borderRadius: '10px'
              }}
            >
              <div
                className="text-uppercase fw-semibold mb-1"
                style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}
              >
                New
              </div>
              <div
                className="fw-bold"
                style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
              >
                {stats.new || 0}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={2}>
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
                Read
              </div>
              <div
                className="fw-bold"
                style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
              >
                {stats.read || 0}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={2}>
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
                Replied
              </div>
              <div
                className="fw-bold"
                style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
              >
                {stats.replied || 0}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={2}>
            <div
              className="p-3"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderLeft: '3px solid #9ca3af',
                borderRadius: '10px'
              }}
            >
              <div
                className="text-uppercase fw-semibold mb-1"
                style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}
              >
                Closed
              </div>
              <div
                className="fw-bold"
                style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
              >
                {stats.closed || 0}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={2}>
            <div
              className="p-3"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderLeft: '3px solid #3b82f6',
                borderRadius: '10px'
              }}
            >
              <div
                className="text-uppercase fw-semibold mb-1"
                style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}
              >
                Showing
              </div>
              <div
                className="fw-bold"
                style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
              >
                {filteredMessages.length}
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
            <Col xs={12} md={4}>
              <Form.Control
                placeholder="Search name, email or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={inputStyle}
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={inputStyle}
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Read">Read</option>
                <option value="Replied">Replied</option>
                <option value="Closed">Closed</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={inputStyle}
              >
                <option value="">All Enquiry Types</option>
                {ENQUIRY_TYPES.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} md={2} className="text-md-end">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="border-0 bg-transparent fw-semibold small"
                  style={{ color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ✕ Clear Filters
                </button>
              )}
            </Col>
          </Row>
        </div>

        {/* MESSAGES TABLE */}
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
              <p className="mt-3 text-muted small mb-0">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
              <p className="text-muted small mb-0">
                {hasActiveFilters
                  ? 'No messages match your filters.'
                  : 'No messages yet.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="border-0 bg-transparent fw-semibold small mt-2"
                  style={{ color: '#1e40af', cursor: 'pointer' }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="d-none d-md-block">
                <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['#', 'Sender', 'Contact', 'Enquiry', 'Message', 'Status', 'Date', 'Actions'].map(
                        (h, i) => (
                          <th
                            key={h}
                            className={`border-0 fw-semibold ${i === 7 ? 'text-end' : ''}`}
                            style={{
                              color: '#6b7280',
                              fontSize: '0.7rem',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              padding: '0.75rem 1rem'
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMessages.map((m, index) => {
                      const cfg = statusConfig[m.status] || statusConfig.New;
                      const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                      return (
                        <tr key={m._id}>
                          <td style={{ padding: '0.85rem 1rem', color: '#9ca3af' }}>
                            {realIndex + 1}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div
                              className="fw-semibold text-truncate"
                              style={{ color: '#111827', fontSize: '0.88rem', maxWidth: '150px' }}
                            >
                              {m.fullName}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div className="text-truncate" style={{ fontSize: '0.78rem', color: '#374151', maxWidth: '180px' }}>
                              📧 {m.email}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              📞 {m.phone}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="fw-semibold"
                              style={{
                                background: '#eff6ff',
                                color: '#1e40af',
                                fontSize: '0.7rem',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {m.enquiryType}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', maxWidth: '220px' }}>
                            <div
                              className="text-truncate"
                              style={{ color: '#374151', fontSize: '0.78rem' }}
                            >
                              {m.message}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                background: cfg.bg,
                                color: cfg.color,
                                fontSize: '0.7rem',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                lineHeight: 1,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: cfg.dot
                                }}
                              />
                              {m.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                              {new Date(m.createdAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td className="text-end" style={{ padding: '0.85rem 1rem' }}>
                            <div className="d-inline-flex gap-1">
                              <button
                                onClick={() => openView(m)}
                                title="View"
                                className="border-0 d-flex align-items-center justify-content-center"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '6px',
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  border: '1px solid #e2e8f0'
                                }}
                              >
                                👁️
                              </button>
                              {m.status !== 'Closed' && (
                                <button
                                  onClick={() => handleClose(m._id)}
                                  title="Close"
                                  className="border-0 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '6px',
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    border: '1px solid #e5e7eb'
                                  }}
                                >
                                  ✓
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(m._id)}
                                title="Delete"
                                className="border-0 d-flex align-items-center justify-content-center"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '6px',
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  border: '1px solid #fecaca'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Card view */}
              <div className="d-md-none p-2 d-flex flex-column gap-2">
                {paginatedMessages.map((m, index) => {
                  const cfg = statusConfig[m.status] || statusConfig.New;
                  const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                  return (
                    <div
                      key={m._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '0.85rem',
                        borderLeft: `3px solid ${cfg.dot}`
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span
                            className="fw-semibold"
                            style={{
                              background: '#f3f4f6',
                              color: '#374151',
                              fontSize: '0.7rem',
                              padding: '3px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            #{realIndex + 1}
                          </span>
                          <span
                            className="fw-semibold"
                            style={{ color: '#111827', fontSize: '0.9rem' }}
                          >
                            {m.fullName}
                          </span>
                        </div>
                        <span
                          className="fw-semibold d-inline-flex align-items-center gap-1 flex-shrink-0"
                          style={{
                            background: cfg.bg,
                            color: cfg.color,
                            fontSize: '0.65rem',
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
                          {m.status}
                        </span>
                      </div>

                      <div className="d-flex flex-column gap-1 mb-2" style={{ fontSize: '0.78rem' }}>
                        <div className="text-truncate" style={{ color: '#374151' }}>
                          📧 {m.email}
                        </div>
                        <div style={{ color: '#374151' }}>📞 {m.phone}</div>
                      </div>

                      <div className="mb-2">
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#1e40af',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          {m.enquiryType}
                        </span>
                      </div>

                      <div
                        className="mb-2"
                        style={{
                          color: '#6b7280',
                          fontSize: '0.78rem',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {m.message}
                      </div>

                      <div
                        className="d-flex align-items-center justify-content-between gap-2 pt-2"
                        style={{ borderTop: '1px solid #f3f4f6' }}
                      >
                        <small style={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                          {new Date(m.createdAt).toLocaleDateString()}
                        </small>

                        <div className="d-flex gap-1">
                          <button
                            onClick={() => openView(m)}
                            className="border-0 d-flex align-items-center justify-content-center"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              color: '#475569',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            👁️
                          </button>
                          {m.status !== 'Closed' && (
                            <button
                              onClick={() => handleClose(m._id)}
                              className="border-0 d-flex align-items-center justify-content-center"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                background: '#f3f4f6',
                                color: '#374151',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                border: '1px solid #e5e7eb'
                              }}
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="border-0 d-flex align-items-center justify-content-center"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              background: '#fef2f2',
                              color: '#dc2626',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              border: '1px solid #fecaca'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
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
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredMessages.length)}
                    </strong>{' '}
                    of <strong style={{ color: '#111827' }}>{filteredMessages.length}</strong>
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

      {/* VIEW MODAL */}
      <Modal
        show={showView}
        onHide={() => setShowView(false)}
        size="lg"
        centered
        contentClassName="border-0"
        scrollable
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
            Message from {current?.fullName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {current && (
            <>
              {/* Contact + Enquiry info */}
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
                      className="fw-semibold text-uppercase mb-2"
                      style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.1em',
                        color: '#6b7280'
                      }}
                    >
                      📋 Contact Info
                    </div>
                    <div
                      className="fw-semibold mb-2"
                      style={{ color: '#111827', fontSize: '0.9rem' }}
                    >
                      {current.fullName}
                    </div>
                    <div
                      className="d-flex flex-column gap-1"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <a
                        href={`mailto:${current.email}`}
                        className="text-decoration-none"
                        style={{ color: '#1e40af' }}
                      >
                        📧 {current.email}
                      </a>
                      <a
                        href={`tel:${current.phone}`}
                        className="text-decoration-none"
                        style={{ color: '#1e40af' }}
                      >
                        📞 {current.phone}
                      </a>
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
                      className="fw-semibold text-uppercase mb-2"
                      style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.1em',
                        color: '#6b7280'
                      }}
                    >
                      📌 Enquiry Details
                    </div>
                    <div className="d-flex flex-column gap-2" style={{ fontSize: '0.82rem' }}>
                      <div>
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
                          {current.enquiryType}
                        </span>
                      </div>
                      <div>
                        {(() => {
                          const cfg = statusConfig[current.status] || statusConfig.New;
                          return (
                            <span
                              className="fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                background: cfg.bg,
                                color: cfg.color,
                                fontSize: '0.72rem',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                lineHeight: 1
                              }}
                            >
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: cfg.dot
                                }}
                              />
                              {current.status}
                            </span>
                          );
                        })()}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        {new Date(current.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Message */}
              <div
                className="p-3 mb-3"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px'
                }}
              >
                <div
                  className="fw-semibold text-uppercase mb-2"
                  style={{
                    fontSize: '0.62rem',
                    letterSpacing: '0.1em',
                    color: '#6b7280'
                  }}
                >
                  💬 Message
                </div>
                <div
                  style={{
                    color: '#374151',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {current.message}
                </div>
              </div>

              {/* Admin Note */}
              <div>
                <Form.Label style={labelStyle}>
                  📝 Admin Note (internal)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Add internal notes..."
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
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
          <Button
            onClick={handleSaveStatus}
            disabled={current?.status === 'Replied' || saving}
            className="fw-semibold border-0"
            style={primaryBtn}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Saving...
              </>
            ) : current?.status === 'Replied' ? (
              '✅ Already Replied'
            ) : (
              '✓ Mark as Replied'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}