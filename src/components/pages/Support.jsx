import { useEffect, useState, useMemo } from 'react';
import {
  Container, Card, Form, Button, Row, Col, Alert,
  Modal, Table, Spinner
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const statusConfig = {
  Open: { bg: '#fef3c7', color: '#92400e', icon: '⏳' },
  Assigned: { bg: '#dbeafe', color: '#1e40af', icon: '👤' },
  'In Progress': { bg: '#e0e7ff', color: '#3730a3', icon: '🔧' },
  Resolved: { bg: '#dcfce7', color: '#166534', icon: '✓' },
  Closed: { bg: '#f1f5f9', color: '#475569', icon: '🔒' },
  Rejected: { bg: '#fee2e2', color: '#991b1b', icon: '✕' }
};

const ISSUE_TYPES = [
  'Networking',
  'Computer Repair',
  'Software Installation',
  'Hardware Issue',
  'Printer Issue',
  'CCTV Installation',
  'AMC Service',
  'Other'
];

export default function Support() {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [searchName, setSearchName] = useState('');

  const emptyForm = {
    issueName: '',
    issueType: 'Networking',
    description: '',
    contactNumber: user?.phone || '',
    address: user?.address || '',
    expectedVisitDate: ''
  };

  const [form, setForm] = useState(emptyForm);

  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    axios
      .get('https://digital-backend-fv2v.onrender.com/api/support/my', { headers })
      .then(r => setTickets(r.data || []))
      .catch(() => setTickets([]));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setForm(f => ({
      ...f,
      contactNumber: f.contactNumber || user?.phone || '',
      address: f.address || user?.address || ''
    }));
  }, [user]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (filterStatus !== 'All' && t.status !== filterStatus) return false;
      if (filterType !== 'All' && t.issueType !== filterType) return false;
      if (
        searchName.trim() &&
        !t.issueName.toLowerCase().includes(searchName.trim().toLowerCase())
      )
        return false;
      if (filterDate) {
        const visit = t.expectedVisitDate
          ? new Date(t.expectedVisitDate).toISOString().split('T')[0]
          : null;
        const created = new Date(t.createdAt).toISOString().split('T')[0];
        if (visit !== filterDate && created !== filterDate) return false;
      }
      return true;
    });
  }, [tickets, filterStatus, filterType, filterDate, searchName]);

  const resetFilters = () => {
    setFilterStatus('All');
    setFilterType('All');
    setFilterDate('');
    setSearchName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://digital-backend-fv2v.onrender.com/api/support', form, { headers });
      setForm({
        ...emptyForm,
        contactNumber: user?.phone || '',
        address: user?.address || ''
      });
      setShowForm(false);
      setMsg('✅ Ticket created!');
      load();
      setTimeout(() => setMsg(''), 5000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (t) => {
    setEditing(t);
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

  const openView = (t) => {
    setViewing(t);
    setShowView(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `https://digital-backend-fv2v.onrender.com/api/support/${editing._id}`,
        form,
        { headers }
      );
      setShowEdit(false);
      setEditing(null);
      setForm({
        ...emptyForm,
        contactNumber: user?.phone || '',
        address: user?.address || ''
      });
      setMsg('✅ Ticket updated');
      load();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await axios.delete(`https://digital-backend-fv2v.onrender.com/api/support/${id}`, {
        headers
      });
      setMsg('✅ Ticket deleted');
      load();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const renderFormFields = () => (
    <>
      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
              Issue Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              required
              value={form.issueName}
              onChange={(e) => setForm({ ...form, issueName: e.target.value })}
              placeholder="e.g., Internet not working"
              style={{
                background: '#f8fafc',
                borderColor: '#e2e8f0',
                borderRadius: '10px',
                fontSize: '0.9rem'
              }}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
              Issue Type <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              required
              value={form.issueType}
              onChange={(e) => setForm({ ...form, issueType: e.target.value })}
              style={{
                background: '#f8fafc',
                borderColor: '#e2e8f0',
                borderRadius: '10px',
                fontSize: '0.9rem'
              }}
            >
              {ISSUE_TYPES.map(t => (
                <option key={t}>{t}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12}>
          <Form.Group>
            <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
              Description <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your issue in detail..."
              style={{
                background: '#f8fafc',
                borderColor: '#e2e8f0',
                borderRadius: '10px',
                fontSize: '0.9rem',
                resize: 'none'
              }}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
              Contact Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="tel"
              required
              maxLength={10}
              value={form.contactNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  contactNumber: e.target.value.replace(/\D/g, '')
                })
              }
              placeholder="10 digit mobile number"
              style={{
                background: '#f8fafc',
                borderColor: '#e2e8f0',
                borderRadius: '10px',
                fontSize: '0.9rem'
              }}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
              Expected Visit Date <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              required
              min={today}
              value={form.expectedVisitDate}
              onChange={(e) =>
                setForm({ ...form, expectedVisitDate: e.target.value })
              }
              style={{
                background: '#f8fafc',
                borderColor: '#e2e8f0',
                borderRadius: '10px',
                fontSize: '0.9rem'
              }}
            />
          </Form.Group>
        </Col>

        <Col xs={12}>
          <Form.Group>
            <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
              Service Address <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Where should we visit?"
              style={{
                background: '#f8fafc',
                borderColor: '#e2e8f0',
                borderRadius: '10px',
                fontSize: '0.9rem',
                resize: 'none'
              }}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  // ✅ Simple detail row
  const DetailRow = ({ icon, label, value, isLink }) => (
    <div className="d-flex align-items-start gap-3 py-2 border-bottom">
      <div style={{ fontSize: '1rem', minWidth: '24px' }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="small text-muted mb-1" style={{ fontSize: '0.72rem' }}>
          {label}
        </div>
        {isLink && value ? (
          <a
            href={value.href}
            className="text-decoration-none fw-semibold"
            style={{ color: '#1e40af', fontSize: '0.88rem' }}
          >
            {value.text}
          </a>
        ) : (
          <div
            style={{
              color: '#0f172a',
              fontSize: '0.88rem',
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
              lineHeight: 1.5
            }}
          >
            {value || '—'}
          </div>
        )}
      </div>
    </div>
  );

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
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
            <div>
              <h2
                className="fw-bold mb-1"
                style={{
                  color: '#0f172a',
                  fontSize: 'clamp(1.4rem, 3.5vw, 1.75rem)',
                  letterSpacing: '-0.02em'
                }}
              >
                🛠️ Support Center
              </h2>
              <p className="text-muted small mb-0">
                Raise & track your service tickets
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="fw-semibold border-0"
              style={{
                background: '#1e40af',
                color: '#ffffff',
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                fontSize: '0.9rem'
              }}
            >
              + New Ticket
            </Button>
          </div>
        </div>

        {msg && (
          <Alert
            variant={msg.startsWith('✅') ? 'success' : 'danger'}
            className="border-0 small"
            style={{ borderRadius: '12px' }}
          >
            {msg}
          </Alert>
        )}

        {/* ═══════════════════════════════════════════
            NEW TICKET MODAL
        ═══════════════════════════════════════════ */}
        <Modal
          show={showForm}
          onHide={() => setShowForm(false)}
          size="lg"
          centered
          contentClassName="border-0"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
              Raise a Support Ticket
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="pt-0">{renderFormFields()}</Modal.Body>
            <Modal.Footer className="border-0">
              <Button
                variant="light"
                onClick={() => setShowForm(false)}
                className="fw-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="fw-semibold border-0"
                style={{ background: '#1e40af', color: '#ffffff' }}
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* EDIT MODAL */}
        <Modal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          size="lg"
          centered
          contentClassName="border-0"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
              Edit Ticket
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEdit}>
            <Modal.Body className="pt-0">{renderFormFields()}</Modal.Body>
            <Modal.Footer className="border-0">
              <Button
                variant="light"
                onClick={() => setShowEdit(false)}
                className="fw-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="fw-semibold border-0"
                style={{ background: '#1e40af', color: '#ffffff' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* ═══════════════════════════════════════════
            VIEW MODAL — SIMPLE
        ═══════════════════════════════════════════ */}
        <Modal
          show={showView}
          onHide={() => setShowView(false)}
          size="lg"
          centered
          contentClassName="border-0"
        >
          {viewing && (
            <>
              <Modal.Header closeButton className="border-0">
                <Modal.Title
                  className="fw-semibold d-flex align-items-center gap-2"
                  style={{ fontSize: '1rem' }}
                >
                  🎫 Ticket #{viewing.ticketNumber}
                </Modal.Title>
              </Modal.Header>

              <Modal.Body className="pt-0">
                {/* Status pill */}
                <div className="mb-3">
                  <span
                    className="fw-semibold d-inline-flex align-items-center gap-1"
                    style={{
                      background:
                        (statusConfig[viewing.status] || statusConfig.Open).bg,
                      color:
                        (statusConfig[viewing.status] || statusConfig.Open)
                          .color,
                      fontSize: '0.75rem',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      lineHeight: 1
                    }}
                  >
                    <span style={{ fontSize: '0.85rem' }}>
                      {(statusConfig[viewing.status] || statusConfig.Open).icon}
                    </span>
                    {viewing.status}
                  </span>
                </div>

                <DetailRow
                  icon="📌"
                  label="Issue"
                  value={viewing.issueName}
                />

                <DetailRow
                  icon="🏷️"
                  label="Type"
                  value={viewing.issueType}
                />

                <DetailRow
                  icon="📝"
                  label="Description"
                  value={viewing.description}
                />

                {/* Contact Number — with fallback */}
                <DetailRow
                  icon="📞"
                  label="Contact Number"
                  value={
                    viewing.contactNumber ||
                    viewing.contact ||
                    viewing.phone ||
                    viewing.user?.phone ||
                    null
                  }
                  isLink={
                    viewing.contactNumber ||
                    viewing.contact ||
                    viewing.phone ||
                    viewing.user?.phone
                      ? {
                          href: `tel:${
                            viewing.contactNumber ||
                            viewing.contact ||
                            viewing.phone ||
                            viewing.user?.phone
                          }`,
                          text: `📞 ${
                            viewing.contactNumber ||
                            viewing.contact ||
                            viewing.phone ||
                            viewing.user?.phone
                          }`
                        }
                      : false
                  }
                />

                <DetailRow
                  icon="📍"
                  label="Address"
                  value={viewing.address}
                />

                <DetailRow
                  icon="📆"
                  label="Expected Visit Date"
                  value={
                    viewing.expectedVisitDate
                      ? new Date(viewing.expectedVisitDate).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }
                        )
                      : null
                  }
                />

                <DetailRow
                  icon="📅"
                  label="Created On"
                  value={new Date(viewing.createdAt).toLocaleString()}
                />

                {/* Assigned Engineer */}
                {viewing.assignedToName ? (
                    <div className="mt-3 p-3" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px' }}>
                      <div className="small fw-semibold mb-2" style={{ color: '#1e40af', fontSize: '0.75rem' }}>
                        👤 Assigned Engineer
                      </div>
                      <div className="fw-semibold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                        {viewing.assignedToName}
                      </div>
                      {(viewing.assignedToPhone || viewing.assignedTo?.phone) && viewing.assignedToPhone !== 'Not provided' ? (
                        <a
                          href={`tel:${viewing.assignedToPhone || viewing.assignedTo?.phone}`}
                          className="d-inline-flex align-items-center gap-1 text-decoration-none mt-1 fw-semibold"
                          style={{ color: '#1e40af', fontSize: '0.85rem' }}
                        >
                          📞 {viewing.assignedToPhone || viewing.assignedTo?.phone}
                        </a>
                      ) : (
                        <div className="text-muted small mt-1" style={{ fontSize: '0.78rem' }}>
                          Contact not available
                        </div>
                      )}
                    </div>
                  ) : (
                  <div
                    className="mt-3 p-3 text-center"
                    style={{
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '10px'
                    }}
                  >
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      Engineer not assigned yet
                    </div>
                  </div>
                )}
              </Modal.Body>

              <Modal.Footer className="border-0">
                <Button
                  onClick={() => setShowView(false)}
                  className="fw-semibold border-0"
                  style={{
                    background: '#1e40af',
                    color: '#ffffff',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '10px',
                    fontSize: '0.9rem'
                  }}
                >
                  Close
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal>

        {/* FILTERS */}
        <Card
          className="border-0 mb-3"
          style={{
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0'
          }}
        >
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <h6
                className="fw-bold mb-0 d-flex align-items-center gap-2"
                style={{ color: '#0f172a', fontSize: '0.95rem' }}
              >
                🔍 Filter Tickets
              </h6>
              <button
                onClick={resetFilters}
                className="border-0 bg-transparent fw-semibold small"
                style={{ color: '#3b82f6', cursor: 'pointer' }}
              >
                Reset Filters
              </button>
            </div>

            <Row className="g-2">
              <Col xs={12} md={3}>
                <Form.Control
                  placeholder="Search issue name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    borderColor: '#e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.85rem'
                  }}
                />
              </Col>

              <Col xs={6} md={3}>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    borderColor: '#e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="All">All Status</option>
                  {Object.keys(statusConfig).map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col xs={6} md={3}>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    borderColor: '#e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="All">All Types</option>
                  {ISSUE_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col xs={12} md={3}>
                <Form.Control
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    borderColor: '#e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.85rem'
                  }}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* TICKETS LIST */}
        <Card
          className="border-0"
          style={{
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0'
          }}
        >
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6
                className="fw-bold mb-0"
                style={{ color: '#0f172a', fontSize: '1.05rem' }}
              >
                My Tickets
              </h6>
              <span
                className="fw-semibold"
                style={{
                  background: '#eff6ff',
                  color: '#1e40af',
                  fontSize: '0.75rem',
                  padding: '4px 12px',
                  borderRadius: '20px'
                }}
              >
                {tickets.length} total
              </span>
            </div>

            {tickets.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>
                  🎫
                </div>
                <p className="text-muted small mb-0">
                  No tickets yet. Raise your first support ticket above.
                </p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  🔍
                </div>
                <p className="text-muted small mb-2">
                  No tickets match your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="border-0 bg-transparent fw-semibold small"
                  style={{ color: '#3b82f6', cursor: 'pointer' }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table
                  hover
                  className="align-middle mb-0"
                  style={{ fontSize: '0.85rem' }}
                >
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {[
                        'Ticket',
                        'Issue',
                        'Type',
                        'Visit',
                        'Status',
                        'Assigned To',
                        'Actions'
                      ].map((h, i) => (
                        <th
                          key={h}
                          className={`border-0 fw-semibold ${
                            i === 2 ? 'd-none d-md-table-cell' : ''
                          } ${i === 3 ? 'd-none d-lg-table-cell' : ''} ${
                            i === 5 ? 'd-none d-md-table-cell' : ''
                          } ${i === 6 ? 'text-end' : ''}`}
                          style={{
                            color: '#64748b',
                            fontSize: '0.7rem',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase'
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(t => {
                      const cfg = statusConfig[t.status] || statusConfig.Open;
                      return (
                        <tr key={t._id}>
                          <td>
                            <div
                              className="fw-semibold"
                              style={{
                                color: '#0f172a',
                                fontSize: '0.82rem'
                              }}
                            >
                              {t.ticketNumber}
                            </div>
                            <div
                              className="small"
                              style={{
                                color: '#94a3b8',
                                fontSize: '0.7rem'
                              }}
                            >
                              {new Date(t.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          <td style={{ maxWidth: '240px' }}>
                            <div
                              className="fw-semibold text-truncate"
                              style={{
                                color: '#0f172a',
                                fontSize: '0.85rem'
                              }}
                            >
                              {t.issueName}
                            </div>
                            <small
                              className="text-muted text-truncate d-block"
                              style={{
                                maxWidth: '220px',
                                fontSize: '0.72rem'
                              }}
                            >
                              {t.description}
                            </small>
                          </td>

                          <td className="d-none d-md-table-cell">
                            <span
                              style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                padding: '3px 10px',
                                borderRadius: '6px'
                              }}
                            >
                              {t.issueType}
                            </span>
                          </td>

                          <td className="d-none d-lg-table-cell">
                            <small
                              style={{ color: '#64748b', fontSize: '0.78rem' }}
                            >
                              {t.expectedVisitDate
                                ? new Date(
                                    t.expectedVisitDate
                                  ).toLocaleDateString()
                                : '—'}
                            </small>
                          </td>

                          <td>
                            <span
                              className="fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                background: cfg.bg,
                                color: cfg.color,
                                fontSize: '0.7rem',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                lineHeight: 1
                              }}
                            >
                              <span style={{ fontSize: '0.8rem' }}>
                                {cfg.icon}
                              </span>
                              {t.status}
                            </span>
                          </td>

                          <td className="d-none d-md-table-cell">
                            {t.assignedToName ? (
                              <div>
                                <div
                                  className="fw-semibold d-flex align-items-center gap-1"
                                  style={{
                                    color: '#0f172a',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  👤 {t.assignedToName}
                                </div>
                                {t.assignedToPhone && t.assignedToPhone !== 'Not provided' ? (
                                  <a
                                    href={`tel:${t.assignedToPhone}`}
                                    className="d-inline-flex align-items-center gap-1 text-decoration-none mt-1"
                                    style={{
                                      color: '#1e40af',
                                      fontSize: '0.72rem',
                                      fontWeight: 600
                                    }}
                                  >
                                    📞 {t.assignedToPhone}
                                  </a>
                                ) : (
                                  <div
                                    className="text-muted small"
                                    style={{ fontSize: '0.7rem' }}
                                  >
                                    — no contact
                                  </div>
                                )}
                              </div>
                            ) : (
                              <small
                                className="text-muted"
                                style={{ fontSize: '0.75rem' }}
                              >
                                Not assigned
                              </small>
                            )}
                          </td>

                          <td className="text-end">
                            <div className="d-inline-flex gap-1">
                              {/* View button — always visible */}
                              <button
                                onClick={() => openView(t)}
                                title="View"
                                className="border-0 d-flex align-items-center justify-content-center"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '8px',
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  border: '1px solid #e2e8f0'
                                }}
                              >
                                👁️
                              </button>

                              {t.status === 'Open' && (
                                <>
                                  <button
                                    onClick={() => openEdit(t)}
                                    title="Edit"
                                    className="border-0 d-flex align-items-center justify-content-center"
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '8px',
                                      background: '#eff6ff',
                                      color: '#1e40af',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      border: '1px solid #bfdbfe'
                                    }}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDelete(t._id)}
                                    title="Delete"
                                    className="border-0 d-flex align-items-center justify-content-center"
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '8px',
                                      background: '#fef2f2',
                                      color: '#dc2626',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      border: '1px solid #fecaca'
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}