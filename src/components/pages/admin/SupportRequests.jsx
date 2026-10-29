import { useEffect, useState, useMemo } from 'react';
import {
  Container, Card, Badge, Form, Table, Button, Modal,
  Row, Col, Alert, Nav, Tab, Spinner
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const statusColors = {
  Open: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', label: 'Open' },
  Assigned: { bg: '#e0f2fe', color: '#0369a1', dot: '#0ea5e9', label: 'Assigned' },
  'In Progress': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6', label: 'In Progress' },
  Resolved: { bg: '#dcfce7', color: '#166534', dot: '#16a34a', label: 'Resolved' },
  Closed: { bg: '#f3f4f6', color: '#4b5563', dot: '#6b7280', label: 'Closed' },
  Rejected: { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626', label: 'Rejected' }
};

const ALL_STATUSES = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];

const ISSUE_TYPES = [
  'Networking', 'Computer Repair', 'Software Installation',
  'Hardware Issue', 'Printer Issue', 'CCTV Installation',
  'AMC Service', 'Other'
];

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

export default function SupportRequests() {
  const [activeTab, setActiveTab] = useState('triage');
  const [triageTickets, setTriageTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAssign, setShowAssign] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [current, setCurrent] = useState(null);

  const [assignForm, setAssignForm] = useState({ networkEngineerId: '', note: '' });
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  // Loaders
  const loadTriage = () => {
    axios.get('https://digital-backend-phi.vercel.app/api/support/triage', { headers })
      .then(r => setTriageTickets(r.data))
      .catch(() => {});
  };

  const loadAll = () => {
    setLoading(true);
    const url = filterStatus !== 'All'
      ? `https://digital-backend-phi.vercel.app/api/support/all?status=${filterStatus}`
      : 'https://digital-backend-phi.vercel.app/api/support/all';
    axios.get(url, { headers })
      .then(r => setAllTickets(r.data))
      .catch(() => setAllTickets([]))
      .finally(() => setLoading(false));
  };

  const loadEngineers = () => {
    axios.get('https://digital-backend-phi.vercel.app/api/staff/meta/network-engineers', { headers })
      .then(r => setEngineers(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadTriage();
    loadEngineers();
    loadAll();
  }, []);

  useEffect(() => { loadAll(); }, [filterStatus]);

  useEffect(() => {
    if (activeTab === 'triage') loadTriage();
    if (activeTab === 'all') loadAll();
  }, [activeTab]);

  // ═══════════════════════════════════════════
  // STATUS UPDATE
  // ═══════════════════════════════════════════
  const openStatus = (t) => {
    setCurrent(t);
    setStatusForm({ status: t.status, note: '' });
    setShowStatus(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `https://digital-backend-phi.vercel.app/api/support/${current._id}/status`,
        statusForm,
        { headers }
      );
      setShowStatus(false);
      setMsg('✅ Status updated successfully');
      loadTriage();
      loadAll();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const quickStatusChange = async (ticket, newStatus) => {
    if (newStatus === ticket.status) return;
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;

    try {
      await axios.put(
        `https://digital-backend-phi.vercel.app/api/support/${ticket._id}/status`,
        { status: newStatus },
        { headers }
      );
      setMsg(`✅ Status changed to ${newStatus}`);
      loadTriage();
      loadAll();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  // ═══════════════════════════════════════════
  // ASSIGN
  // ═══════════════════════════════════════════
  const openAssign = (t) => {
    setCurrent(t);
    setAssignForm({ networkEngineerId: '', note: '' });
    setShowAssign(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `https://digital-backend-phi.vercel.app/api/support/${current._id}/assign`,
        assignForm,
        { headers }
      );
      setShowAssign(false);
      setMsg('✅ Ticket assigned successfully');
      loadTriage();
      loadAll();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════
  // EDIT
  // ═══════════════════════════════════════════
  const openEdit = (t) => {
    setCurrent(t);
    setForm({
      issueName: t.issueName,
      issueType: t.issueType,
      description: t.description,
      contactNumber: t.contactNumber || '',
      address: t.address,
      expectedVisitDate: t.expectedVisitDate
        ? new Date(t.expectedVisitDate).toISOString().split('T')[0]
        : ''
    });
    setShowEdit(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`https://digital-backend-phi.vercel.app/api/support/${current._id}`, form, { headers });
      setShowEdit(false);
      setMsg('✅ Ticket updated');
      loadTriage();
      loadAll();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════
  // DELETE
  // ═══════════════════════════════════════════
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await axios.delete(`https://digital-backend-phi.vercel.app/api/support/${id}`, { headers });
      setMsg('✅ Ticket deleted');
      loadTriage();
      loadAll();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // Stats
  const stats = useMemo(() => {
    const total = allTickets.length;
    const open = allTickets.filter(t => t.status === 'Open').length;
    const inProgress = allTickets.filter(t => t.status === 'In Progress' || t.status === 'Assigned').length;
    const resolved = allTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    return { total, open, inProgress, resolved };
  }, [allTickets]);

  // Filters for All Tickets
  const filteredTickets = useMemo(() => {
    return allTickets.filter(t => {
      if (searchQuery.trim() && 
          !(t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.issueName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.userName?.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }, [allTickets, searchQuery]);

  // ═══════════════════════════════════════════
  // TRIAGE VIEW
  // ═══════════════════════════════════════════
  const renderTriageView = () => (
    <>
      <div className="mb-3 p-3 d-flex justify-content-between align-items-center" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
        <div>
          <h6 className="mb-1 fw-bold" style={{ color: '#111827' }}>🎯 Open Tickets — Assign to Network Engineers</h6>
          <small style={{ color: '#6b7280' }}>{triageTickets.length} ticket(s) waiting</small>
        </div>
        <Badge bg="warning" text="dark" style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px' }}>{triageTickets.length} Open</Badge>
      </div>

      <Row className="g-3">
        {triageTickets.length === 0 ? (
          <Col xs={12}>
            <div className="text-center py-5 px-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
              <p className="text-muted small mb-0">No open tickets right now. You're all caught up!</p>
            </div>
          </Col>
        ) : triageTickets.map(t => {
          const stock = statusColors[t.status] || statusColors['Open'];
          return (
            <Col xs={12} md={6} xl={4} key={t._id}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between mb-2">
                    <strong style={{ color: '#111827' }}>{t.ticketNumber}</strong>
                    <span className="fw-semibold d-inline-flex align-items-center gap-1" style={{ background: stock.bg, color: stock.color, fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', lineHeight: 1 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: stock.dot }} />
                      {stock.label}
                    </span>
                  </div>
                  <h6 className="fw-bold" style={{ color: '#111827', fontSize: '0.95rem' }}>{t.issueName}</h6>
                  <p className="small text-muted mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.description}</p>
                  
                  <div className="p-2 mb-3" style={{ background: '#f9fafb', borderRadius: '8px', fontSize: '0.78rem', color: '#4b5563' }}>
                    <div className="mb-1">👤 <strong>{t.userName}</strong></div>
                    <div className="mb-1">📞 {t.contactNumber || '-'}</div>
                    <div className="mb-1">🏷️ {t.issueType}</div>
                    <div>📅 Visit: {t.expectedVisitDate ? new Date(t.expectedVisitDate).toLocaleDateString() : '-'}</div>
                  </div>

                  <div className="d-flex gap-2 mt-auto">
                    <Button variant="primary" size="sm" className="flex-grow-1 fw-semibold" style={primaryBtn} onClick={() => openAssign(t)}>
                      👤 Assign
                    </Button>
                    <Button variant="outline-primary" size="sm" onClick={() => openEdit(t)} style={{ borderRadius: '8px' }}>✏️</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(t._id)} style={{ borderRadius: '8px' }}>🗑️</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );

  // ═══════════════════════════════════════════
  // ALL TICKETS VIEW
  // ═══════════════════════════════════════════
  const renderAllView = () => (
    <>
      <div className="mb-3 p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
        <Row className="g-2 align-items-center">
          <Col xs={12} md={6}>
            <Form.Control
              placeholder="Search by Ticket#, Issue, User..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={inputStyle}
            />
          </Col>
          <Col xs={12} md={4}>
            <Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
              <option value="All">All Statuses</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </Form.Select>
          </Col>
          <Col xs={12} md={2} className="text-md-end">
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setFilterStatus('All'); }}
              className="border-0 bg-transparent fw-semibold small"
              style={{ color: '#1e40af', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Reset Filters
            </button>
          </Col>
        </Row>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: '#1e40af' }} />
            <p className="mt-3 text-muted small mb-0">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            <p className="text-muted small mb-2">No tickets found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="d-none d-md-block">
              <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Ticket #', 'User / Issue', 'Type', 'Contact', 'Visit Date', 'Status', 'Assigned', 'Actions'].map((h, i) => (
                      <th key={h} className={`border-0 fw-semibold ${i === 7 ? 'text-end' : ''}`} style={{ color: '#6b7280', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.75rem 1rem' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(t => {
                    const stock = statusColors[t.status] || statusColors['Open'];
                    return (
                      <tr key={t._id}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <strong style={{ color: '#111827' }}>{t.ticketNumber}</strong>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div className="fw-semibold text-truncate" style={{ color: '#111827', maxWidth: '200px' }}>{t.issueName}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>👤 {t.userName}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}>
                            {t.issueType}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>📞 {t.contactNumber || '-'}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>{t.expectedVisitDate ? new Date(t.expectedVisitDate).toLocaleDateString() : '-'}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <Form.Select
                            size="sm"
                            value={t.status}
                            onChange={(e) => quickStatusChange(t, e.target.value)}
                            style={{
                              width: '130px',
                              border: 'none',
                              background: stock.bg,
                              color: stock.color,
                              fontWeight: 600,
                              fontSize: '.75rem',
                              cursor: 'pointer',
                              borderRadius: '20px',
                              paddingLeft: '10px'
                            }}
                          >
                            {ALL_STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </Form.Select>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {t.assignedToName ? (
                            <span className="text-success fw-semibold" style={{ fontSize: '0.78rem' }}>👤 {t.assignedToName}</span>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.78rem' }}>—</span>
                          )}
                        </td>
                        <td className="text-end" style={{ padding: '0.85rem 1rem' }}>
                          <div className="d-inline-flex gap-1">
                            {t.status === 'Open' && (
                              <button onClick={() => openAssign(t)} title="Assign" className="border-0 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#eff6ff', color: '#1e40af', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #bfdbfe' }}>👤</button>
                            )}
                            <button onClick={() => openStatus(t)} title="Change Status" className="border-0 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #e2e8f0' }}>🔄</button>
                            <button onClick={() => openEdit(t)} title="Edit" className="border-0 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#eff6ff', color: '#1e40af', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #bfdbfe' }}>✏️</button>
                            <button onClick={() => handleDelete(t._id)} title="Delete" className="border-0 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#fef2f2', color: '#dc2626', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #fecaca' }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="d-md-none p-2 d-flex flex-column gap-2">
              {filteredTickets.map(t => {
                const stock = statusColors[t.status] || statusColors['Open'];
                return (
                  <div key={t._id} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '0.85rem' }}>
                    <div className="d-flex justify-content-between mb-2">
                      <strong style={{ color: '#111827' }}>{t.ticketNumber}</strong>
                      <span className="fw-semibold d-inline-flex align-items-center gap-1" style={{ background: stock.bg, color: stock.color, fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', lineHeight: 1 }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: stock.dot }} />
                        {stock.label}
                      </span>
                    </div>
                    <h6 className="fw-bold mb-1" style={{ color: '#111827', fontSize: '0.9rem' }}>{t.issueName}</h6>
                    <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>👤 {t.userName} · 📞 {t.contactNumber || '-'}</div>
                    
                    <div className="d-flex align-items-center justify-content-between gap-2 pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
                      <div className="d-flex gap-2">
                        <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>{t.issueType}</span>
                        {t.assignedToName && <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>👤 {t.assignedToName}</span>}
                      </div>
                      <div className="d-flex gap-1">
                        {t.status === 'Open' && (
                          <button onClick={() => openAssign(t)} className="border-0 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#eff6ff', color: '#1e40af', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #bfdbfe' }}>👤</button>
                        )}
                        <button onClick={() => openStatus(t)} className="border-0 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #e2e8f0' }}>🔄</button>
                        <button onClick={() => openEdit(t)} className="border-0 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#eff6ff', color: '#1e40af', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #bfdbfe' }}>✏️</button>
                        <button onClick={() => handleDelete(t._id)} className="border-0 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#fef2f2', color: '#dc2626', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #fecaca' }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <Container fluid className="px-3 px-md-4" style={{ maxWidth: '1400px' }}>
        
        {/* HEADER */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: '#111827', fontSize: 'clamp(1.35rem, 3vw, 1.6rem)', letterSpacing: '-0.02em' }}>
                Support Requests
              </h2>
              <p className="text-muted small mb-0" style={{ color: '#6b7280' }}>
                Manage customer tickets, assign engineers & track resolutions
              </p>
            </div>
          </div>
        </div>

        {msg && <Alert variant="success" className="border-0 small" style={{ borderRadius: '10px' }}>{msg}</Alert>}

        {/* STATS */}
        <Row className="g-3 mb-4">
          <Col xs={6} lg={3}>
            <div className="p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: '3px solid #1e40af', borderRadius: '10px' }}>
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>Total Tickets</div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>{stats.total}</div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: '3px solid #f59e0b', borderRadius: '10px' }}>
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>Open</div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>{stats.open}</div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: '3px solid #3b82f6', borderRadius: '10px' }}>
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>In Progress</div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>{stats.inProgress}</div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: '3px solid #16a34a', borderRadius: '10px' }}>
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>Resolved</div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>{stats.resolved}</div>
            </div>
          </Col>
        </Row>

        {/* TABS & CONTENT */}
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav variant="tabs" className="mb-4 border-0" style={{ gap: '8px' }}>
            <Nav.Item>
              <Nav.Link eventKey="triage" className="fw-semibold border-0" style={{ background: activeTab === 'triage' ? '#ffffff' : 'transparent', color: activeTab === 'triage' ? '#1e40af' : '#6b7280', borderRadius: '8px 8px 0 0', padding: '0.75rem 1.25rem' }}>
                🎯 Assign Tickets
                {triageTickets.length > 0 && <Badge bg="warning" text="dark" className="ms-2">{triageTickets.length}</Badge>}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="all" className="fw-semibold border-0" style={{ background: activeTab === 'all' ? '#ffffff' : 'transparent', color: activeTab === 'all' ? '#1e40af' : '#6b7280', borderRadius: '8px 8px 0 0', padding: '0.75rem 1.25rem' }}>
                📋 All Tickets
                <Badge bg="secondary" className="ms-2">{allTickets.length}</Badge>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="triage">{renderTriageView()}</Tab.Pane>
            <Tab.Pane eventKey="all">{renderAllView()}</Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        {/* ═══════════════════════════════════════════
            MODALS
        ═══════════════════════════════════════════ */}

        {/* ASSIGN MODAL */}
        <Modal show={showAssign} onHide={() => setShowAssign(false)} centered contentClassName="border-0">
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>👤 Assign Ticket</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAssign}>
            <Modal.Body className="pt-0">
              {current && (
                <Alert variant="info" className="small py-2" style={{ borderRadius: '8px' }}>
                  <strong>{current.ticketNumber}</strong> — {current.issueName}
                </Alert>
              )}
              <Form.Group className="mb-3">
                <Form.Label style={labelStyle}>Network Engineer <span className="text-danger">*</span></Form.Label>
                <Form.Select required value={assignForm.networkEngineerId} onChange={e => setAssignForm({ ...assignForm, networkEngineerId: e.target.value })} style={inputStyle}>
                  <option value="">-- Select Engineer --</option>
                  {engineers.map(eng => (
                    <option key={eng._id} value={eng._id}>{eng.name} ({eng.employeeId})</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label style={labelStyle}>Note (optional)</Form.Label>
                <Form.Control as="textarea" rows={2} value={assignForm.note} onChange={e => setAssignForm({ ...assignForm, note: e.target.value })} style={{ ...inputStyle, resize: 'none' }} placeholder="Add any specific instructions..." />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="light" onClick={() => setShowAssign(false)} className="fw-semibold" style={{ fontSize: '0.875rem', borderRadius: '8px' }}>Cancel</Button>
              <Button type="submit" disabled={saving} className="fw-semibold border-0" style={primaryBtn}>
                {saving ? <Spinner size="sm" animation="border" /> : 'Assign'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* STATUS UPDATE MODAL */}
        <Modal show={showStatus} onHide={() => setShowStatus(false)} centered contentClassName="border-0">
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>🔄 Change Status</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleStatusUpdate}>
            <Modal.Body className="pt-0">
              {current && (
                <Alert variant="info" className="small py-2" style={{ borderRadius: '8px' }}>
                  <strong>{current.ticketNumber}</strong> — {current.issueName}<br />
                  Current: <Badge bg={statusColors[current.status]?.dot}>{current.status}</Badge>
                </Alert>
              )}
              <Form.Group className="mb-3">
                <Form.Label style={labelStyle}>New Status <span className="text-danger">*</span></Form.Label>
                <Form.Select required value={statusForm.status} onChange={e => setStatusForm({ ...statusForm, status: e.target.value })} style={inputStyle}>
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label style={labelStyle}>Note (optional)</Form.Label>
                <Form.Control as="textarea" rows={3} value={statusForm.note} onChange={e => setStatusForm({ ...statusForm, note: e.target.value })} style={{ ...inputStyle, resize: 'none' }} placeholder="Reason for status change..." />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="light" onClick={() => setShowStatus(false)} className="fw-semibold" style={{ fontSize: '0.875rem', borderRadius: '8px' }}>Cancel</Button>
              <Button type="submit" disabled={saving} className="fw-semibold border-0" style={primaryBtn}>
                {saving ? <Spinner size="sm" animation="border" /> : 'Update Status'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* EDIT MODAL */}
        <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg" centered contentClassName="border-0">
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>✏️ Edit Ticket</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEdit}>
            <Modal.Body className="pt-0">
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>Issue Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control required value={form.issueName || ''} onChange={(e) => setForm({ ...form, issueName: e.target.value })} style={inputStyle} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>Issue Type <span className="text-danger">*</span></Form.Label>
                    <Form.Select required value={form.issueType || ''} onChange={(e) => setForm({ ...form, issueType: e.target.value })} style={inputStyle}>
                      {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>Description <span className="text-danger">*</span></Form.Label>
                    <Form.Control as="textarea" rows={3} required value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: 'none' }} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>Contact Number <span className="text-danger">*</span></Form.Label>
                    <Form.Control required maxLength={10} value={form.contactNumber || ''} onChange={(e) => setForm({ ...form, contactNumber: e.target.value.replace(/\D/g, '') })} style={inputStyle} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>Expected Visit Date <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="date" required min={today} value={form.expectedVisitDate || ''} onChange={(e) => setForm({ ...form, expectedVisitDate: e.target.value })} style={inputStyle} />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>Address <span className="text-danger">*</span></Form.Label>
                    <Form.Control as="textarea" rows={2} required value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} style={{ ...inputStyle, resize: 'none' }} />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="light" onClick={() => setShowEdit(false)} className="fw-semibold" style={{ fontSize: '0.875rem', borderRadius: '8px' }}>Cancel</Button>
              <Button type="submit" disabled={saving} className="fw-semibold border-0" style={primaryBtn}>
                {saving ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

      </Container>
    </div>
  );
}