import { useEffect, useState, useMemo } from 'react';
import {
  Container, Card, Button, Table, Modal, Form,
  Row, Col, Alert, Spinner, Badge
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'backoffice',
  phone: '',
  department: ''
};

const roleConfig = {
  admin: { bg: '#fee2e2', color: '#991b1b', label: 'Admin', icon: '👑' },
  backoffice: { bg: '#dbeafe', color: '#1e40af', label: 'Back Office', icon: '📦' },
  network: { bg: '#e0e7ff', color: '#3730a3', label: 'Network', icon: '🖥️' }
};

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

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({});

  // Filters
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    axios
      .get('https://digital-backend-phi.vercel.app/api/staff', { headers })
      .then(r => setStaff(r.data || []))
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered list
  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      if (filterRole !== 'All' && s.role !== filterRole) return false;
      if (filterStatus === 'Active' && !s.isActive) return false;
      if (filterStatus === 'Disabled' && s.isActive) return false;
      if (
        searchQuery.trim() &&
        !(
          s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
        return false;
      return true;
    });
  }, [staff, filterRole, filterStatus, searchQuery]);

  const resetFilters = () => {
    setFilterRole('All');
    setFilterStatus('All');
    setSearchQuery('');
  };

  // ═══════════════════════════════════════════
  // ADD STAFF
  // ═══════════════════════════════════════════
  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post(
        'https://digital-backend-phi.vercel.app/api/staff',
        form,
        { headers }
      );
      setMsg(`✅ ${data.message} (ID: ${data.staff.employeeId})`);
      setShowAdd(false);
      setForm(emptyForm);
      load();
      setTimeout(() => setMsg(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════
  // TOGGLE ACTIVE (enable/disable)
  // ═══════════════════════════════════════════
  const handleToggle = async (s) => {
    const action = s.isActive ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${action} ${s.name}?`)) return;
    try {
      const { data } = await axios.put(
        `https://digital-backend-phi.vercel.app/api/staff/${s._id}/toggle`,
        {},
        { headers }
      );
      setMsg(`✅ ${data.message}`);
      load();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  // ═══════════════════════════════════════════
  // VIEW
  // ═══════════════════════════════════════════
  const openView = (s) => {
    setCurrent(s);
    setShowView(true);
  };

  // ═══════════════════════════════════════════
  // EDIT
  // ═══════════════════════════════════════════
  const openEdit = (s) => {
    setCurrent(s);
    setEditForm({
      name: s.name || '',
      phone: s.phone || '',
      department: s.department || '',
      role: s.role || 'backoffice',
      isActive: s.isActive,
      password: ''
    });
    setShowEdit(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...editForm };
      // Password empty asel tar remove kar
      if (!payload.password) delete payload.password;

      const { data } = await axios.put(
        `https://digital-backend-phi.vercel.app/api/staff/${current._id}`,
        payload,
        { headers }
      );
      setMsg('✅ Staff updated');
      setShowEdit(false);
      load();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════
  // PERMANENT DELETE
  // ═══════════════════════════════════════════
  const handleDelete = async (s) => {
    if (!window.confirm(`Permanently delete ${s.name}? This cannot be undone.`)) return;
    try {
      await axios.delete(`https://digital-backend-phi.vercel.app/api/staff/${s._id}/permanent`, {
        headers
      });
      setMsg('✅ Staff permanently deleted');
      load();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
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
                Staff Management
              </h2>
              <p className="text-muted small mb-0" style={{ color: '#6b7280' }}>
                Manage your team members & their roles
              </p>
            </div>
            <button onClick={() => setShowAdd(true)} style={primaryBtn}>
              + Add Staff
            </button>
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
            <Col xs={12} md={5}>
              <Form.Control
                placeholder="Search by name, email or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={inputStyle}
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                style={inputStyle}
              >
                <option value="All">All Roles</option>
                <option value="admin">Admin</option>
                <option value="backoffice">Back Office</option>
                <option value="network">Network</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={2}>
              <Form.Select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={2} className="text-md-end">
              <button
                type="button"
                onClick={resetFilters}
                className="border-0 bg-transparent fw-semibold small"
                style={{ color: '#1e40af', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Reset Filters
              </button>
            </Col>
          </Row>
        </div>

        {/* STAFF LIST */}
        {loading ? (
          <div
            className="text-center py-5"
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px'
            }}
          >
            <Spinner animation="border" style={{ color: '#1e40af' }} />
            <p className="mt-3 text-muted small mb-0">Loading staff...</p>
          </div>
        ) : staff.length === 0 ? (
          <div
            className="text-center py-5"
            style={{
              background: '#ffffff',
              border: '1px dashed #d1d5db',
              borderRadius: '10px'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
            <p className="text-muted small mb-0">
              No staff members yet. Click <strong>+ Add Staff</strong> to add your first member.
            </p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div
            className="text-center py-5"
            style={{
              background: '#ffffff',
              border: '1px dashed #d1d5db',
              borderRadius: '10px'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            <p className="text-muted small mb-2">
              No staff members match your filters.
            </p>
            <button
              onClick={resetFilters}
              className="border-0 bg-transparent fw-semibold small"
              style={{ color: '#1e40af', cursor: 'pointer' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* DESKTOP — Table */}
            <div className="d-none d-md-block">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <Table
                  hover
                  responsive
                  className="align-middle mb-0"
                  style={{ fontSize: '0.85rem' }}
                >
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {[
                        'Employee',
                        'Contact',
                        'Role',
                        'Department',
                        'Status',
                        'Actions'
                      ].map((h, i) => (
                        <th
                          key={h}
                          className={`border-0 fw-semibold ${
                            i === 5 ? 'text-end' : ''
                          }`}
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
                    {filteredStaff.map(s => {
                      const role = roleConfig[s.role] || roleConfig.backoffice;
                      return (
                        <tr key={s._id}>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '50%',
                                  background:
                                    'linear-gradient(135deg, #1e40af, #3b82f6)',
                                  color: '#ffffff',
                                  fontSize: '0.8rem'
                                }}
                              >
                                {getInitials(s.name)}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  className="fw-semibold text-truncate"
                                  style={{ color: '#111827', fontSize: '0.9rem' }}
                                >
                                  {s.name}
                                </div>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  ID: {s.employeeId || '-'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div
                              className="text-truncate"
                              style={{ color: '#111827', fontSize: '0.85rem' }}
                            >
                              {s.email}
                            </div>
                            {s.phone && (
                              <div
                                className="text-muted"
                                style={{ fontSize: '0.75rem' }}
                              >
                                📞 {s.phone}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                background: role.bg,
                                color: role.color,
                                fontSize: '0.72rem',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                lineHeight: 1
                              }}
                            >
                              <span>{role.icon}</span>
                              {role.label}
                            </span>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{ color: '#374151', fontSize: '0.85rem' }}
                            >
                              {s.department || '—'}
                            </span>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                background: s.isActive ? '#dcfce7' : '#f3f4f6',
                                color: s.isActive ? '#166534' : '#6b7280',
                                fontSize: '0.7rem',
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
                                  background: s.isActive ? '#16a34a' : '#9ca3af'
                                }}
                              />
                              {s.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>

                          <td
                            className="text-end"
                            style={{ padding: '0.85rem 1rem' }}
                          >
                            {s.role !== 'admin' ? (
                              <div className="d-inline-flex gap-1">
                                {/* VIEW */}
                                <button
                                  onClick={() => openView(s)}
                                  title="View Details"
                                  className="border-0 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '6px',
                                    background: '#eff6ff',
                                    color: '#1e40af',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    border: '1px solid #dbeafe'
                                  }}
                                >
                                  👁️
                                </button>

                                {/* EDIT */}
                                <button
                                  onClick={() => openEdit(s)}
                                  title="Edit"
                                  className="border-0 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '6px',
                                    background: '#f0fdf4',
                                    color: '#16a34a',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    border: '1px solid #bbf7d0'
                                  }}
                                >
                                  ✏️
                                </button>

                                {/* TOGGLE */}
                                <button
                                  onClick={() => handleToggle(s)}
                                  title={s.isActive ? 'Disable' : 'Enable'}
                                  className="border-0 fw-semibold"
                                  style={{
                                    background: s.isActive ? '#fef3c7' : '#dcfce7',
                                    color: s.isActive ? '#92400e' : '#166534',
                                    fontSize: '0.72rem',
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {s.isActive ? 'Disable' : 'Enable'}
                                </button>

                                {/* DELETE */}
                                <button
                                  onClick={() => handleDelete(s)}
                                  title="Permanent Delete"
                                  className="border-0 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '6px',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    border: '1px solid #fecaca'
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            ) : (
                              <span
                                className="text-muted"
                                style={{ fontSize: '0.75rem' }}
                              >
                                Protected
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </div>

            {/* MOBILE — Cards */}
            <div className="d-md-none d-flex flex-column gap-2">
              {filteredStaff.map(s => {
                const role = roleConfig[s.role] || roleConfig.backoffice;
                return (
                  <div
                    key={s._id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '0.85rem'
                    }}
                  >
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background:
                            'linear-gradient(135deg, #1e40af, #3b82f6)',
                          color: '#ffffff',
                          fontSize: '0.85rem'
                        }}
                      >
                        {getInitials(s.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="fw-semibold text-truncate"
                          style={{ color: '#111827', fontSize: '0.9rem' }}
                        >
                          {s.name}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: '0.75rem' }}
                        >
                          ID: {s.employeeId || '-'}
                        </div>
                      </div>
                      <span
                        className="fw-semibold d-inline-flex align-items-center gap-1 flex-shrink-0"
                        style={{
                          background: s.isActive ? '#dcfce7' : '#f3f4f6',
                          color: s.isActive ? '#166534' : '#6b7280',
                          fontSize: '0.68rem',
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
                            background: s.isActive ? '#16a34a' : '#9ca3af'
                          }}
                        />
                        {s.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div
                      className="d-flex flex-column gap-2 mb-3 pb-3"
                      style={{ borderBottom: '1px solid #f3f4f6' }}
                    >
                      <div className="d-flex justify-content-between gap-2">
                        <span
                          className="text-muted small"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Email
                        </span>
                        <span
                          className="fw-semibold text-truncate text-end"
                          style={{ color: '#111827', fontSize: '0.82rem' }}
                        >
                          {s.email}
                        </span>
                      </div>
                      {s.phone && (
                        <div className="d-flex justify-content-between gap-2">
                          <span
                            className="text-muted small"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Phone
                          </span>
                          <span
                            className="fw-semibold"
                            style={{ color: '#111827', fontSize: '0.82rem' }}
                          >
                            {s.phone}
                          </span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between gap-2">
                        <span
                          className="text-muted small"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Role
                        </span>
                        <span
                          className="fw-semibold d-inline-flex align-items-center gap-1"
                          style={{
                            background: role.bg,
                            color: role.color,
                            fontSize: '0.7rem',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            lineHeight: 1
                          }}
                        >
                          <span>{role.icon}</span>
                          {role.label}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between gap-2">
                        <span
                          className="text-muted small"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Department
                        </span>
                        <span
                          className="fw-semibold"
                          style={{ color: '#111827', fontSize: '0.82rem' }}
                        >
                          {s.department || '—'}
                        </span>
                      </div>
                    </div>

                    {s.role !== 'admin' ? (
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => openView(s)}
                          className="border-0 fw-semibold"
                          style={{
                            background: '#eff6ff',
                            color: '#1e40af',
                            fontSize: '0.78rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: '1px solid #dbeafe'
                          }}
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="border-0 fw-semibold"
                          style={{
                            background: '#f0fdf4',
                            color: '#16a34a',
                            fontSize: '0.78rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: '1px solid #bbf7d0'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggle(s)}
                          className="border-0 fw-semibold flex-grow-1"
                          style={{
                            background: s.isActive ? '#fef3c7' : '#dcfce7',
                            color: s.isActive ? '#92400e' : '#166534',
                            fontSize: '0.78rem',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          {s.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="border-0 d-flex align-items-center justify-content-center"
                          style={{
                            width: '38px',
                            borderRadius: '6px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            border: '1px solid #fecaca'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      <div
                        className="text-center text-muted"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Admin account is protected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Container>

      {/* ═══════════════════════════════════════════
          ADD STAFF MODAL
      ═══════════════════════════════════════════ */}
      <Modal
        show={showAdd}
        onHide={() => setShowAdd(false)}
        centered
        contentClassName="border-0"
        size="lg"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
            Add Staff Member
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAdd}>
          <Modal.Body className="pt-0">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>
                  Full Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter full name"
                  style={inputStyle}
                />
              </Col>

              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>
                  Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="name@company.com"
                  style={inputStyle}
                />
              </Col>

              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>
                  Password <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter password"
                  style={inputStyle}
                />
              </Col>

              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>
                  Role <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  style={inputStyle}
                >
                  <option value="backoffice">Back Office</option>
                  <option value="network">Network Engineer</option>
                </Form.Select>
              </Col>

              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>Phone</Form.Label>
                <Form.Control
                  value={form.phone}
                  onChange={e =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 10)
                    })
                  }
                  maxLength={10}
                  placeholder="10-digit mobile"
                  style={inputStyle}
                />
              </Col>

              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>Department</Form.Label>
                <Form.Control
                  value={form.department}
                  onChange={e =>
                    setForm({ ...form, department: e.target.value })
                  }
                  placeholder="e.g., Sales, Support"
                  style={inputStyle}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              variant="light"
              onClick={() => setShowAdd(false)}
              className="fw-semibold"
              style={{ fontSize: '0.875rem', borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="fw-semibold border-0"
              style={primaryBtn}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Adding...
                </>
              ) : (
                'Add Staff'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ═══════════════════════════════════════════
          VIEW STAFF MODAL
      ═══════════════════════════════════════════ */}
      <Modal
        show={showView}
        onHide={() => setShowView(false)}
        centered
        contentClassName="border-0"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
            Staff Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {current && (
            <>
              {/* Avatar + Name */}
              <div className="text-center mb-4">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    color: '#ffffff',
                    fontSize: '1.4rem'
                  }}
                >
                  {getInitials(current.name)}
                </div>
                <h5 className="fw-bold mb-1">{current.name}</h5>
                <span
                  className="fw-semibold d-inline-flex align-items-center gap-1"
                  style={{
                    background:
                      (roleConfig[current.role] || roleConfig.backoffice).bg,
                    color:
                      (roleConfig[current.role] || roleConfig.backoffice).color,
                    fontSize: '0.75rem',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    lineHeight: 1
                  }}
                >
                  {(roleConfig[current.role] || roleConfig.backoffice).icon}{' '}
                  {(roleConfig[current.role] || roleConfig.backoffice).label}
                </span>
              </div>

              {/* Details Grid */}
              <div
                className="d-flex flex-column gap-3"
                style={{
                  background: '#f9fafb',
                  borderRadius: '10px',
                  padding: '1rem'
                }}
              >
                <Row className="g-3">
                  <Col xs={6}>
                    <div
                      className="text-muted small text-uppercase fw-semibold mb-1"
                      style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}
                    >
                      Employee ID
                    </div>
                    <div
                      className="fw-semibold"
                      style={{ color: '#111827', fontSize: '0.88rem' }}
                    >
                      {current.employeeId || '—'}
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div
                      className="text-muted small text-uppercase fw-semibold mb-1"
                      style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}
                    >
                      Status
                    </div>
                    <span
                      className="fw-semibold d-inline-flex align-items-center gap-1"
                      style={{
                        background: current.isActive ? '#dcfce7' : '#f3f4f6',
                        color: current.isActive ? '#166534' : '#6b7280',
                        fontSize: '0.7rem',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        lineHeight: 1
                      }}
                    >
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: current.isActive
                            ? '#16a34a'
                            : '#9ca3af'
                        }}
                      />
                      {current.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </Col>
                  <Col xs={12}>
                    <div
                      className="text-muted small text-uppercase fw-semibold mb-1"
                      style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}
                    >
                      Email
                    </div>
                    <div
                      style={{ color: '#111827', fontSize: '0.88rem' }}
                      className="text-break"
                    >
                      {current.email}
                    </div>
                  </Col>
                  {current.phone && (
                    <Col xs={12}>
                      <div
                        className="text-muted small text-uppercase fw-semibold mb-1"
                        style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}
                      >
                        Phone
                      </div>
                      <div
                        style={{ color: '#111827', fontSize: '0.88rem' }}
                      >
                        📞 {current.phone}
                      </div>
                    </Col>
                  )}
                  {current.department && (
                    <Col xs={12}>
                      <div
                        className="text-muted small text-uppercase fw-semibold mb-1"
                        style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}
                      >
                        Department
                      </div>
                      <div
                        style={{ color: '#111827', fontSize: '0.88rem' }}
                      >
                        {current.department}
                      </div>
                    </Col>
                  )}
                  {current.createdAt && (
                    <Col xs={12}>
                      <div
                        className="text-muted small text-uppercase fw-semibold mb-1"
                        style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}
                      >
                        Added On
                      </div>
                      <div
                        style={{ color: '#111827', fontSize: '0.88rem' }}
                      >
                        {new Date(current.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </Col>
                  )}
                  {current.lastLogin && (
                    <Col xs={12}>
                      <div
                        className="text-muted small text-uppercase fw-semibold mb-1"
                        style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}
                      >
                        Last Login
                      </div>
                      <div
                        style={{ color: '#111827', fontSize: '0.88rem' }}
                      >
                        {new Date(current.lastLogin).toLocaleString('en-IN')}
                      </div>
                    </Col>
                  )}
                </Row>
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
          {current && current.role !== 'admin' && (
            <Button
              onClick={() => {
                setShowView(false);
                openEdit(current);
              }}
              className="fw-semibold border-0"
              style={primaryBtn}
            >
              ✏️ Edit
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* ═══════════════════════════════════════════
          EDIT STAFF MODAL
      ═══════════════════════════════════════════ */}
      <Modal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        centered
        contentClassName="border-0"
        size="lg"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
            Edit Staff Member
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEdit}>
          <Modal.Body className="pt-0">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>
                  Full Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  required
                  value={editForm.name}
                  onChange={e =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  style={inputStyle}
                />
              </Col>

              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>Email (Read-only)</Form.Label>
                <Form.Control
                  value={current?.email || ''}
                  readOnly
                  disabled
                  style={{ ...inputStyle, background: '#f3f4f6' }}
                />
              </Col>

              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>
                  New Password{' '}
                  <span className="text-muted small">(leave blank to keep)</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  value={editForm.password}
                  onChange={e =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                  placeholder="New password"
                  style={inputStyle}
                />
              </Col>

              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>Role</Form.Label>
                <Form.Select
                  value={editForm.role}
                  onChange={e =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="backoffice">Back Office</option>
                  <option value="network">Network Engineer</option>
                </Form.Select>
              </Col>

              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>Phone</Form.Label>
                <Form.Control
                  value={editForm.phone}
                  onChange={e =>
                    setEditForm({
                      ...editForm,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 10)
                    })
                  }
                  maxLength={10}
                  placeholder="10-digit mobile"
                  style={inputStyle}
                />
              </Col>

              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>Department</Form.Label>
                <Form.Control
                  value={editForm.department}
                  onChange={e =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                  placeholder="e.g., Sales, Support"
                  style={inputStyle}
                />
              </Col>

              <Col xs={12}>
                <Form.Check
                  type="switch"
                  id="edit-active-toggle"
                  label={editForm.isActive ? 'Active' : 'Disabled'}
                  checked={editForm.isActive || false}
                  onChange={e =>
                    setEditForm({ ...editForm, isActive: e.target.checked })
                  }
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              variant="light"
              onClick={() => setShowEdit(false)}
              className="fw-semibold"
              style={{ fontSize: '0.875rem', borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="fw-semibold border-0"
              style={primaryBtn}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}