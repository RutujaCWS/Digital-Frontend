import { useEffect, useState, useMemo } from 'react';
import {
  Container, Card, Button, Table, Modal, Form, Row, Col,
  Badge, Alert, Spinner, Pagination
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import ImageUpload from '../../../components/ImageUpload';

const EMPTY = {
  name: '',
  description: '',
  dealerRate: '',
  price: '',
  originalPrice: '',
  category: '',
  brand: '',
  gst: 0,                    // ✅ NEW
  condition: 'New',    
  images: [],
  countInStock: 0,
  rating: 0,
  numReviews: 0,
  hasGift: false,
  gifts: []
};

const ITEMS_PER_PAGE = 5;
const LOW_STOCK_THRESHOLD = 3;

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

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ View modal state
  const [showView, setShowView] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [viewingImageIndex, setViewingImageIndex] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState('All');

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const loadProducts = () => {
    setLoading(true);
    axios
      .get('https://digital-backend-phi.vercel.app/api/products')
      .then(r => setProducts(r.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  const loadCategories = () =>
    axios
      .get('https://digital-backend-phi.vercel.app/api/categories')
      .then(r => setCategories(r.data || []))
      .catch(() => setCategories([]));

      const loadBrands = () =>
      axios
        .get('https://digital-backend-phi.vercel.app/api/brands')
        .then(r => setBrands(r.data || []))
        .catch(() => setBrands([]));

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => p.countInStock > LOW_STOCK_THRESHOLD).length;
    const lowStock = products.filter(
      p => p.countInStock > 0 && p.countInStock <= LOW_STOCK_THRESHOLD
    ).length;
    const outOfStock = products.filter(p => p.countInStock <= 0).length;
    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (
        searchQuery.trim() &&
        !(
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
        return false;
      if (filterCategory !== 'All' && p.category !== filterCategory) return false;
      if (filterStock === 'In Stock' && p.countInStock <= LOW_STOCK_THRESHOLD)
        return false;
      if (
        filterStock === 'Low Stock' &&
        !(p.countInStock > 0 && p.countInStock <= LOW_STOCK_THRESHOLD)
      )
        return false;
      if (filterStock === 'Out of Stock' && p.countInStock > 0) return false;
      return true;
    });
  }, [products, searchQuery, filterCategory, filterStock]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStock]);

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

  const resetFilters = () => {
    setSearchQuery('');
    setFilterCategory('All');
    setFilterStock('All');
  };

  const getStockStatus = (count) => {
    if (count <= 0) {
      return { label: 'Out of Stock', bg: '#fee2e2', color: '#991b1b', dot: '#dc2626' };
    }
    if (count <= LOW_STOCK_THRESHOLD) {
      return { label: 'Low Stock', bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' };
    }
    return { label: 'In Stock', bg: '#dcfce7', color: '#166534', dot: '#16a34a' };
  };

  const openAdd = () => {
    setForm({ ...EMPTY, images: [], gifts: [] });
    setEditing(null);
    setShow(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice || '',
      category: p.category,
      brand: p.brand || '',
      gst: p.gst || 0,              // ✅ NEW
      condition: p.condition || 'New', // ✅ NEW
      dealerRate: p.dealerRate || '',
      images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
      countInStock: p.countInStock,
      rating: p.rating || 0,
      numReviews: p.numReviews || 0,
      hasGift: p.hasGift || false,
      gifts: p.gifts || []
    });
    setEditing(p._id);
    setShow(true);
  };

  // ✅ View modal opener
  const openView = (p) => {
    setViewing(p);
    setViewingImageIndex(0);
    setShowView(true);
  };

  // IMAGE HANDLERS
  const addImage = (url) => {
    if (!url) return;
    if (form.images.length >= 5) {
      alert('Max 5 images allowed');
      return;
    }
    setForm({ ...form, images: [...form.images, url] });
  };

  const removeImage = (index) => {
    const updated = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: updated });
  };

  const moveImage = (index, direction) => {
    const updated = [...form.images];
    const target = index + direction;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setForm({ ...form, images: updated });
  };

  // GIFT HANDLERS
  const addGift = () => {
    setForm({
      ...form,
      hasGift: true,
      gifts: [
        ...form.gifts,
        { name: '', image: '', description: '', minQuantity: 1, value: 0 }
      ]
    });
  };

  const removeGift = (index) => {
    const updated = form.gifts.filter((_, i) => i !== index);
    setForm({ ...form, gifts: updated, hasGift: updated.length > 0 });
  };

  const updateGift = (index, field, value) => {
    const updated = [...form.gifts];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, gifts: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.images.length === 0) {
      alert('At least 1 image required');
      return;
    }
    if (!form.category) {
      alert('Please select a category');
      return;
    }

    setSaving(true);
    setMsg('');

    const payload = {
      name: form.name,
      description: form.description,
      price: +form.price,
      originalPrice: form.originalPrice ? +form.originalPrice : undefined,
      category: form.category,
      brand: form.brand,
      gst: +form.gst || 0,             // ✅ NEW
      condition: form.condition,       // ✅ NEW
      dealerRate: +form.dealerRate || 0, 
      images: form.images,
      images: form.images,
      image: form.images[0],
      countInStock: +form.countInStock,
      rating: +form.rating || 0,
      numReviews: +form.numReviews || 0,
      hasGift: form.gifts.length > 0,
      gifts: form.gifts
    };

    try {
      if (editing) {
        await axios.put(`https://digital-backend-phi.vercel.app/api/products/${editing}`, payload, { headers });
        setMsg('✅ Product updated');
      } else {
        await axios.post('https://digital-backend-phi.vercel.app/api/products', payload, { headers });
        setMsg('✅ Product added');
      }
      setShow(false);
      loadProducts();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`https://digital-backend-phi.vercel.app/api/products/${id}`, { headers });
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  // ✅ View modal images
  const viewingImages =
    viewing?.images && viewing.images.length > 0
      ? viewing.images
      : viewing?.image
      ? [viewing.image]
      : [];

  const viewingStock = viewing ? getStockStatus(viewing.countInStock) : null;

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
                Product Management
              </h2>
              <p className="text-muted small mb-0" style={{ color: '#6b7280' }}>
                Manage your product catalog, stock & gifts
              </p>
            </div>
            <button onClick={openAdd} style={primaryBtn}>
              + Add Product
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
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>
                Total Products
              </div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>
                {stats.total}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: '3px solid #16a34a', borderRadius: '10px' }}>
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>
                In Stock
              </div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>
                {stats.inStock}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: '3px solid #f59e0b', borderRadius: '10px' }}>
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>
                Low Stock
              </div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>
                {stats.lowStock}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: '3px solid #dc2626', borderRadius: '10px' }}>
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>
                Out of Stock
              </div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>
                {stats.outOfStock}
              </div>
            </div>
          </Col>
        </Row>

        {/* FILTERS */}
        <div className="mb-3 p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
          <Row className="g-2 align-items-center">
            <Col xs={12} md={4}>
              <Form.Control
                placeholder="Search by name or brand..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={inputStyle}
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={inputStyle}>
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c._id} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select value={filterStock} onChange={e => setFilterStock(e.target.value)} style={inputStyle}>
                <option value="All">All Stock</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock (≤ {LOW_STOCK_THRESHOLD})</option>
                <option value="Out of Stock">Out of Stock</option>
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

        {/* PRODUCTS LIST */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: '#1e40af' }} />
              <p className="mt-3 text-muted small mb-0">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
              <p className="text-muted small mb-0">
                No products yet. Click <strong>+ Add Product</strong> to get started.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <p className="text-muted small mb-2">No products match your filters.</p>
              <button onClick={resetFilters} className="border-0 bg-transparent fw-semibold small" style={{ color: '#1e40af', cursor: 'pointer' }}>
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
                      {['Product', 'Category', 'Price', 'Stock', 'Gifts', 'Actions'].map((h, i) => (
                        <th
                          key={h}
                          className={`border-0 fw-semibold ${i === 5 ? 'text-end' : ''}`}
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
                    {paginatedProducts.map(p => {
                      const stock = getStockStatus(p.countInStock);
                      return (
                        <tr key={p._id}>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  background: '#f9fafb',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '10px',
                                  padding: '4px'
                                }}
                              >
                                <img
                                  src={p.image || p.images?.[0]}
                                  alt=""
                                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  className="fw-semibold text-truncate"
                                  style={{ color: '#111827', fontSize: '0.9rem', maxWidth: '240px' }}
                                >
                                  {p.name}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {p.brand || 'No brand'}
                                  {p.images?.length > 1 && (
                                    <span
                                      className="ms-2 fw-semibold"
                                      style={{
                                        background: '#eff6ff',
                                        color: '#1e40af',
                                        fontSize: '0.65rem',
                                        padding: '2px 6px',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      {p.images.length} imgs
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                background: '#f3f4f6',
                                color: '#374151',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                padding: '4px 10px',
                                borderRadius: '6px'
                              }}
                            >
                              {p.category}
                            </span>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div className="fw-semibold" style={{ color: '#111827', fontSize: '0.9rem' }}>
                              ₹{Number(p.price).toLocaleString()}
                            </div>
                            {p.originalPrice && (
                              <div className="text-muted text-decoration-line-through" style={{ fontSize: '0.72rem' }}>
                                ₹{Number(p.originalPrice).toLocaleString()}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div className="d-flex flex-column gap-1">
                              <span
                                className="fw-semibold d-inline-flex align-items-center gap-1"
                                style={{
                                  background: stock.bg,
                                  color: stock.color,
                                  fontSize: '0.7rem',
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  lineHeight: 1,
                                  width: 'fit-content'
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: stock.dot }} />
                                {stock.label}
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Qty: {p.countInStock}
                              </span>
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            {p.hasGift && p.gifts?.length > 0 ? (
                              <span
                                className="fw-semibold"
                                style={{
                                  background: '#eff6ff',
                                  color: '#1e40af',
                                  fontSize: '0.72rem',
                                  padding: '4px 10px',
                                  borderRadius: '6px'
                                }}
                              >
                                🎁 {p.gifts.length}
                              </span>
                            ) : (
                              <span className="text-muted" style={{ fontSize: '0.75rem' }}>—</span>
                            )}
                          </td>

                          <td className="text-end" style={{ padding: '0.85rem 1rem' }}>
                            <div className="d-inline-flex gap-1">
                              {/* ✅ View button */}
                              <button
                                onClick={() => openView(p)}
                                title="View Details"
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
                              <button
                                onClick={() => openEdit(p)}
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
                                onClick={() => handleDelete(p._id)}
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
                {paginatedProducts.map(p => {
                  const stock = getStockStatus(p.countInStock);
                  return (
                    <div
                      key={p._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '0.85rem'
                      }}
                    >
                      <div className="d-flex gap-3 mb-3">
                        <div
                          className="d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: '56px',
                            height: '56px',
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            padding: '4px'
                          }}
                        >
                          <img
                            src={p.image || p.images?.[0]}
                            alt=""
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="fw-semibold text-truncate" style={{ color: '#111827', fontSize: '0.9rem' }}>
                            {p.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {p.brand || 'No brand'} · {p.category}
                          </div>
                          <div className="fw-semibold mt-1" style={{ color: '#111827', fontSize: '0.9rem' }}>
                            ₹{Number(p.price).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className="fw-semibold d-inline-flex align-items-center gap-1 flex-shrink-0"
                          style={{
                            background: stock.bg,
                            color: stock.color,
                            fontSize: '0.65rem',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            lineHeight: 1,
                            height: 'fit-content'
                          }}
                        >
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: stock.dot }} />
                          {stock.label}
                        </span>
                      </div>

                      <div
                        className="d-flex align-items-center justify-content-between gap-2 pt-2"
                        style={{ borderTop: '1px solid #f3f4f6' }}
                      >
                        <div className="d-flex gap-2">
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
                            Qty: {p.countInStock}
                          </span>
                          {p.hasGift && p.gifts?.length > 0 && (
                            <span
                              className="fw-semibold"
                              style={{
                                background: '#eff6ff',
                                color: '#1e40af',
                                fontSize: '0.7rem',
                                padding: '3px 8px',
                                borderRadius: '6px'
                              }}
                            >
                              🎁 {p.gifts.length}
                            </span>
                          )}
                        </div>

                        <div className="d-flex gap-1">
                          <button
                            onClick={() => openView(p)}
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
                          <button
                            onClick={() => openEdit(p)}
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
                            onClick={() => handleDelete(p._id)}
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
                    <strong style={{ color: '#111827' }}>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> –{' '}
                    <strong style={{ color: '#111827' }}>
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                    </strong>{' '}
                    of <strong style={{ color: '#111827' }}>{filteredProducts.length}</strong>
                  </div>

                  <Pagination className="mb-0" size="sm">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    />
                    {pageNumbers[0] > 1 && (
                      <>
                        <Pagination.Item onClick={() => setCurrentPage(1)} active={currentPage === 1}>
                          1
                        </Pagination.Item>
                        {pageNumbers[0] > 2 && <Pagination.Ellipsis disabled />}
                      </>
                    )}
                    {pageNumbers.map(p => (
                      <Pagination.Item key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>
                        {p}
                      </Pagination.Item>
                    ))}
                    {pageNumbers[pageNumbers.length - 1] < totalPages && (
                      <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <Pagination.Ellipsis disabled />}
                        <Pagination.Item onClick={() => setCurrentPage(totalPages)} active={currentPage === totalPages}>
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
          VIEW PRODUCT MODAL
      ═══════════════════════════════════════════ */}
      <Modal
        show={showView}
        onHide={() => setShowView(false)}
        size="lg"
        centered
        contentClassName="border-0"
        scrollable
      >
        {viewing && (
          <>
            <Modal.Header closeButton className="border-0">
              <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
                Product Details
              </Modal.Title>
            </Modal.Header>

            <Modal.Body className="pt-0">
              <Row className="g-3">
                {/* Image gallery */}
                <Col xs={12} md={5}>
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      height: '240px',
                      padding: '16px'
                    }}
                  >
                    {viewingImages.length > 0 ? (
                      <img
                        src={viewingImages[viewingImageIndex]}
                        alt={viewing.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <span className="text-muted small">No image</span>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {viewingImages.length > 1 && (
                    <div className="d-flex gap-2 justify-content-center flex-wrap mt-2">
                      {viewingImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setViewingImageIndex(idx)}
                          style={{
                            width: '48px',
                            height: '48px',
                            border:
                              viewingImageIndex === idx
                                ? '2px solid #3b82f6'
                                : '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '3px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#ffffff'
                          }}
                        >
                          <img
                            src={img}
                            alt={`thumb-${idx}`}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Col>

                {/* Details */}
                <Col xs={12} md={7}>
                  {/* Category eyebrow */}
                  <div
                    className="fw-semibold text-uppercase mb-1"
                    style={{
                      fontSize: '0.62rem',
                      letterSpacing: '0.12em',
                      color: '#3b82f6'
                    }}
                  >
                    {viewing.category}
                  </div>

                  <h6
                    className="fw-bold mb-2"
                    style={{ color: '#111827', fontSize: '1.05rem' }}
                  >
                    {viewing.name}
                  </h6>

                  {viewing.brand && (
                    <div
                      className="mb-2"
                      style={{ color: '#6b7280', fontSize: '0.82rem' }}
                    >
                      Brand: <span style={{ color: '#111827', fontWeight: 600 }}>{viewing.brand}</span>
                    </div>
                  )}

                  {/* Stock badge */}
                  <div className="mb-3">
                    <span
                      className="fw-semibold d-inline-flex align-items-center gap-1"
                      style={{
                        background: viewingStock.bg,
                        color: viewingStock.color,
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
                          background: viewingStock.dot
                        }}
                      />
                      {viewingStock.label} · Qty {viewing.countInStock}
                    </span>
                  </div>

                  {/* Price */}
                  <div
                    className="p-3 mb-3"
                    style={{
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px'
                    }}
                  >
                    <div className="d-flex align-items-baseline gap-3 flex-wrap">
                      <span
                        className="fw-bold"
                        style={{ color: '#111827', fontSize: '1.3rem' }}
                      >
                        ₹{Number(viewing.price).toLocaleString()}
                      </span>
                      {viewing.originalPrice && (
                        <span
                          className="text-decoration-line-through"
                          style={{ color: '#9ca3af', fontSize: '0.9rem' }}
                        >
                          ₹{Number(viewing.originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {viewing.description && (
                    <div className="mb-3">
                      <div
                        className="fw-semibold text-uppercase mb-1"
                        style={{
                          fontSize: '0.62rem',
                          letterSpacing: '0.1em',
                          color: '#6b7280'
                        }}
                      >
                        Description
                      </div>
                      <div
                        style={{
                          color: '#374151',
                          fontSize: '0.85rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {viewing.description}
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  {(viewing.rating > 0 || viewing.numReviews > 0) && (
                    <div className="mb-3" style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                      ⭐ {viewing.rating || 0} · {viewing.numReviews || 0} reviews
                    </div>
                  )}

                  {/* Gifts */}
                  {viewing.hasGift && viewing.gifts?.length > 0 && (
                    <div
                      className="p-3"
                      style={{
                        background: '#eff6ff',
                        border: '1px dashed #bfdbfe',
                        borderRadius: '10px'
                      }}
                    >
                      <div
                        className="fw-semibold text-uppercase mb-2 d-flex align-items-center gap-2"
                        style={{
                          fontSize: '0.62rem',
                          letterSpacing: '0.1em',
                          color: '#1e40af'
                        }}
                      >
                        🎁 Free Gifts ({viewing.gifts.length})
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {viewing.gifts.map((g, i) => (
                          <div
                            key={i}
                            className="d-flex align-items-center gap-2"
                            style={{ fontSize: '0.82rem' }}
                          >
                            {g.image && (
                              <div
                                className="d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  background: '#ffffff',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  padding: '2px'
                                }}
                              >
                                <img
                                  src={g.image}
                                  alt={g.name}
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                  }}
                                />
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div
                                className="fw-semibold"
                                style={{ color: '#111827' }}
                              >
                                {g.name}
                              </div>
                              {g.value > 0 && (
                                <div
                                  style={{ color: '#1e40af', fontSize: '0.75rem' }}
                                >
                                  Worth ₹{Number(g.value).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
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
                onClick={() => {
                  setShowView(false);
                  openEdit(viewing);
                }}
                className="fw-semibold border-0"
                style={primaryBtn}
              >
                ✏️ Edit Product
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* ADD/EDIT MODAL */}
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="xl"
        centered
        contentClassName="border-0"
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
            {editing ? 'Edit Product' : 'Add Product'}
          </Modal.Title>
        </Modal.Header>

        <Form
          onSubmit={handleSave}
          style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
        >
          <Modal.Body
            className="pt-0"
            style={{
              maxHeight: '70vh',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            <Row className="g-3">
              {/* BASIC INFO */}
              <Col xs={12} md={8}>
                <Form.Label style={labelStyle}>
                  Product Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., iPhone 15 Pro"
                  style={inputStyle}
                />
              </Col>
              <Col xs={12} md={4}>
                <Form.Label style={labelStyle}>Brand</Form.Label>
                <Form.Select
                  value={form.brand}
                  onChange={e => setForm({ ...form, brand: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">-- Select Brand --</option>
                  {brands.map(b => (
                    <option key={b._id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col xs={12}>
                <Form.Label style={labelStyle}>
                  Description <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </Col>

              <Col xs={12} md={4}>
                <Form.Label style={labelStyle}>
                  Category <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  required
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c._id} value={c.name}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </Form.Select>
                {categories.length === 0 && (
                  <Form.Text className="text-warning small">
                    No categories. Add from Categories page first.
                  </Form.Text>
                )}
              </Col>

              {/* ✅ NEW: Dealer Rate */}
              <Col xs={6} md={2}>
                <Form.Label style={labelStyle}>
                  Dealer Rate <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={form.dealerRate}
                  onChange={e => setForm({ ...form, dealerRate: e.target.value })}
                  placeholder="e.g. 35000"
                  style={inputStyle}
                />
              </Col>

              <Col xs={6} md={2}>
                <Form.Label style={labelStyle}>Original Price</Form.Label>
                <Form.Control
                  type="number"
                  value={form.originalPrice}
                  onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                  style={inputStyle}
                />
              </Col>

              <Col xs={6} md={2}>
                <Form.Label style={labelStyle}>
                  Price <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  required
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  style={inputStyle}
                />
              </Col>
              
              {/* ✅ GST Field */}
              <Col xs={6} md={2}>
                <Form.Label style={labelStyle}>GST %</Form.Label>
                <Form.Select
                  value={form.gst}
                  onChange={e => setForm({ ...form, gst: e.target.value })}
                  style={inputStyle}
                >
                  <option value={0}>No GST</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </Form.Select>
              </Col>

              {/* ✅ Condition Field */}
              <Col xs={6} md={2}>
                <Form.Label style={labelStyle}>Condition</Form.Label>
                <Form.Select
                  value={form.condition}
                  onChange={e => setForm({ ...form, condition: e.target.value })}
                  style={inputStyle}
                >
                  <option value="New">🆕 New</option>
                  <option value="Second Hand">♻️ Second Hand</option>
                </Form.Select>
              </Col>
              <Col xs={6} md={2}>
                <Form.Label style={labelStyle}>
                  Stock <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  required
                  value={form.countInStock}
                  onChange={e => setForm({ ...form, countInStock: e.target.value })}
                  style={inputStyle}
                />
              </Col>
              <Col xs={6} md={2}>
                <Form.Label style={labelStyle}>Rating</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={e => setForm({ ...form, rating: e.target.value })}
                  style={inputStyle}
                />
              </Col>

              {/* IMAGES */}
              <Col xs={12}>
                <div
                  className="p-3"
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="fw-bold" style={{ color: '#111827', fontSize: '0.9rem' }}>
                        🖼️ Product Images <span className="text-danger">*</span>
                      </div>
                      <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Upload up to 5 images. First image will be main.
                      </small>
                    </div>
                    <span
                      className="fw-semibold"
                      style={{
                        background: '#eff6ff',
                        color: '#1e40af',
                        fontSize: '0.7rem',
                        padding: '3px 10px',
                        borderRadius: '20px'
                      }}
                    >
                      {form.images.length}/5
                    </span>
                  </div>

                  <Row className="g-2">
                    {form.images.map((url, index) => (
                      <Col xs={6} md={3} key={index}>
                        <div
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              height: '110px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px',
                              background: '#f9fafb'
                            }}
                          >
                            <img
                              src={url}
                              alt={`img-${index}`}
                              style={{
                                maxHeight: '100%',
                                maxWidth: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          </div>
                          <div className="p-2">
                            <div className="d-flex gap-1">
                              <button
                                type="button"
                                onClick={() => moveImage(index, -1)}
                                disabled={index === 0}
                                className="border-0 fw-bold"
                                style={{
                                  flex: 1,
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: '#f3f4f6',
                                  color: '#374151',
                                  fontSize: '0.75rem',
                                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                                  opacity: index === 0 ? 0.4 : 1
                                }}
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImage(index, 1)}
                                disabled={index === form.images.length - 1}
                                className="border-0 fw-bold"
                                style={{
                                  flex: 1,
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: '#f3f4f6',
                                  color: '#374151',
                                  fontSize: '0.75rem',
                                  cursor:
                                    index === form.images.length - 1
                                      ? 'not-allowed'
                                      : 'pointer',
                                  opacity:
                                    index === form.images.length - 1 ? 0.4 : 1
                                }}
                              >
                                →
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="border-0 fw-bold"
                                style={{
                                  flex: 1,
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  border: '1px solid #fecaca'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                            {index === 0 && (
                              <div
                                className="text-center mt-1 fw-semibold"
                                style={{ color: '#16a34a', fontSize: '0.65rem' }}
                              >
                                ● Main
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                    ))}

                    {form.images.length < 5 && (
                      <Col xs={6} md={3}>
                        <div
                          style={{
                            border: '1px dashed #d1d5db',
                            borderRadius: '10px',
                            padding: '8px',
                            background: '#ffffff',
                            height: '100%'
                          }}
                        >
                          <ImageUpload
                            label={`Add Image ${form.images.length + 1}`}
                            value=""
                            onChange={addImage}
                            height={110}
                          />
                        </div>
                      </Col>
                    )}
                  </Row>

                  {form.images.length === 0 && (
                    <Alert variant="warning" className="mt-3 mb-0 small py-2">
                      ⚠️ At least 1 image required
                    </Alert>
                  )}
                </div>
              </Col>

              {/* GIFTS */}
              <Col xs={12}>
                <div
                  className="p-3"
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="fw-bold" style={{ color: '#111827', fontSize: '0.9rem' }}>
                        🎁 Free Gifts
                      </div>
                      <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Add one or more gifts with this product
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={addGift}
                      style={{
                        background: '#ffffff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      + Add Gift
                    </button>
                  </div>

                  {form.gifts.length === 0 ? (
                    <div
                      className="text-center py-3"
                      style={{
                        background: '#ffffff',
                        border: '1px dashed #d1d5db',
                        borderRadius: '8px',
                        color: '#6b7280',
                        fontSize: '0.8rem'
                      }}
                    >
                      No gifts added yet
                    </div>
                  ) : (
                    form.gifts.map((gift, index) => (
                      <div
                        key={index}
                        className="mb-2 p-3"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span
                            className="fw-semibold"
                            style={{
                              background: '#eff6ff',
                              color: '#1e40af',
                              fontSize: '0.72rem',
                              padding: '3px 10px',
                              borderRadius: '20px'
                            }}
                          >
                            🎁 Gift {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeGift(index)}
                            className="border-0"
                            style={{
                              background: '#fef2f2',
                              color: '#dc2626',
                              fontSize: '0.72rem',
                              padding: '3px 10px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: '1px solid #fecaca'
                            }}
                          >
                            🗑️ Remove
                          </button>
                        </div>

                        <Row className="g-2">
                          <Col xs={12} md={6}>
                            <Form.Label style={{ ...labelStyle, fontSize: '0.75rem' }}>
                              Gift Name *
                            </Form.Label>
                            <Form.Control
                              size="sm"
                              value={gift.name}
                              onChange={e => updateGift(index, 'name', e.target.value)}
                              placeholder="e.g., Free AirPods"
                              style={{ ...inputStyle, fontSize: '0.85rem' }}
                            />
                          </Col>
                          <Col xs={6} md={3}>
                            <Form.Label style={{ ...labelStyle, fontSize: '0.75rem' }}>
                              Value ₹
                            </Form.Label>
                            <Form.Control
                              size="sm"
                              type="number"
                              value={gift.value}
                              onChange={e => updateGift(index, 'value', +e.target.value)}
                              style={{ ...inputStyle, fontSize: '0.85rem' }}
                            />
                          </Col>
                          <Col xs={6} md={3}>
                            <Form.Label style={{ ...labelStyle, fontSize: '0.75rem' }}>
                              Min Qty
                            </Form.Label>
                            <Form.Control
                              size="sm"
                              type="number"
                              min="1"
                              value={gift.minQuantity}
                              onChange={e =>
                                updateGift(index, 'minQuantity', +e.target.value)
                              }
                              style={{ ...inputStyle, fontSize: '0.85rem' }}
                            />
                          </Col>
                          <Col xs={12}>
                            <Form.Label style={{ ...labelStyle, fontSize: '0.75rem' }}>
                              Description
                            </Form.Label>
                            <Form.Control
                              size="sm"
                              value={gift.description}
                              onChange={e =>
                                updateGift(index, 'description', e.target.value)
                              }
                              placeholder="e.g., Wireless earbuds worth ₹1999"
                              style={{ ...inputStyle, fontSize: '0.85rem' }}
                            />
                          </Col>
                          <Col xs={12}>
                            <ImageUpload
                              label={`Gift ${index + 1} Image (optional)`}
                              value={gift.image || ''}
                              onChange={url => updateGift(index, 'image', url)}
                              height={100}
                            />
                          </Col>
                        </Row>
                      </div>
                    ))
                  )}
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
              disabled={saving || form.images.length === 0 || !form.category}
              className="fw-semibold border-0"
              style={primaryBtn}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Saving...
                </>
              ) : editing ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}