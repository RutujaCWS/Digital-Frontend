import { useEffect, useState } from 'react';
import { Container, Card, Button, Table, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const emptyForm = {
  name: '', description: '', price: '', originalPrice: '', category: '',
  brand: '', image: '', countInStock: 0, hasGift: false, giftName: '', giftValue: ''
};

export default function BackOfficeProducts() {
  const [products, setProducts] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => axios.get('https://digitalworldkopargaonbackend.vercel.app/api/products').then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name, description: form.description,
      price: +form.price, originalPrice: +form.originalPrice || undefined,
      category: form.category, brand: form.brand, image: form.image,
      countInStock: +form.countInStock,
      hasGift: form.hasGift,
      gifts: form.hasGift && form.giftName ? [{ name: form.giftName, value: +form.giftValue || 0 }] : []
    };

    if (editing) await axios.put(`https://digitalworldkopargaonbackend.vercel.app/api/products/${editing}`, payload, { headers });
    else await axios.post('https://digitalworldkopargaonbackend.vercel.app/api/products', payload, { headers });

    setShow(false); setForm(emptyForm); setEditing(null); load();
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description, price: p.price,
      originalPrice: p.originalPrice || '', category: p.category,
      brand: p.brand || '', image: p.image, countInStock: p.countInStock,
      hasGift: p.hasGift || false,
      giftName: p.gifts?.[0]?.name || '', giftValue: p.gifts?.[0]?.value || ''
    });
    setEditing(p._id); setShow(true);
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>📦 Products (Back Office)</h3>
        <Button variant="primary" onClick={() => { setForm(emptyForm); setEditing(null); setShow(true); }}>+ Add Product</Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Table responsive hover className="mb-0">
          <thead className="table-light"><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Gift</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td><img src={p.image} alt="" style={{ width: '50px', height: '50px', objectFit: 'contain' }} /></td>
                <td>{p.name}</td><td>{p.category}</td>
                <td>₹{p.price.toLocaleString()}</td>
                <td>{p.countInStock}</td>
                <td>{p.hasGift ? <Badge bg="danger">🎁</Badge> : '-'}</td>
                <td><Button size="sm" variant="outline-primary" onClick={() => openEdit(p)}>Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>{editing ? 'Edit' : 'Add'} Product</Modal.Title></Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Name *</Form.Label><Form.Control required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Category *</Form.Label><Form.Control required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Price *</Form.Label><Form.Control type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Original Price</Form.Label><Form.Control type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Stock *</Form.Label><Form.Control type="number" required value={form.countInStock} onChange={e => setForm({ ...form, countInStock: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Brand</Form.Label><Form.Control value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Image URL *</Form.Label><Form.Control required value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></Form.Group></Col>
              <Col md={12}><Form.Group className="mb-3"><Form.Label>Description *</Form.Label><Form.Control as="textarea" rows={2} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Form.Group></Col>
              <Col md={12}><Form.Check type="switch" label="🎁 Has Free Gift" checked={form.hasGift} onChange={e => setForm({ ...form, hasGift: e.target.checked })} /></Col>
              {form.hasGift && (
                <>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Gift Name</Form.Label><Form.Control value={form.giftName} onChange={e => setForm({ ...form, giftName: e.target.value })} /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Gift Value ₹</Form.Label><Form.Control type="number" value={form.giftValue} onChange={e => setForm({ ...form, giftValue: e.target.value })} /></Form.Group></Col>
                </>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editing ? 'Update' : 'Create'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}