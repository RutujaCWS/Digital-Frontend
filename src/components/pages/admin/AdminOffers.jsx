import { useEffect, useState } from 'react';
import {
  Container, Card, Button, Table, Modal, Form,
  Row, Col, Alert, Badge, Spinner
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import ImageUpload from '../../../components/ImageUpload';

const emptyForm = {
  title: '',
  subtitle: '',
  offerType: 'flat',
  discountValue: '',
  maxDiscount: '',
  minOrderAmount: '',
  minProductPrice: '',
  startDate: '',
  endDate: '',
  appliesTo: 'all',
  categories: [],
  brands: [],
  products: [],
  excludedProducts: [],
  excludedCategories: [],
  excludedBrands: [],
  badge: '🎉 SPECIAL OFFER',
  bannerImage: '',
  isActive: true
};

const primaryBtn = {
  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  padding: '0.5rem 1.1rem',
  fontWeight: 600
};

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    axios.get('https://digital-backend-phi.vercel.app/api/special-offers', { headers })
      .then(r => setOffers(r.data || []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    axios.get('https://digital-backend-phi.vercel.app/api/categories').then(r => setCategories(r.data || [])).catch(() => {});
    axios.get('https://digital-backend-phi.vercel.app/api/brands').then(r => setBrands(r.data || [])).catch(() => {});
    axios.get('https://digital-backend-phi.vercel.app/api/products').then(r => setProducts(r.data || [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ FIX: Add Offer
  const openAdd = () => {
    setForm(emptyForm);
    setEditing(null);
    setShow(true);
  };

  // ✅ FIX: Edit Offer — HE FUNCTION MISSING HOTA
  const openEdit = (offer) => {
    setForm({
      title: offer.title || '',
      subtitle: offer.subtitle || '',
      offerType: offer.offerType || 'flat',
      discountValue: offer.discountValue || '',
      maxDiscount: offer.maxDiscount || '',
      minOrderAmount: offer.minOrderAmount || '',
      minProductPrice: offer.minProductPrice || '',
      startDate: offer.startDate ? offer.startDate.split('T')[0] : '',
      endDate: offer.endDate ? offer.endDate.split('T')[0] : '',
      appliesTo: offer.appliesTo || 'all',
      categories: offer.categories || [],
      brands: offer.brands || [],
      products: offer.products || [],
      excludedProducts: offer.excludedProducts || [],
      excludedCategories: offer.excludedCategories || [],
      excludedBrands: offer.excludedBrands || [],
      badge: offer.badge || '🎉 SPECIAL OFFER',
      bannerImage: offer.bannerImage || '',
      isActive: offer.isActive
    });
    setEditing(offer._id);
    setShow(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        minProductPrice: Number(form.minProductPrice) || 0
      };

      if (editing) {
        await axios.put(`https://digital-backend-phi.vercel.app/api/special-offers/${editing}`, payload, { headers });
        setMsg('✅ Offer updated');
      } else {
        await axios.post('https://digital-backend-phi.vercel.app/api/special-offers', payload, { headers });
        setMsg('✅ Offer created');
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

  const handleToggle = async (id) => {
    try {
      await axios.put(`https://digital-backend-phi.vercel.app/api/special-offers/${id}/toggle`, {}, { headers });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await axios.delete(`https://digital-backend-phi.vercel.app/api/special-offers/${id}`, { headers });
      setMsg('✅ Offer deleted');
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const getStatus = (offer) => {
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);
    if (!offer.isActive) return { label: 'Inactive', color: 'secondary' };
    if (now < start) return { label: 'Scheduled', color: 'info' };
    if (now > end) return { label: 'Expired', color: 'dark' };
    return { label: 'Active', color: 'success' };
  };

  const getOfferText = (offer) => {
    if (offer.offerType === 'flat') return `₹${offer.discountValue} OFF`;
    return `${offer.discountValue}% OFF`;
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '2rem 0 3rem' }}>
      <Container fluid className="px-3 px-md-4" style={{ maxWidth: '1400px' }}>
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: '#111827', fontSize: 'clamp(1.35rem, 3vw, 1.6rem)' }}>
              🎉 Special Offers
            </h2>
            <p className="text-muted small mb-0">
              Create sale events like "Navaratri Sale — ₹500 OFF above ₹20,000"
            </p>
          </div>
          <Button onClick={openAdd} style={primaryBtn}>+ Create Offer</Button>
        </div>

        {msg && <Alert variant="success" className="border-0 small" style={{ borderRadius: '10px' }}>{msg}</Alert>}

        {loading ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5"><Spinner animation="border" /></Card.Body>
          </Card>
        ) : offers.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5 text-muted">
              <div style={{ fontSize: '3rem' }}>🎉</div>
              <p className="mt-3 mb-0">No offers yet. Click <strong>+ Create Offer</strong> to add.</p>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Offer</th>
                  <th>Condition</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(o => {
                  const status = getStatus(o);
                  return (
                    <tr key={o._id}>
                      <td>
                        <div className="fw-semibold" style={{ color: '#111827' }}>{o.title}</div>
                        {o.subtitle && <small className="text-muted">{o.subtitle}</small>}
                      </td>
                      <td>
                        <Badge style={{ background: '#fee2e2', color: '#dc2626' }}>
                          {getOfferText(o)}
                        </Badge>
                      </td>
                      <td className="small text-muted">
  {o.minOrderAmount > 0 ? `Min Order ₹${o.minOrderAmount.toLocaleString()}` : ''}
  
  {o.minProductPrice > 0 ? (
    <div>Min Product ₹{o.minProductPrice.toLocaleString()}</div>
  ) : (
    !o.minOrderAmount ? 'No min' : ''
  )}
  
  <br />
  <small>Applies: {o.appliesTo}</small>
</td>
                      <td className="small">
                        {new Date(o.startDate).toLocaleDateString()}
                        <br />
                        <span className="text-muted">to</span> {new Date(o.endDate).toLocaleDateString()}
                      </td>
                      <td><Badge bg={status.color}>{status.label}</Badge></td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <Button size="sm" variant="outline-primary" onClick={() => openEdit(o)}>✏️</Button>
                          <Button
                            size="sm"
                            variant={o.isActive ? 'outline-warning' : 'outline-success'}
                            onClick={() => handleToggle(o._id)}
                          >
                            {o.isActive ? '👁️' : '🚫'}
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(o._id)}>🗑️</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        )}
      </Container>

      {/* MODAL */}
      <Modal show={show} onHide={() => setShow(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? '✏️ Edit Offer' : '➕ Create Special Offer'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Row className="g-3">
              {/* BASIC */}
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Title *</Form.Label>
                  <Form.Control
                    required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Navaratri Sale"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Badge</Form.Label>
                  <Form.Control
                    value={form.badge}
                    onChange={e => setForm({ ...form, badge: e.target.value })}
                    placeholder="🎉 SPECIAL OFFER"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Subtitle</Form.Label>
                  <Form.Control
                    value={form.subtitle}
                    onChange={e => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g., Get ₹500 OFF on orders above ₹20,000"
                  />
                </Form.Group>
              </Col>

              {/* OFFER TYPE */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Offer Type *</Form.Label>
                  <Form.Select
                    value={form.offerType}
                    onChange={e => setForm({ ...form, offerType: e.target.value })}
                  >
                    <option value="flat">Flat Discount (₹)</option>
                    <option value="percentage">Percentage Discount (%)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Discount Value *</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    value={form.discountValue}
                    onChange={e => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.offerType === 'flat' ? 'e.g., 500' : 'e.g., 10'}
                  />
                </Form.Group>
              </Col>

              {form.offerType === 'percentage' && (
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Max Discount ₹ (optional)</Form.Label>
                    <Form.Control
                      type="number"
                      value={form.maxDiscount}
                      onChange={e => setForm({ ...form, maxDiscount: e.target.value })}
                      placeholder="e.g., 5000"
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Min Order ₹</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.minOrderAmount}
                    onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="e.g., 20000"
                  />
                  <Form.Text className="text-muted">
                    Only apply if order total above this
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Min Product Price ₹</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.minProductPrice || ''}
                    onChange={e => setForm({ ...form, minProductPrice: e.target.value })}
                    placeholder="e.g., 20000"
                  />
                  <Form.Text className="text-muted">
                    Apply discount only to products priced above this
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Start Date *</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">End Date *</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* APPLIES TO */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Applies To *</Form.Label>
                  <Form.Select
                    value={form.appliesTo}
                    onChange={e => setForm({ ...form, appliesTo: e.target.value })}
                  >
                    <option value="all">All Products</option>
                    <option value="category">Specific Categories</option>
                    <option value="brand">Specific Brands</option>
                    <option value="products">Specific Products</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {form.appliesTo === 'category' && (
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Select Categories</Form.Label>
                    <div className="d-flex flex-wrap gap-3 p-2" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '50px' }}>
                      {categories.map(c => (
                        <Form.Check
                          key={c._id}
                          type="checkbox"
                          id={`cat-${c._id}`}
                          label={c.name}
                          checked={form.categories.includes(c.name)}
                          onChange={e => {
                            const cats = e.target.checked
                              ? [...form.categories, c.name]
                              : form.categories.filter(x => x !== c.name);
                            setForm({ ...form, categories: cats });
                          }}
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Col>
              )}

              {form.appliesTo === 'brand' && (
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Select Brands</Form.Label>
                    <div className="d-flex flex-wrap gap-3 p-2" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '50px' }}>
                      {brands.map(b => (
                        <Form.Check
                          key={b._id}
                          type="checkbox"
                          id={`brand-${b._id}`}
                          label={b.name}
                          checked={form.brands.includes(b.name)}
                          onChange={e => {
                            const brs = e.target.checked
                              ? [...form.brands, b.name]
                              : form.brands.filter(x => x !== b.name);
                            setForm({ ...form, brands: brs });
                          }}
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Col>
              )}

              {form.appliesTo === 'products' && (
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Select Products</Form.Label>
                    <div className="p-2" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                      {products.map(p => (
                        <Form.Check
                          key={p._id}
                          type="checkbox"
                          id={`prod-${p._id}`}
                          label={`${p.name} — ₹${p.price}`}
                          checked={form.products.includes(p._id)}
                          onChange={e => {
                            const prs = e.target.checked
                              ? [...form.products, p._id]
                              : form.products.filter(x => x !== p._id);
                            setForm({ ...form, products: prs });
                          }}
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Col>
              )}

              
              {/* BANNER IMAGE */}
              <Col md={12}>
                <hr />
                <h6 className="fw-bold mb-2" style={{ color: '#1e40af' }}>
                  🖼️ Banner Image
                </h6>
              </Col>

              <Col md={12}>
                <ImageUpload
                  label="Banner Image (Optional)"
                  value={form.bannerImage || ''}
                  onChange={(url) => setForm({ ...form, bannerImage: url })}
                  height={150}
                />
              </Col>

              <Col md={12}>
                <Form.Check
                  type="switch"
                  id="active-toggle"
                  label={form.isActive ? 'Active' : 'Inactive'}
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShow(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} style={primaryBtn}>
              {saving ? 'Saving...' : editing ? 'Update Offer' : 'Create Offer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}