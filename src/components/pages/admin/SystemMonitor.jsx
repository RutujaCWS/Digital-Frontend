import { useEffect, useState, useMemo } from 'react';
import {
  Container, Card, Row, Col, Table, Badge, Spinner,
  Form, Pagination
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const ITEMS_PER_PAGE = 10;

// Action badge colors
const actionConfig = {
  LOGIN: { bg: '#dbeafe', color: '#1e40af' },
  LOGOUT: { bg: '#f3f4f6', color: '#6b7280' },
  CREATE: { bg: '#dcfce7', color: '#166534' },
  UPDATE: { bg: '#fef3c7', color: '#92400e' },
  DELETE: { bg: '#fee2e2', color: '#991b1b' },
  VIEW: { bg: '#e0e7ff', color: '#3730a3' }
};

const roleConfig = {
  admin: { bg: '#fee2e2', color: '#991b1b' },
  backoffice: { bg: '#dbeafe', color: '#1e40af' },
  network: { bg: '#e0e7ff', color: '#3730a3' },
  user: { bg: '#f3f4f6', color: '#6b7280' }
};

export default function SystemMonitor() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Log filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      axios
        .get('https://digital-backend-phi.vercel.app/api/system/health', { headers })
        .then(r => setHealth(r.data)),
      axios
        .get('https://digital-backend-phi.vercel.app/api/system/stats', { headers })
        .then(r => setStats(r.data)),
      axios
        .get('https://digital-backend-phi.vercel.app/api/system/logs?limit=100', { headers })
        .then(r => setLogs(r.data || []))
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (actionFilter !== 'All' && l.action !== actionFilter) return false;
      if (
        searchQuery.trim() &&
        !(
          l.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.resource?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.action?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
        return false;
      return true;
    });
  }, [logs, searchQuery, actionFilter]);

  // ✅ Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, actionFilter]);

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

  const uniqueActions = useMemo(() => {
    const set = new Set(logs.map(l => l.action).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [logs]);

  const clearFilters = () => {
    setSearchQuery('');
    setActionFilter('All');
  };

  const hasActiveFilters = searchQuery || actionFilter !== 'All';

  if (loading) {
    return (
      <div style={{ background: '#f9fafb', minHeight: '100vh', paddingTop: '4rem' }}>
        <Container className="text-center">
          <Spinner animation="border" style={{ color: '#1e40af' }} />
          <p className="mt-3 text-muted small">Loading system monitor...</p>
        </Container>
      </div>
    );
  }

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
            System Monitor
          </h2>
          <p className="text-muted small mb-0" style={{ color: '#6b7280' }}>
            Server health, database status & activity logs
          </p>
        </div>

        {/* ═══════════════════════════════════════════
            SERVER HEALTH
        ═══════════════════════════════════════════ */}
        {health && (
          <div className="mb-4">
            <div
              className="fw-semibold text-uppercase mb-3"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                color: '#6b7280'
              }}
            >
              Server Health
            </div>

            <Row className="g-3">
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
                    Uptime
                  </div>
                  <div
                    className="fw-bold"
                    style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
                  >
                    {(health.server.uptime / 3600).toFixed(1)} hrs
                  </div>
                </div>
              </Col>
              <Col xs={6} lg={3}>
                <div
                  className="p-3"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderLeft: '3px solid #7c3aed',
                    borderRadius: '10px'
                  }}
                >
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}
                  >
                    Platform
                  </div>
                  <div
                    className="fw-bold text-truncate"
                    style={{ color: '#111827', fontSize: 'clamp(1rem, 2vw, 1.2rem)', lineHeight: 1.2 }}
                  >
                    {health.server.platform}
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
                    CPU Cores
                  </div>
                  <div
                    className="fw-bold"
                    style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
                  >
                    {health.server.cpuCount}
                  </div>
                </div>
              </Col>
              <Col xs={6} lg={3}>
                <div
                  className="p-3"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderLeft: `3px solid ${
                      health.database.status === 'connected' ? '#16a34a' : '#dc2626'
                    }`,
                    borderRadius: '10px'
                  }}
                >
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}
                  >
                    Database
                  </div>
                  <div className="mt-1">
                    <span
                      className="fw-semibold d-inline-flex align-items-center gap-1"
                      style={{
                        background: health.database.status === 'connected' ? '#dcfce7' : '#fee2e2',
                        color: health.database.status === 'connected' ? '#166534' : '#991b1b',
                        fontSize: '0.75rem',
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
                          background: health.database.status === 'connected' ? '#16a34a' : '#dc2626'
                        }}
                      />
                      {health.database.status}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            DATA STATS
        ═══════════════════════════════════════════ */}
        {stats && (
          <div className="mb-4">
            <div
              className="fw-semibold text-uppercase mb-3"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                color: '#6b7280'
              }}
            >
              Data Overview
            </div>

            <Row className="g-3">
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
                    Users
                  </div>
                  <div
                    className="fw-bold"
                    style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
                  >
                    {stats.users || 0}
                  </div>
                </div>
              </Col>
              <Col xs={6} lg={3}>
                <div
                  className="p-3"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderLeft: '3px solid #7c3aed',
                    borderRadius: '10px'
                  }}
                >
                  <div
                    className="text-uppercase fw-semibold mb-1"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}
                  >
                    Staff
                  </div>
                  <div
                    className="fw-bold"
                    style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
                  >
                    {stats.staff || 0}
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
                    Products
                  </div>
                  <div
                    className="fw-bold"
                    style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
                  >
                    {stats.products || 0}
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
                    Orders
                  </div>
                  <div
                    className="fw-bold"
                    style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}
                  >
                    {stats.orders || 0}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            RECENT ACTIVITY
        ═══════════════════════════════════════════ */}
        <div className="mb-3">
          <div
            className="fw-semibold text-uppercase mb-3"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              color: '#6b7280'
            }}
          >
            Recent Activity
          </div>

          {/* Filters */}
          <div
            className="mb-3 p-3"
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px'
            }}
          >
            <Row className="g-2 align-items-center">
              <Col xs={12} md={7}>
                <Form.Control
                  placeholder="Search by user, action or resource..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: '#ffffff',
                    borderColor: '#d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                />
              </Col>
              <Col xs={8} md={3}>
                <Form.Select
                  value={actionFilter}
                  onChange={e => setActionFilter(e.target.value)}
                  style={{
                    background: '#ffffff',
                    borderColor: '#d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                >
                  {uniqueActions.map(a => (
                    <option key={a} value={a}>
                      {a === 'All' ? 'All Actions' : a}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={4} md={2} className="text-md-end">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="border-0 bg-transparent fw-semibold small"
                    style={{ color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    ✕ Clear
                  </button>
                )}
              </Col>
            </Row>

            <div
              className="mt-2 small"
              style={{ color: '#6b7280', fontSize: '0.78rem' }}
            >
              Showing{' '}
              <strong style={{ color: '#111827' }}>{filteredLogs.length}</strong> of{' '}
              {logs.length} logs
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
        >
          {logs.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
              <p className="text-muted small mb-0">No activity logs yet.</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <p className="text-muted small mb-2">No logs match your filters.</p>
              <button
                onClick={clearFilters}
                className="border-0 bg-transparent fw-semibold small"
                style={{ color: '#1e40af', cursor: 'pointer' }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="d-none d-md-block">
                <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['#', 'User', 'Action', 'Resource', 'Time'].map((h, i) => (
                        <th
                          key={h}
                          className={`border-0 fw-semibold ${i === 4 ? 'text-end' : ''}`}
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
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((l, index) => {
                      const actCfg = actionConfig[l.action?.toUpperCase()] || {
                        bg: '#eff6ff',
                        color: '#1e40af'
                      };
                      const roleCfg = roleConfig[l.role] || roleConfig.user;
                      const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;

                      return (
                        <tr key={l._id}>
                          <td style={{ padding: '0.85rem 1rem', color: '#9ca3af' }}>
                            {realIndex + 1}
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
                                {l.userName?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  className="fw-semibold text-truncate"
                                  style={{ color: '#111827', fontSize: '0.85rem' }}
                                >
                                  {l.userName || 'Unknown'}
                                </div>
                                <span
                                  className="fw-semibold"
                                  style={{
                                    background: roleCfg.bg,
                                    color: roleCfg.color,
                                    fontSize: '0.62rem',
                                    padding: '2px 8px',
                                    borderRadius: '20px',
                                    textTransform: 'capitalize'
                                  }}
                                >
                                  {l.role || 'user'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="fw-semibold"
                              style={{
                                background: actCfg.bg,
                                color: actCfg.color,
                                fontSize: '0.7rem',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {l.action || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="text-truncate d-inline-block"
                              style={{
                                color: '#374151',
                                fontSize: '0.82rem',
                                maxWidth: '220px'
                              }}
                            >
                              {l.resource || '—'}
                            </span>
                          </td>
                          <td className="text-end" style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ color: '#6b7280', fontSize: '0.78rem' }}>
                              {new Date(l.createdAt).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Card view */}
              <div className="d-md-none p-2 d-flex flex-column gap-2">
                {paginatedLogs.map((l, index) => {
                  const actCfg = actionConfig[l.action?.toUpperCase()] || {
                    bg: '#eff6ff',
                    color: '#1e40af'
                  };
                  const roleCfg = roleConfig[l.role] || roleConfig.user;
                  const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;

                  return (
                    <div
                      key={l._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '0.85rem'
                      }}
                    >
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div
                          className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            color: '#ffffff',
                            fontSize: '0.85rem'
                          }}
                        >
                          {l.userName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            className="fw-semibold text-truncate"
                            style={{ color: '#111827', fontSize: '0.9rem' }}
                          >
                            {l.userName || 'Unknown'}
                          </div>
                          <span
                            className="fw-semibold"
                            style={{
                              background: roleCfg.bg,
                              color: roleCfg.color,
                              fontSize: '0.62rem',
                              padding: '2px 8px',
                              borderRadius: '20px',
                              textTransform: 'capitalize'
                            }}
                          >
                            {l.role || 'user'}
                          </span>
                        </div>
                        <span
                          className="fw-semibold flex-shrink-0"
                          style={{
                            background: actCfg.bg,
                            color: actCfg.color,
                            fontSize: '0.68rem',
                            padding: '3px 10px',
                            borderRadius: '6px'
                          }}
                        >
                          {l.action || '—'}
                        </span>
                      </div>

                      <div
                        className="d-flex align-items-center justify-content-between gap-2 pt-2"
                        style={{ borderTop: '1px solid #f3f4f6' }}
                      >
                        <span
                          className="text-truncate"
                          style={{
                            color: '#374151',
                            fontSize: '0.78rem',
                            maxWidth: '200px'
                          }}
                        >
                          {l.resource || 'No resource'}
                        </span>
                        <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>
                          {new Date(l.createdAt).toLocaleDateString()}
                        </span>
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
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)}
                    </strong>{' '}
                    of <strong style={{ color: '#111827' }}>{filteredLogs.length}</strong>
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
    </div>
  );
}