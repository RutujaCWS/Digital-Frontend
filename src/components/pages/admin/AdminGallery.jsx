import { useEffect, useState } from 'react';
import {
  Container, Card, Button, Table, Modal, Form,
  Row, Col, Alert, Badge, Spinner
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import ImageUpload from '../../../components/ImageUpload';
import VideoUpload from '../../../components/VideoUpload';

const primaryBtn = {
  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '0.5rem 1.1rem',
  fontWeight: 600,
  fontSize: '0.875rem'
};

const emptyForm = {
  mediaType: 'image',
  imageUrl: '',
  videoUrl: '',
  description: ''
};

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    axios.get('https://digital-backend-fv2v.onrender.com/api/gallery/admin/all', { headers })
      .then(r => setItems(r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(null);
    setShow(true);
  };

  const openEdit = (item) => {
    setForm({
      mediaType: item.mediaType || 'image',
      imageUrl: item.imageUrl || '',
      videoUrl: item.videoUrl || '',
      description: item.description || ''
    });
    setEditing(item._id);
    setShow(true);
  };

  const closeModal = () => {
    setShow(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.mediaType === 'image' && !form.imageUrl) {
      alert('Please upload an image');
      return;
    }
    if (form.mediaType === 'video' && !form.videoUrl) {
      alert('Please upload a video');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await axios.put(`https://digital-backend-fv2v.onrender.com/api/gallery/${editing}`, form, { headers });
        setMsg('✅ Media updated');
      } else {
        await axios.post('https://digital-backend-fv2v.onrender.com/api/gallery', form, { headers });
        setMsg('✅ Media added');
      }
      closeModal();
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await axios.delete(`https://digital-backend-fv2v.onrender.com/api/gallery/${id}`, { headers });
    load();
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '2rem 0 3rem' }}>
      <Container fluid className="px-3 px-md-4" style={{ maxWidth: '1400px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2
              className="fw-bold mb-1"
              style={{ color: '#111827', fontSize: 'clamp(1.35rem, 3vw, 1.6rem)' }}
            >
              🖼️ Gallery Management
            </h2>
            <p className="text-muted small mb-0">
              Upload photos & videos for homepage gallery
            </p>
          </div>
          <Button onClick={openAdd} style={primaryBtn}>
            + Add Media
          </Button>
        </div>

        {msg && (
          <Alert variant="success" className="border-0 small" style={{ borderRadius: '10px' }}>
            {msg}
          </Alert>
        )}

        {loading ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <Spinner animation="border" />
            </Card.Body>
          </Card>
        ) : items.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5 text-muted">
              <div style={{ fontSize: '3rem' }}>🖼️</div>
              <p className="mt-3 mb-0">
                No media yet. Click <strong>+ Add Media</strong> to start.
              </p>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Preview</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Added On</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td>
                      {item.mediaType === 'image' ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            background: '#0f172a',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '1.5rem'
                          }}
                        >
                          ▶️
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge bg={item.mediaType === 'image' ? 'info' : 'danger'}>
                        {item.mediaType === 'image' ? '🖼️ Image' : '🎥 Video'}
                      </Badge>
                    </td>
                    <td>
                      <div
                        className="small text-muted"
                        style={{
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={item.description}
                      >
                        {item.description || '—'}
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(item.createdAt).toLocaleDateString('en-IN')}
                      </small>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => openEdit(item)}
                          title="Edit"
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </Container>

      {/* ADD / EDIT MODAL */}
      <Modal show={show} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? '✏️ Edit Media' : '➕ Add Media'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Media Type *</Form.Label>
                  <Form.Select
                    value={form.mediaType}
                    onChange={e =>
                      setForm({
                        ...form,
                        mediaType: e.target.value,
                        imageUrl: e.target.value === 'video' ? '' : form.imageUrl,
                        videoUrl: e.target.value === 'image' ? '' : form.videoUrl
                      })
                    }
                  >
                    <option value="image">🖼️ Image</option>
                    <option value="video">🎥 Video</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {form.mediaType === 'image' ? (
                <Col md={12}>
                  <ImageUpload
                    label="Upload Image *"
                    value={form.imageUrl}
                    onChange={(url) => setForm({ ...form, imageUrl: url })}
                    height={150}
                  />
                </Col>
              ) : (
                <Col md={12}>
                  <VideoUpload
                    label="Upload Video *"
                    value={form.videoUrl}
                    onChange={(url) => setForm({ ...form, videoUrl: url })}
                    height={150}
                  />
                </Col>
              )}

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Description (optional)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="e.g., Our store front in Mumbai"
                    maxLength={200}
                  />
                  <Form.Text className="text-muted">
                    {form.description.length}/200 characters
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} style={primaryBtn}>
              {saving
                ? 'Saving...'
                : editing
                ? '💾 Update'
                : '➕ Add Media'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}