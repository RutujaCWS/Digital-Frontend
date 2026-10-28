import { useEffect, useState } from 'react';
import {
  Container, Card, Button, Table, Badge, Form,
  Alert, Spinner, Modal
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [msg, setMsg] = useState('');
  const [replyModal, setReplyModal] = useState(false);
  const [current, setCurrent] = useState(null);
  const [replyText, setReplyText] = useState('');

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    const url = filter === 'all'
      ? 'https://digital-backend-fv2v.onrender.com/api/reviews/admin/all'
      : `https://digital-backend-fv2v.onrender.com/api/reviews/admin/all?status=${filter}`;

    axios.get(url, { headers })
      .then(r => setReviews(r.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleApprove = async (id, approve) => {
    await axios.put(`https://digital-backend-fv2v.onrender.com/api/reviews/${id}/approve`, { approve }, { headers });
    setMsg(approve ? '✅ Approved' : '🚫 Unapproved');
    load();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await axios.delete(`https://digital-backend-fv2v.onrender.com/api/reviews/${id}`, { headers });
    setMsg('✅ Deleted');
    load();
    setTimeout(() => setMsg(''), 3000);
  };

  const openReply = (review) => {
    setCurrent(review);
    setReplyText(review.adminReply || '');
    setReplyModal(true);
  };

  const saveReply = async () => {
    await axios.put(`https://digital-backend-fv2v.onrender.com/api/reviews/${current._id}/reply`, { adminReply: replyText }, { headers });
    setReplyModal(false);
    setMsg('✅ Reply saved');
    load();
    setTimeout(() => setMsg(''), 3000);
  };

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '2rem 0 3rem' }}>
      <Container fluid className="px-3 px-md-4" style={{ maxWidth: '1400px' }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1" style={{ color: '#111827', fontSize: 'clamp(1.35rem, 3vw, 1.6rem)' }}>
            ⭐ Reviews Management
          </h2>
          <p className="text-muted small mb-0">Approve / reject customer reviews</p>
        </div>

        {msg && <Alert variant="success" className="border-0 small" style={{ borderRadius: '10px' }}>{msg}</Alert>}

        <Card className="border-0 shadow-sm mb-3">
          <Card.Body className="py-2">
            <div className="d-flex gap-2 align-items-center">
              <span className="fw-semibold small">Filter:</span>
              {['all', 'pending', 'approved'].map(f => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? 'primary' : 'outline-secondary'}
                  onClick={() => setFilter(f)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {f}
                </Button>
              ))}
            </div>
          </Card.Body>
        </Card>

        {loading ? (
          <Card className="border-0 shadow-sm"><Card.Body className="text-center py-5"><Spinner animation="border" /></Card.Body></Card>
        ) : reviews.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5 text-muted">
              <div style={{ fontSize: '3rem' }}>⭐</div>
              <p className="mt-3 mb-0">No reviews yet</p>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {r.product?.image && (
                          <img src={r.product.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px' }} />
                        )}
                        <div className="fw-semibold small">{r.product?.name || 'Unknown'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold small">{r.userName}</div>
                      {r.isVerifiedPurchase && <Badge bg="success" style={{ fontSize: '0.6rem' }}>✓ Verified</Badge>}
                    </td>
                    <td>
                      <div style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '1px' }}>{renderStars(r.rating)}</div>
                      <small className="text-muted">{r.rating}/5</small>
                    </td>
                    <td>
                      {r.title && <div className="fw-semibold small">{r.title}</div>}
                      <div className="small text-muted">{r.comment}</div>
                      {r.adminReply && (
                        <div className="mt-1 p-2 small" style={{ background: '#eff6ff', borderRadius: '6px' }}>
                          <strong>Admin:</strong> {r.adminReply}
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge bg={r.isApproved ? 'success' : 'warning'}>
                        {r.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        {!r.isApproved ? (
                          <Button size="sm" variant="outline-success" onClick={() => handleApprove(r._id, true)}>✓</Button>
                        ) : (
                          <Button size="sm" variant="outline-warning" onClick={() => handleApprove(r._id, false)}>🚫</Button>
                        )}
                        <Button size="sm" variant="outline-primary" onClick={() => openReply(r)}>💬</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(r._id)}>🗑️</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </Container>

      <Modal show={replyModal} onHide={() => setReplyModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>💬 Reply to Review</Modal.Title></Modal.Header>
        <Modal.Body>
          {current && (
            <div className="mb-3 p-2" style={{ background: '#f8fafc', borderRadius: '8px' }}>
              <div className="fw-semibold small">{current.userName}</div>
              <div style={{ color: '#f59e0b' }}>{renderStars(current.rating)}</div>
              <div className="small">{current.comment}</div>
            </div>
          )}
          <Form.Group>
            <Form.Label className="fw-semibold small">Your Reply</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Thank you for your feedback..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setReplyModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveReply}>Save Reply</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}