import { useEffect, useState } from 'react';
import {
  Container, Card, Form, Button, Row, Col, Alert,
  Tabs, Tab, Badge, Table, Modal, Spinner
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import ImageUpload from '../../../components/ImageUpload';

const EMPTY_FEATURE = {
  icon: '✨',
  title: '',
  description: '',
  color: '#e3f2fd',
  order: 0
};

export default function SiteSettings() {
  const [form, setForm] = useState({
    address: {},
    heroSlides: [],
    features: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeatureIndex, setEditingFeatureIndex] = useState(null);
  const [featureForm, setFeatureForm] = useState(EMPTY_FEATURE);

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios
      .get('https://digitalworldkopargaonbackend.vercel.app/api/site-settings')
      .then(res => {
        const data = res.data;
        setForm({
          ...data,
          address: data.address || {},
          heroSlides: data.heroSlides || [],
          features: data.features || []
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setForm({ ...form, address: { ...form.address, [key]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ═══════════════════════════════════════════
  // HERO SLIDES
  // ═══════════════════════════════════════════
  const addSlide = () => {
    setForm({
      ...form,
      heroSlides: [
        ...form.heroSlides,
        {
          title: '',
          subtitle: '',
          imageUrl: '',
          ctaText: 'Shop Now',
          ctaLink: '/',
          order: form.heroSlides.length
        }
      ]
    });
  };

  const removeSlide = (index) => {
    if (!window.confirm('Delete this slide?')) return;
    const updated = form.heroSlides.filter((_, i) => i !== index);
    updated.forEach((s, i) => (s.order = i));
    setForm({ ...form, heroSlides: updated });
  };

  const updateSlide = (index, field, value) => {
    const updated = [...form.heroSlides];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, heroSlides: updated });
  };

  const moveSlide = (index, direction) => {
    const updated = [...form.heroSlides];
    const target = index + direction;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    updated.forEach((s, i) => (s.order = i));
    setForm({ ...form, heroSlides: updated });
  };

  // ═══════════════════════════════════════════
  // FEATURES
  // ═══════════════════════════════════════════
  const openAddFeature = () => {
    setEditingFeatureIndex(null);
    setFeatureForm({ ...EMPTY_FEATURE, order: form.features.length });
    setShowFeatureModal(true);
  };

  const openEditFeature = (index) => {
    setEditingFeatureIndex(index);
    setFeatureForm({ ...form.features[index] });
    setShowFeatureModal(true);
  };

  const handleFeatureSave = (e) => {
    e.preventDefault();
    if (!featureForm.title.trim()) {
      alert('Title is required');
      return;
    }

    const updated = [...form.features];
    if (editingFeatureIndex !== null) {
      updated[editingFeatureIndex] = {
        ...featureForm,
        order: editingFeatureIndex
      };
    } else {
      updated.push({
        ...featureForm,
        order: updated.length
      });
    }

    updated.forEach((f, i) => (f.order = i));
    setForm({ ...form, features: updated });
    setShowFeatureModal(false);
    setFeatureForm(EMPTY_FEATURE);
    setEditingFeatureIndex(null);
  };

  const addPresetFeatures = () => {
    const presets = [
      { icon: '🚚', title: 'Free Delivery', description: 'On orders above ₹500', color: '#e3f2fd' },
      { icon: '↩️', title: 'Easy Returns', description: '7-day return policy', color: '#f3e5f5' },
      { icon: '🔒', title: 'Secure Payment', description: '100% safe transactions', color: '#e8f5e9' },
      { icon: '🎁', title: 'Gift Offers', description: 'Free gifts with purchase', color: '#fce4ec' },
      { icon: '📞', title: '24/7 Support', description: 'Always here to help', color: '#e0f7fa' }
    ];
    const newFeatures = presets.map((f, i) => ({
      ...f,
      order: form.features.length + i
    }));
    setForm({ ...form, features: [...form.features, ...newFeatures] });
  };

  const removeFeature = (index) => {
    if (!window.confirm('Delete this feature?')) return;
    const updated = form.features.filter((_, i) => i !== index);
    updated.forEach((f, i) => (f.order = i));
    setForm({ ...form, features: updated });
  };

  const moveFeature = (index, direction) => {
    const updated = [...form.features];
    const target = index + direction;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    updated.forEach((f, i) => (f.order = i));
    setForm({ ...form, features: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await axios.put('https://digitalworldkopargaonbackend.vercel.app/api/site-settings', form, { headers });
      setMsg('✅ Settings saved successfully!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════
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
          <p className="mt-3 text-muted small">Loading settings...</p>
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
        {/* Header */}
        <div className="mb-4">
          <h2
            className="fw-bold mb-1"
            style={{
              color: '#0f172a',
              fontSize: 'clamp(1.4rem, 3.5vw, 1.75rem)',
              letterSpacing: '-0.02em'
            }}
          >
            Site Settings
          </h2>
          <p className="text-muted small mb-0">
            Manage your website content, features & information
          </p>
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

        <Form onSubmit={handleSubmit}>
          <Tabs
            defaultActiveKey="hero"
            className="mb-4 site-settings-tabs"
            style={{ borderBottom: '1px solid #e2e8f0' }}
          >
            {/* ═══════════════════════════════════════════
                HERO SLIDERS TAB
            ═══════════════════════════════════════════ */}
            <Tab eventKey="hero" title="🎬 Hero Sliders">
              <Card
                className="border-0"
                style={{
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Card.Body className="p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                      <h6
                        className="fw-bold mb-1"
                        style={{ color: '#0f172a', fontSize: '1rem' }}
                      >
                        Hero Slider Content
                      </h6>
                      <p className="text-muted small mb-0">
                        Upload images + set title, subtitle, button text/link
                      </p>
                    </div>
                    <Button
                      onClick={addSlide}
                      className="fw-semibold border-0"
                      style={{
                        background: '#1e40af',
                        color: '#ffffff',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        padding: '0.5rem 1.1rem'
                      }}
                    >
                      + Add Slide
                    </Button>
                  </div>

                  {form.heroSlides.length === 0 ? (
                    <div
                      className="text-center py-5"
                      style={{
                        background: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        🎬
                      </div>
                      <p className="text-muted small mb-0">
                        No slides yet. Click "+ Add Slide" to add your first hero slide.
                      </p>
                    </div>
                  ) : (
                    form.heroSlides.map((slide, index) => (
                      <div
                        key={index}
                        className="mb-3"
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '1rem'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="fw-bold d-flex align-items-center justify-content-center"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: '#1e40af',
                                color: '#ffffff',
                                fontSize: '0.85rem'
                              }}
                            >
                              {index + 1}
                            </span>
                            <span
                              className="fw-semibold"
                              style={{ color: '#0f172a', fontSize: '0.9rem' }}
                            >
                              Slide {index + 1}
                            </span>
                          </div>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => moveSlide(index, -1)}
                              disabled={index === 0}
                              style={{ borderRadius: '8px', fontSize: '0.75rem' }}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => moveSlide(index, 1)}
                              disabled={index === form.heroSlides.length - 1}
                              style={{ borderRadius: '8px', fontSize: '0.75rem' }}
                            >
                              ↓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => removeSlide(index)}
                              style={{ borderRadius: '8px', fontSize: '0.75rem' }}
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                        </div>

                        <Row className="g-3">
                          <Col xs={12} md={6}>
                            <Form.Group>
                              <Form.Label
                                className="fw-semibold small"
                                style={{ color: '#334155' }}
                              >
                                Title
                              </Form.Label>
                              <Form.Control
                                value={slide.title}
                                onChange={(e) => updateSlide(index, 'title', e.target.value)}
                                placeholder="e.g., Digital World"
                                style={{
                                  background: '#ffffff',
                                  borderColor: '#e2e8f0',
                                  borderRadius: '10px',
                                  fontSize: '0.9rem'
                                }}
                              />
                            </Form.Group>
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Group>
                              <Form.Label
                                className="fw-semibold small"
                                style={{ color: '#334155' }}
                              >
                                Subtitle
                              </Form.Label>
                              <Form.Control
                                value={slide.subtitle}
                                onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                                placeholder="e.g., The Computer Zone"
                                style={{
                                  background: '#ffffff',
                                  borderColor: '#e2e8f0',
                                  borderRadius: '10px',
                                  fontSize: '0.9rem'
                                }}
                              />
                            </Form.Group>
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Group>
                              <Form.Label
                                className="fw-semibold small"
                                style={{ color: '#334155' }}
                              >
                                Button Text
                              </Form.Label>
                              <Form.Control
                                value={slide.ctaText}
                                onChange={(e) => updateSlide(index, 'ctaText', e.target.value)}
                                placeholder="e.g., Shop Now"
                                style={{
                                  background: '#ffffff',
                                  borderColor: '#e2e8f0',
                                  borderRadius: '10px',
                                  fontSize: '0.9rem'
                                }}
                              />
                            </Form.Group>
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Group>
                              <Form.Label
                                className="fw-semibold small"
                                style={{ color: '#334155' }}
                              >
                                Button Link
                              </Form.Label>
                              <Form.Control
                                value={slide.ctaLink}
                                onChange={(e) => updateSlide(index, 'ctaLink', e.target.value)}
                                placeholder="e.g., /?category=Laptops"
                                style={{
                                  background: '#ffffff',
                                  borderColor: '#e2e8f0',
                                  borderRadius: '10px',
                                  fontSize: '0.9rem'
                                }}
                              />
                            </Form.Group>
                          </Col>
                          <Col xs={12}>
                            <ImageUpload
                              label={`Slide ${index + 1} Background Image`}
                              value={slide.imageUrl}
                              onChange={(url) => updateSlide(index, 'imageUrl', url)}
                            />
                          </Col>
                        </Row>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Tab>

            {/* ═══════════════════════════════════════════
                FEATURES TAB
            ═══════════════════════════════════════════ */}
            <Tab eventKey="features" title="✨ Features">
              <Card
                className="border-0"
                style={{
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Card.Body className="p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                      <h6
                        className="fw-bold mb-1"
                        style={{ color: '#0f172a', fontSize: '1rem' }}
                      >
                        Feature Highlights
                      </h6>
                      <p className="text-muted small mb-0">
                        "Why Choose Us" cards on homepage
                      </p>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="outline-primary"
                        onClick={addPresetFeatures}
                        className="fw-semibold"
                        style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                      >
                        ⚡ Add Default 5
                      </Button>
                      <Button
                        onClick={openAddFeature}
                        className="fw-semibold border-0"
                        style={{
                          background: '#1e40af',
                          color: '#ffffff',
                          borderRadius: '10px',
                          fontSize: '0.85rem'
                        }}
                      >
                        + Add Feature
                      </Button>
                    </div>
                  </div>

                  {form.features.length === 0 ? (
                    <div
                      className="text-center py-5"
                      style={{
                        background: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        ✨
                      </div>
                      <p className="text-muted small mb-0">
                        No features yet. Click "+ Add Feature" or "⚡ Add Default 5" for quick setup.
                      </p>
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
                            <th
                              className="border-0 fw-semibold"
                              style={{
                                color: '#64748b',
                                fontSize: '0.7rem',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                width: '50px'
                              }}
                            >
                              #
                            </th>
                            <th
                              className="border-0 fw-semibold"
                              style={{
                                color: '#64748b',
                                fontSize: '0.7rem',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                width: '70px'
                              }}
                            >
                              Icon
                            </th>
                            <th
                              className="border-0 fw-semibold"
                              style={{
                                color: '#64748b',
                                fontSize: '0.7rem',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase'
                              }}
                            >
                              Title
                            </th>
                            <th
                              className="border-0 fw-semibold d-none d-md-table-cell"
                              style={{
                                color: '#64748b',
                                fontSize: '0.7rem',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase'
                              }}
                            >
                              Description
                            </th>
                            <th
                              className="border-0 fw-semibold d-none d-lg-table-cell"
                              style={{
                                color: '#64748b',
                                fontSize: '0.7rem',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                width: '70px'
                              }}
                            >
                              Color
                            </th>
                            <th
                              className="border-0 fw-semibold text-end"
                              style={{
                                color: '#64748b',
                                fontSize: '0.7rem',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                width: '180px'
                              }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.features.map((feature, index) => (
                            <tr key={index}>
                              <td className="text-muted">{index + 1}</td>
                              <td>
                                <div
                                  style={{
                                    width: '44px',
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '10px',
                                    background: feature.color || '#f0f0f0',
                                    fontSize: '1.3rem'
                                  }}
                                >
                                  {feature.icon || '✨'}
                                </div>
                              </td>
                              <td>
                                <div
                                  className="fw-semibold"
                                  style={{ color: '#0f172a', fontSize: '0.85rem' }}
                                >
                                  {feature.title || '-'}
                                </div>
                              </td>
                              <td className="d-none d-md-table-cell">
                                <small style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                  {feature.description || '-'}
                                </small>
                              </td>
                              <td className="d-none d-lg-table-cell">
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: feature.color,
                                    border: '1px solid #e2e8f0'
                                  }}
                                />
                              </td>
                              <td className="text-end">
                                <div className="d-inline-flex gap-1">
                                  <button
                                    onClick={() => moveFeature(index, -1)}
                                    disabled={index === 0}
                                    title="Move up"
                                    className="border-0 d-flex align-items-center justify-content-center"
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '6px',
                                      background: '#f1f5f9',
                                      color: '#475569',
                                      fontSize: '0.75rem',
                                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                                      opacity: index === 0 ? 0.4 : 1
                                    }}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    onClick={() => moveFeature(index, 1)}
                                    disabled={index === form.features.length - 1}
                                    title="Move down"
                                    className="border-0 d-flex align-items-center justify-content-center"
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '6px',
                                      background: '#f1f5f9',
                                      color: '#475569',
                                      fontSize: '0.75rem',
                                      cursor:
                                        index === form.features.length - 1
                                          ? 'not-allowed'
                                          : 'pointer',
                                      opacity:
                                        index === form.features.length - 1 ? 0.4 : 1
                                    }}
                                  >
                                    ↓
                                  </button>
                                  <button
                                    onClick={() => openEditFeature(index)}
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
                                    onClick={() => removeFeature(index)}
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
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            {/* ═══════════════════════════════════════════
                COMPANY TAB
            ═══════════════════════════════════════════ */}
            <Tab eventKey="company" title="🏢 Company">
              <Card
                className="border-0"
                style={{
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Card.Body className="p-3 p-md-4">
                  <h6
                    className="fw-bold mb-4"
                    style={{ color: '#0f172a', fontSize: '1rem' }}
                  >
                    Company Information
                  </h6>
                  <Row className="g-3">
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Company Name *
                        </Form.Label>
                        <Form.Control
                          name="companyName"
                          value={form.companyName || ''}
                          onChange={handleChange}
                          required
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Tagline
                        </Form.Label>
                        <Form.Control
                          name="tagline"
                          value={form.tagline || ''}
                          onChange={handleChange}
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
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Short Description
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="description"
                          value={form.description || ''}
                          onChange={handleChange}
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
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Established Year
                        </Form.Label>
                        <Form.Control
                          name="establishedYear"
                          value={form.establishedYear || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          GST Number
                        </Form.Label>
                        <Form.Control
                          name="gstNumber"
                          value={form.gstNumber || ''}
                          onChange={handleChange}
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
                      <ImageUpload
                        label="Company Logo"
                        value={form.logoUrl || ''}
                        onChange={(url) => setForm({ ...form, logoUrl: url })}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* ═══════════════════════════════════════════
                ABOUT TAB
            ═══════════════════════════════════════════ */}
            <Tab eventKey="about" title="📖 About">
              <Card
                className="border-0"
                style={{
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Card.Body className="p-3 p-md-4">
                  <h6
                    className="fw-bold mb-4"
                    style={{ color: '#0f172a', fontSize: '1rem' }}
                  >
                    About Us Content
                  </h6>
                  <Form.Group className="mb-3">
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: '#334155' }}
                    >
                      Our Story
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="aboutStory"
                      value={form.aboutStory || ''}
                      onChange={handleChange}
                      style={{
                        background: '#f8fafc',
                        borderColor: '#e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </Form.Group>
                  <Row className="g-3">
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          🎯 Mission
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="mission"
                          value={form.mission || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          👁️ Vision
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="vision"
                          value={form.vision || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          💎 Values
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="values"
                          value={form.values || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* ═══════════════════════════════════════════
                CONTACT TAB
            ═══════════════════════════════════════════ */}
            <Tab eventKey="contact" title="📞 Contact">
              <Card
                className="border-0"
                style={{
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Card.Body className="p-3 p-md-4">
                  <h6
                    className="fw-bold mb-4"
                    style={{ color: '#0f172a', fontSize: '1rem' }}
                  >
                    Contact Information
                  </h6>
                  <Row className="g-3">
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Shop No.
                        </Form.Label>
                        <Form.Control
                          name="address.shopNo"
                          value={form.address?.shopNo || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={8}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Street
                        </Form.Label>
                        <Form.Control
                          name="address.street"
                          value={form.address?.street || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          City
                        </Form.Label>
                        <Form.Control
                          name="address.city"
                          value={form.address?.city || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          State
                        </Form.Label>
                        <Form.Control
                          name="address.state"
                          value={form.address?.state || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Pincode
                        </Form.Label>
                        <Form.Control
                          name="address.pincode"
                          value={form.address?.pincode || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Phone 1
                        </Form.Label>
                        <Form.Control
                          name="phone1"
                          value={form.phone1 || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Phone 2
                        </Form.Label>
                        <Form.Control
                          name="phone2"
                          value={form.phone2 || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Email 1
                        </Form.Label>
                        <Form.Control
                          name="email1"
                          value={form.email1 || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Email 2
                        </Form.Label>
                        <Form.Control
                          name="email2"
                          value={form.email2 || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          WhatsApp
                        </Form.Label>
                        <Form.Control
                          name="whatsapp"
                          value={form.whatsapp || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Working Hours
                        </Form.Label>
                        <Form.Control
                          name="workingHours"
                          value={form.workingHours || ''}
                          onChange={handleChange}
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
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Google Map Embed URL
                        </Form.Label>
                        <Form.Control
                          name="googleMapUrl"
                          value={form.googleMapUrl || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* ═══════════════════════════════════════════
                SOCIAL TAB
            ═══════════════════════════════════════════ */}
            <Tab eventKey="social" title="🔗 Social">
              <Card
                className="border-0"
                style={{
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Card.Body className="p-3 p-md-4">
                  <h6
                    className="fw-bold mb-4"
                    style={{ color: '#0f172a', fontSize: '1rem' }}
                  >
                    Social Media Links
                  </h6>
                  <Row className="g-3">
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          📘 Facebook
                        </Form.Label>
                        <Form.Control
                          name="facebook"
                          value={form.facebook || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          📷 Instagram
                        </Form.Label>
                        <Form.Control
                          name="instagram"
                          value={form.instagram || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          🐦 Twitter
                        </Form.Label>
                        <Form.Control
                          name="twitter"
                          value={form.twitter || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          ▶️ YouTube
                        </Form.Label>
                        <Form.Control
                          name="youtube"
                          value={form.youtube || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          💼 LinkedIn
                        </Form.Label>
                        <Form.Control
                          name="linkedin"
                          value={form.linkedin || ''}
                          onChange={handleChange}
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
                        <Form.Label
                          className="fw-semibold small"
                          style={{ color: '#334155' }}
                        >
                          Footer Text
                        </Form.Label>
                        <Form.Control
                          name="footerText"
                          value={form.footerText || ''}
                          onChange={handleChange}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>

          {/* Save button — sticky on mobile */}
          <div
            className="text-end mt-4"
            style={{
              position: 'sticky',
              bottom: '1rem',
              zIndex: 10
            }}
          >
            <Button
              type="submit"
              disabled={saving}
              className="fw-semibold border-0 d-inline-flex align-items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                boxShadow: '0 6px 20px rgba(30, 64, 175, 0.3)'
              }}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" /> Saving...
                </>
              ) : (
                <>💾 Save Settings</>
              )}
            </Button>
          </div>
        </Form>

        {/* ═══════════════════════════════════════════
            FEATURE ADD/EDIT MODAL
        ═══════════════════════════════════════════ */}
        <Modal
          show={showFeatureModal}
          onHide={() => setShowFeatureModal(false)}
          centered
          contentClassName="border-0"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
              {editingFeatureIndex !== null ? '✏️ Edit Feature' : '➕ Add Feature'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleFeatureSave}>
            <Modal.Body className="pt-0">
              {/* Live Preview */}
              <div
                className="text-center p-4 mb-4"
                style={{
                  background: featureForm.color || '#f0f0f0',
                  borderRadius: '12px'
                }}
              >
                <div style={{ fontSize: '2.5rem' }}>
                  {featureForm.icon || '✨'}
                </div>
                <div
                  className="fw-bold mt-2"
                  style={{ color: '#0f172a', fontSize: '0.95rem' }}
                >
                  {featureForm.title || 'Feature Title'}
                </div>
                <div
                  className="text-muted small"
                  style={{ fontSize: '0.8rem' }}
                >
                  {featureForm.description || 'Description will appear here'}
                </div>
              </div>

              <Row className="g-3">
                <Col xs={4}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: '#334155' }}
                    >
                      Icon
                    </Form.Label>
                    <Form.Control
                      value={featureForm.icon}
                      onChange={(e) =>
                        setFeatureForm({ ...featureForm, icon: e.target.value })
                      }
                      placeholder="🚚"
                      maxLength={4}
                      style={{
                        background: '#f8fafc',
                        borderColor: '#e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col xs={8}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: '#334155' }}
                    >
                      Title *
                    </Form.Label>
                    <Form.Control
                      required
                      value={featureForm.title}
                      onChange={(e) =>
                        setFeatureForm({ ...featureForm, title: e.target.value })
                      }
                      placeholder="e.g., Free Delivery"
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
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: '#334155' }}
                    >
                      Description
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={featureForm.description}
                      onChange={(e) =>
                        setFeatureForm({
                          ...featureForm,
                          description: e.target.value
                        })
                      }
                      placeholder="e.g., On orders above ₹500"
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
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: '#334155' }}
                    >
                      Background Color
                    </Form.Label>
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control
                        type="color"
                        value={featureForm.color}
                        onChange={(e) =>
                          setFeatureForm({ ...featureForm, color: e.target.value })
                        }
                        style={{
                          width: '60px',
                          height: '40px',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      />
                      <Form.Control
                        value={featureForm.color}
                        onChange={(e) =>
                          setFeatureForm({ ...featureForm, color: e.target.value })
                        }
                        placeholder="#e3f2fd"
                        style={{
                          background: '#f8fafc',
                          borderColor: '#e2e8f0',
                          borderRadius: '10px',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button
                variant="light"
                onClick={() => setShowFeatureModal(false)}
                className="fw-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="fw-semibold border-0"
                style={{ background: '#1e40af', color: '#ffffff' }}
              >
                {editingFeatureIndex !== null ? 'Update Feature' : 'Add Feature'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
}