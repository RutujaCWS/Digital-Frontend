import { useEffect, useState, useMemo } from 'react';
import {
  Container, Card, Button, Row, Col, Form, Modal,
  Alert, Badge, Spinner, Table, Pagination
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import ImageUpload from '../../../components/ImageUpload';

const EMPTY = {
  name: '',
  icon: '📦',
  color: '#e3f2fd',
  image: '',
  description: '',
  order: 0,
  isActive: true
};

const PRESETS = [
  { name: 'Laptops', icon: '💻', color: '#dbeafe' },
  { name: 'Desktops', icon: '🖥️', color: '#ede9fe' },
  { name: 'Printers', icon: '🖨️', color: '#fef3c7' },
  { name: 'Accessories', icon: '⌨️', color: '#dcfce7' },
  { name: 'Mobiles', icon: '📱', color: '#fce7f3' },
  { name: 'Headphones', icon: '🎧', color: '#cffafe' },
  { name: 'Networking', icon: '🌐', color: '#fef9c3' },
  { name: 'Cables', icon: '🔌', color: '#ede9fe' }
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

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    axios
      .get('https://digital-backend-fv2v.onrender.com/api/categories/admin/all', { headers })
      .then(r => setCategories(r.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter(c => c.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [categories]);

  // ✅ Pagination
  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return categories.slice(start, start + ITEMS_PER_PAGE);
  }, [categories, currentPage]);

  // Reset page if exceeds total pages (e.g., after delete)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // Pagination page numbers
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const openAdd = () => {
    setForm(EMPTY);
    setEditing(null);
    setShow(true);
  };

  const openEdit = (cat) => {
    setForm({ ...cat });
    setEditing(cat._id);
    setShow(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await axios.put(
          `https://digital-backend-fv2v.onrender.com/api/categories/${editing}`,
          form,
          { headers }
        );
        setMsg('✅ Category updated');
      } else {
        await axios.post(
          'https://digital-backend-fv2v.onrender.com/api/categories',
          form,
          { headers }
        );
        setMsg('✅ Category added');
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
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`https://digital-backend-fv2v.onrender.com/api/categories/${id}`, {
        headers
      });
      setMsg('✅ Category deleted');
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const toggleActive = async (cat) => {
    try {
      await axios.put(
        `https://digital-backend-fv2v.onrender.com/api/categories/${cat._id}`,
        { ...cat, isActive: !cat.isActive },
        { headers }
      );
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  // ✅ Move uses real index (across pages)
  const move = async (displayIndex, direction) => {
    const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + displayIndex;
    const target = realIndex + direction;
    if (target < 0 || target >= categories.length) return;

    const updated = [...categories];
    [updated[realIndex], updated[target]] = [updated[target], updated[realIndex]];
    setCategories(updated);

    const orderedIds = updated.map(c => c._id);
    try {
      await axios.post(
        'https://digital-backend-fv2v.onrender.com/api/categories/reorder',
        { orderedIds },
        { headers }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const quickAddPreset = async (preset) => {
    try {
      await axios.post(
        'https://digital-backend-fv2v.onrender.com/api/categories',
        preset,
        { headers }
      );
      load();
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
                Category Management
              </h2>
              <p className="text-muted small mb-0" style={{ color: '#6b7280' }}>
                Manage homepage category strip & display order
              </p>
            </div>
            <button onClick={openAdd} style={primaryBtn}>
              + Add Category
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
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                {stats.total}
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
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                {stats.active}
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
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                {stats.inactive}
              </div>
            </div>
          </Col>
        </Row>

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
                Quick Add Presets
              </h6>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => quickAddPreset(preset)}
                  className="fw-semibold d-inline-flex align-items-center gap-2"
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
                  <span style={{ fontSize: '0.95rem' }}>{preset.icon}</span>
                  {preset.name}
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* CATEGORIES LIST */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
        >
          <div
            className="px-3 px-md-4 py-3 d-flex justify-content-between align-items-center"
            style={{ borderBottom: '1px solid #f3f4f6' }}
          >
            <h6
              className="fw-bold mb-0"
              style={{ color: '#111827', fontSize: '0.95rem' }}
            >
              All Categories
              <span
                className="ms-2 fw-semibold"
                style={{
                  background: '#eff6ff',
                  color: '#1e40af',
                  fontSize: '0.7rem',
                  padding: '3px 10px',
                  borderRadius: '20px'
                }}
              >
                {categories.length}
              </span>
            </h6>
            {categories.length > 0 && (
              <div
                className="small"
                style={{ color: '#6b7280', fontSize: '0.75rem' }}
              >
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: '#1e40af' }} />
              <p className="mt-3 text-muted small mb-0">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                🗂️
              </div>
              <p className="text-muted small mb-0">
                No categories yet. Click <strong>+ Add Category</strong> or use
                quick presets above.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="d-none d-md-block">
                <Table
                  hover
                  className="align-middle mb-0"
                  style={{ fontSize: '0.85rem' }}
                >
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {[
                        '#',
                        'Category',
                        'Preview',
                        'Status',
                        'Order',
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
                    {paginatedCategories.map((cat, i) => {
                      const realIndex =
                        (currentPage - 1) * ITEMS_PER_PAGE + i;
                      return (
                        <tr key={cat._id}>
                          <td
                            style={{
                              padding: '0.85rem 1rem',
                              color: '#9ca3af'
                            }}
                          >
                            {realIndex + 1}
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '10px',
                                  background: cat.color || '#f3f4f6',
                                  fontSize: '1.3rem'
                                }}
                              >
                                {cat.icon || '📦'}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  className="fw-semibold text-truncate"
                                  style={{
                                    color: '#111827',
                                    fontSize: '0.9rem'
                                  }}
                                >
                                  {cat.name}
                                </div>
                                {cat.description && (
                                  <div
                                    className="text-muted text-truncate"
                                    style={{
                                      fontSize: '0.75rem',
                                      maxWidth: '220px'
                                    }}
                                  >
                                    {cat.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div
                              className="d-inline-flex align-items-center"
                              style={{
                                background: cat.color || '#f3f4f6',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                gap: '6px'
                              }}
                            >
                              <span style={{ fontSize: '1rem' }}>
                                {cat.icon || '📦'}
                              </span>
                              <span
                                className="fw-semibold"
                                style={{
                                  color: '#111827',
                                  fontSize: '0.78rem'
                                }}
                              >
                                {cat.name}
                              </span>
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                background: cat.isActive
                                  ? '#dcfce7'
                                  : '#f3f4f6',
                                color: cat.isActive ? '#166534' : '#6b7280',
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
                                  background: cat.isActive
                                    ? '#16a34a'
                                    : '#9ca3af'
                                }}
                              />
                              {cat.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="fw-semibold"
                              style={{
                                background: '#f3f4f6',
                                color: '#374151',
                                fontSize: '0.72rem',
                                padding: '4px 10px',
                                borderRadius: '6px'
                              }}
                            >
                              {cat.order}
                            </span>
                          </td>

                          <td
                            className="text-end"
                            style={{ padding: '0.85rem 1rem' }}
                          >
                            <div className="d-inline-flex gap-1">
                              <button
                                onClick={() => move(i, -1)}
                                disabled={realIndex === 0}
                                title="Move up"
                                className="border-0 d-flex align-items-center justify-content-center"
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: '#f9fafb',
                                  border: '1px solid #e5e7eb',
                                  color: '#374151',
                                  fontSize: '0.75rem',
                                  cursor:
                                    realIndex === 0
                                      ? 'not-allowed'
                                      : 'pointer',
                                  opacity: realIndex === 0 ? 0.4 : 1
                                }}
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => move(i, 1)}
                                disabled={
                                  realIndex === categories.length - 1
                                }
                                title="Move down"
                                className="border-0 d-flex align-items-center justify-content-center"
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: '#f9fafb',
                                  border: '1px solid #e5e7eb',
                                  color: '#374151',
                                  fontSize: '0.75rem',
                                  cursor:
                                    realIndex === categories.length - 1
                                      ? 'not-allowed'
                                      : 'pointer',
                                  opacity:
                                    realIndex === categories.length - 1
                                      ? 0.4
                                      : 1
                                }}
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => openEdit(cat)}
                                title="Edit"
                                className="border-0 d-flex align-items-center justify-content-center"
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: '#eff6ff',
                                  color: '#1e40af',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  border: '1px solid #bfdbfe'
                                }}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => toggleActive(cat)}
                                title={
                                  cat.isActive ? 'Deactivate' : 'Activate'
                                }
                                className="border-0 d-flex align-items-center justify-content-center"
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: cat.isActive
                                    ? '#fef3c7'
                                    : '#dcfce7',
                                  color: cat.isActive ? '#92400e' : '#166534',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  border: `1px solid ${
                                    cat.isActive ? '#fde68a' : '#86efac'
                                  }`
                                }}
                              >
                                {cat.isActive ? '👁️' : '🚫'}
                              </button>
                              <button
                                onClick={() => handleDelete(cat._id)}
                                title="Delete"
                                className="border-0 d-flex align-items-center justify-content-center"
                                style={{
                                  width: '28px',
                                  height: '28px',
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
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Card view */}
              <div className="d-md-none p-2 d-flex flex-column gap-2">
                {paginatedCategories.map((cat, i) => {
                  const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + i;
                  return (
                    <div
                      key={cat._id}
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
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            background: cat.color || '#f3f4f6',
                            fontSize: '1.4rem'
                          }}
                        >
                          {cat.icon || '📦'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            className="fw-semibold text-truncate"
                            style={{
                              color: '#111827',
                              fontSize: '0.9rem'
                            }}
                          >
                            {cat.name}
                          </div>
                          {cat.description && (
                            <div
                              className="text-muted text-truncate"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {cat.description}
                            </div>
                          )}
                        </div>
                        <span
                          className="fw-semibold d-inline-flex align-items-center gap-1 flex-shrink-0"
                          style={{
                            background: cat.isActive
                              ? '#dcfce7'
                              : '#f3f4f6',
                            color: cat.isActive ? '#166534' : '#6b7280',
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
                              background: cat.isActive
                                ? '#16a34a'
                                : '#9ca3af'
                            }}
                          />
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
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
                            padding: '4px 10px',
                            borderRadius: '6px'
                          }}
                        >
                          Order: {cat.order}
                        </span>

                        <div className="d-flex gap-1">
                          <button
                            onClick={() => move(i, -1)}
                            disabled={realIndex === 0}
                            className="border-0 d-flex align-items-center justify-content-center"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              background: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              color: '#374151',
                              fontSize: '0.8rem',
                              cursor:
                                realIndex === 0 ? 'not-allowed' : 'pointer',
                              opacity: realIndex === 0 ? 0.4 : 1
                            }}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => move(i, 1)}
                            disabled={realIndex === categories.length - 1}
                            className="border-0 d-flex align-items-center justify-content-center"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              background: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              color: '#374151',
                              fontSize: '0.8rem',
                              cursor:
                                realIndex === categories.length - 1
                                  ? 'not-allowed'
                                  : 'pointer',
                              opacity:
                                realIndex === categories.length - 1 ? 0.4 : 1
                            }}
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => openEdit(cat)}
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
                            onClick={() => toggleActive(cat)}
                            className="border-0 d-flex align-items-center justify-content-center"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              background: cat.isActive
                                ? '#fef3c7'
                                : '#dcfce7',
                              color: cat.isActive ? '#92400e' : '#166534',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              border: `1px solid ${
                                cat.isActive ? '#fde68a' : '#86efac'
                              }`
                            }}
                          >
                            {cat.isActive ? '👁️' : '🚫'}
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
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

              {/* ✅ PAGINATION */}
              {totalPages > 1 && (
                <div
                  className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-3 px-md-4 py-3"
                  style={{ borderTop: '1px solid #f3f4f6' }}
                >
                  <div
                    className="small"
                    style={{ color: '#6b7280', fontSize: '0.78rem' }}
                  >
                    Showing{' '}
                    <strong style={{ color: '#111827' }}>
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    </strong>{' '}
                    –{' '}
                    <strong style={{ color: '#111827' }}>
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        categories.length
                      )}
                    </strong>{' '}
                    of{' '}
                    <strong style={{ color: '#111827' }}>
                      {categories.length}
                    </strong>
                  </div>

                  <Pagination className="mb-0" size="sm">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage(p => Math.max(1, p - 1))
                      }
                    />
                    {pageNumbers[0] > 1 && (
                      <>
                        <Pagination.Item
                          onClick={() => setCurrentPage(1)}
                          active={currentPage === 1}
                        >
                          1
                        </Pagination.Item>
                        {pageNumbers[0] > 2 && (
                          <Pagination.Ellipsis disabled />
                        )}
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
                        {pageNumbers[pageNumbers.length - 1] <
                          totalPages - 1 && <Pagination.Ellipsis disabled />}
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
                      onClick={() =>
                        setCurrentPage(p => Math.min(totalPages, p + 1))
                      }
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </Container>

      {/* ADD/EDIT MODAL */}
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="lg"
        centered
        contentClassName="border-0"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
            {editing ? 'Edit Category' : 'Add Category'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body className="pt-0">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Label style={labelStyle}>
                  Category Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Laptops"
                  style={inputStyle}
                />
              </Col>

              <Col xs={6} md={3}>
                <Form.Label style={labelStyle}>Icon</Form.Label>
                <Form.Control
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  placeholder="💻"
                  maxLength={4}
                  style={{ ...inputStyle, textAlign: 'center' }}
                />
              </Col>

              <Col xs={6} md={3}>
                <Form.Label style={labelStyle}>Color</Form.Label>
                <Form.Control
                  type="color"
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: '8px',
                    padding: '3px',
                    cursor: 'pointer'
                  }}
                />
              </Col>

              <Col xs={12}>
                <Form.Label style={labelStyle}>
                  Description (optional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={form.description}
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Short description"
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </Col>

              <Col xs={12}>
                <ImageUpload
                  label="Category Image (optional)"
                  value={form.image || ''}
                  onChange={url => setForm({ ...form, image: url })}
                  height={120}
                />
              </Col>

              <Col xs={6} md={6}>
                <Form.Label style={labelStyle}>Order</Form.Label>
                <Form.Control
                  type="number"
                  value={form.order}
                  onChange={e =>
                    setForm({ ...form, order: +e.target.value })
                  }
                  style={inputStyle}
                />
              </Col>

              <Col xs={6} md={6} className="d-flex align-items-end pb-1">
                <Form.Check
                  type="switch"
                  id="isActiveSwitch"
                  label={form.isActive ? 'Active' : 'Inactive'}
                  checked={form.isActive}
                  onChange={e =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
              </Col>

              {/* Live Preview */}
              <Col xs={12}>
                <div
                  className="p-3 text-center"
                  style={{
                    background: '#f9fafb',
                    border: '1px dashed #d1d5db',
                    borderRadius: '10px'
                  }}
                >
                  <div
                    className="text-uppercase fw-semibold mb-3"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#6b7280'
                    }}
                  >
                    Live Preview
                  </div>
                  <div
                    className="d-inline-flex flex-column align-items-center justify-content-center p-4"
                    style={{
                      background: form.color || '#f3f4f6',
                      borderRadius: '12px',
                      minWidth: '150px'
                    }}
                  >
                    <div style={{ fontSize: '2rem' }}>
                      {form.icon || '📦'}
                    </div>
                    <div
                      className="fw-semibold mt-1"
                      style={{ color: '#111827', fontSize: '0.85rem' }}
                    >
                      {form.name || 'Category'}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
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
                'Update'
              ) : (
                'Add Category'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}