import { useEffect, useState, useMemo } from 'react';
import {
  Container, Card, Button, Form, Modal, Alert,
  Badge, Table, Pagination, InputGroup, Row, Col, Spinner
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import ImageUpload from '../../../components/ImageUpload';

const EMPTY = { name: '', logo: '', isActive: true };
const ROWS_PER_PAGE = 5;

const PRESETS = [
  'HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'Apple',
  'Samsung', 'Sony', 'Canon', 'Epson', 'Logitech', 'MSI',
  'Intel', 'AMD', 'Nvidia', 'TP-Link', 'D-Link', 'Boat'
];

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

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    axios
      .get('https://digital-backend-phi.vercel.app/api/brands/admin/all', { headers })
      .then(r => setBrands(r.data || []))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered brands
  const filteredBrands = useMemo(() => {
    return brands.filter(b => {
      const matchesName = b.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchesStatus =
        statusFilter === 'all' ? true :
        statusFilter === 'active' ? b.isActive === true :
        statusFilter === 'inactive' ? b.isActive === false : true;
      return matchesName && matchesStatus;
    });
  }, [brands, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredBrands.length / ROWS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentBrands = filteredBrands.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPaginationItems = () => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) end = 4;
      if (currentPage >= totalPages - 2) start = totalPages - 3;

      if (start > 2) items.push('...start');
      for (let i = start; i <= end; i++) items.push(i);
      if (end < totalPages - 1) items.push('...end');

      items.push(totalPages);
    }
    return items;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all';

  // CRUD
  const openAdd = () => {
    setForm(EMPTY);
    setEditing(null);
    setShow(true);
  };

  const openEdit = (b) => {
    setForm({ name: b.name, logo: b.logo || '', isActive: b.isActive });
    setEditing(b._id);
    setShow(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`https://digital-backend-phi.vercel.app/api/brands/${editing}`, form, { headers });
        setMsg('✅ Brand updated');
      } else {
        await axios.post('https://digital-backend-phi.vercel.app/api/brands', form, { headers });
        setMsg('✅ Brand added');
      }
      setShow(false);
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand?')) return;
    try {
      await axios.delete(`https://digital-backend-phi.vercel.app/api/brands/${id}`, { headers });
      setMsg('✅ Brand deleted');
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const toggleActive = async (brand) => {
    try {
      await axios.put(
        `https://digital-backend-phi.vercel.app/api/brands/${brand._id}`,
        { isActive: !brand.isActive },
        { headers }
      );
      setMsg(`✅ Brand ${!brand.isActive ? 'activated' : 'deactivated'}`);
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const quickAddPreset = async (name) => {
    try {
      await axios.post('https://digital-backend-phi.vercel.app/api/brands', { name }, { headers });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const totalCount = brands.length;
  const activeCount = brands.filter(b => b.isActive).length;
  const inactiveCount = totalCount - activeCount;

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
                Brand Management
              </h2>
              <p className="text-muted small mb-0" style={{ color: '#6b7280' }}>
                "Authorized Dealer For" section on homepage
              </p>
            </div>
            <button onClick={openAdd} style={primaryBtn}>
              + Add Brand
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

        {/* QUICK ADD PRESETS */}
        <Card
          className="border-0 mb-4"
          style={{
            borderRadius: '10px',
            background: '#ffffff',
            border: '1px solid #e5e7eb'
          }}
        >
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{ fontSize: '1rem' }}>⚡</span>
              <h6
                className="fw-bold mb-0"
                style={{ color: '#111827', fontSize: '0.9rem' }}
              >
                Quick Add Popular Brands
              </h6>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {PRESETS.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => quickAddPreset(name)}
                  className="fw-semibold"
                  style={{
                    background: '#ffffff',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#eff6ff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  + {name}
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* STATS */}
        <Row className="g-3 mb-4">
          <Col xs={4}>
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
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: '#6b7280'
                }}
              >
                Total
              </div>
              <div
                className="fw-bold"
                style={{
                  color: '#111827',
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                  lineHeight: 1.2
                }}
              >
                {totalCount}
              </div>
            </div>
          </Col>
          <Col xs={4}>
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
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: '#6b7280'
                }}
              >
                Active
              </div>
              <div
                className="fw-bold"
                style={{
                  color: '#111827',
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                  lineHeight: 1.2
                }}
              >
                {activeCount}
              </div>
            </div>
          </Col>
          <Col xs={4}>
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
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: '#6b7280'
                }}
              >
                Inactive
              </div>
              <div
                className="fw-bold"
                style={{
                  color: '#111827',
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                  lineHeight: 1.2
                }}
              >
                {inactiveCount}
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
                placeholder="Search by brand name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={inputStyle}
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={inputStyle}
              >
                <option value="all">All Statuses ({totalCount})</option>
                <option value="active">Active ({activeCount})</option>
                <option value="inactive">Inactive ({inactiveCount})</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={3} className="text-md-end">
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

        {/* BRANDS TABLE */}
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
              <p className="mt-3 text-muted small mb-0">Loading brands...</p>
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏢</div>
              <p className="text-muted small mb-0">
                No brands yet. Click <strong>+ Add Brand</strong> or use quick presets above.
              </p>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <p className="text-muted small mb-2">No brands match your filters.</p>
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
                      {['#', 'Logo', 'Brand Name', 'Status', 'Actions'].map((h, i) => (
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
                    {currentBrands.map((brand, index) => (
                      <tr key={brand._id}>
                        <td style={{ padding: '0.85rem 1rem', color: '#9ca3af' }}>
                          {startIndex + index + 1}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: '100px',
                              height: '50px',
                              background: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '4px',
                              opacity: brand.isActive ? 1 : 0.5
                            }}
                          >
                            {brand.logo ? (
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                style={{
                                  maxHeight: '100%',
                                  maxWidth: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                            ) : (
                              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                No logo
                              </small>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            className="fw-semibold"
                            style={{ color: '#111827', fontSize: '0.9rem' }}
                          >
                            {brand.name}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            className="fw-semibold d-inline-flex align-items-center gap-1"
                            style={{
                              background: brand.isActive ? '#dcfce7' : '#f3f4f6',
                              color: brand.isActive ? '#166534' : '#6b7280',
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
                                background: brand.isActive ? '#16a34a' : '#9ca3af'
                              }}
                            />
                            {brand.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-end" style={{ padding: '0.85rem 1rem' }}>
                          <div className="d-inline-flex gap-1">
                            <button
                              onClick={() => openEdit(brand)}
                              title="Edit"
                              className="border-0 d-flex align-items-center justify-content-center"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
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
                              onClick={() => toggleActive(brand)}
                              title={brand.isActive ? 'Deactivate' : 'Activate'}
                              className="border-0 d-flex align-items-center justify-content-center"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                background: brand.isActive ? '#fef3c7' : '#dcfce7',
                                color: brand.isActive ? '#92400e' : '#166534',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                border: `1px solid ${brand.isActive ? '#fde68a' : '#86efac'}`
                              }}
                            >
                              {brand.isActive ? '👁️' : '🚫'}
                            </button>
                            <button
                              onClick={() => handleDelete(brand._id)}
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
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Card view */}
              <div className="d-md-none p-2 d-flex flex-column gap-2">
                {currentBrands.map((brand, index) => (
                  <div
                    key={brand._id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '0.85rem'
                    }}
                  >
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: '72px',
                          height: '52px',
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '4px',
                          opacity: brand.isActive ? 1 : 0.5
                        }}
                      >
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            style={{
                              maxHeight: '100%',
                              maxWidth: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                            No logo
                          </small>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="fw-semibold text-truncate"
                          style={{ color: '#111827', fontSize: '0.9rem' }}
                        >
                          {brand.name}
                        </div>
                        <span
                          className="fw-semibold d-inline-flex align-items-center gap-1 mt-1"
                          style={{
                            background: brand.isActive ? '#dcfce7' : '#f3f4f6',
                            color: brand.isActive ? '#166534' : '#6b7280',
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
                              background: brand.isActive ? '#16a34a' : '#9ca3af'
                            }}
                          />
                          {brand.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between gap-2 pt-2"
                      style={{ borderTop: '1px solid #f3f4f6' }}
                    >
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
                        #{startIndex + index + 1}
                      </span>

                      <div className="d-flex gap-1">
                        <button
                          onClick={() => openEdit(brand)}
                          className="border-0 d-flex align-items-center justify-content-center"
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
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
                          onClick={() => toggleActive(brand)}
                          className="border-0 d-flex align-items-center justify-content-center"
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            background: brand.isActive ? '#fef3c7' : '#dcfce7',
                            color: brand.isActive ? '#92400e' : '#166534',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            border: `1px solid ${brand.isActive ? '#fde68a' : '#86efac'}`
                          }}
                        >
                          {brand.isActive ? '👁️' : '🚫'}
                        </button>
                        <button
                          onClick={() => handleDelete(brand._id)}
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
                ))}
              </div>

              {/* Pagination Footer */}
              <div
                className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-3 px-md-4 py-3"
                style={{ borderTop: '1px solid #f3f4f6' }}
              >
                <small style={{ color: '#6b7280', fontSize: '0.78rem' }}>
                  Showing{' '}
                  <strong style={{ color: '#111827' }}>{startIndex + 1}</strong>–
                  <strong style={{ color: '#111827' }}>
                    {Math.min(endIndex, filteredBrands.length)}
                  </strong>{' '}
                  of <strong style={{ color: '#111827' }}>{filteredBrands.length}</strong> brands
                  {hasActiveFilters && <span style={{ color: '#1e40af' }}> (filtered)</span>}
                </small>

                {totalPages > 1 && (
                  <Pagination className="mb-0" size="sm">
                    <Pagination.First
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    />

                    {getPaginationItems().map((item, i) => {
                      if (typeof item === 'string') {
                        return <Pagination.Ellipsis key={item + i} disabled />;
                      }
                      return (
                        <Pagination.Item
                          key={item}
                          active={item === currentPage}
                          onClick={() => goToPage(item)}
                        >
                          {item}
                        </Pagination.Item>
                      );
                    })}

                    <Pagination.Next
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                )}
              </div>
            </>
          )}
        </div>
      </Container>

      {/* ADD/EDIT MODAL */}
      <Modal
        show={show}
        onHide={() => setShow(false)}
        centered
        contentClassName="border-0"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
            {editing ? 'Edit Brand' : 'Add Brand'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body className="pt-0">
            <div className="mb-3">
              <Form.Label style={labelStyle}>
                Brand Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., HP"
                style={inputStyle}
              />
            </div>

            <div className="mb-3">
              <ImageUpload
                label="Brand Logo (optional)"
                value={form.logo || ''}
                onChange={url => setForm({ ...form, logo: url })}
                height={100}
              />
            </div>

            <div
              className="p-3 mb-3"
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '10px'
              }}
            >
              <Form.Check
                type="switch"
                id="brand-active-switch"
                label={
                  <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                }
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
              />
              <div
                className="mt-1"
                style={{ color: '#6b7280', fontSize: '0.72rem' }}
              >
                {form.isActive
                  ? 'Shown on homepage "Authorized Dealer For" section'
                  : 'Hidden from homepage'}
              </div>
            </div>

            {/* Preview */}
            <div>
              <div
                className="text-uppercase fw-semibold mb-2"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: '#6b7280'
                }}
              >
                Live Preview
              </div>
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  background: '#f9fafb',
                  border: '1px dashed #d1d5db',
                  borderRadius: '10px',
                  minHeight: '80px',
                  padding: '12px'
                }}
              >
                {form.logo ? (
                  <img
                    src={form.logo}
                    alt=""
                    style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div
                    className="fw-bold"
                    style={{ color: '#111827', fontSize: '1.1rem' }}
                  >
                    {form.name || 'Brand Name'}
                  </div>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              variant="light"
              onClick={() => setShow(false)}
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
              ) : editing ? (
                'Update Brand'
              ) : (
                'Add Brand'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}