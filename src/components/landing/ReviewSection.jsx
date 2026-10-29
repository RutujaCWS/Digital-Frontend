import { useEffect, useState } from 'react';
import { Row, Col, Modal, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AVATAR_COLORS = [
  '#1e40af', '#0891b2', '#7c3aed', '#dc2626', '#16a34a', '#d97706', '#059669', '#be185d'
];

export default function ReviewsSection() {
  const [data, setData] = useState({ reviews: [], total: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [myReview, setMyReview] = useState(null);

  const [form, setForm] = useState({
    rating: 5,
    comment: '',
    city: ''
  });
  const [hoverStar, setHoverStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const { user, token } = useAuth();
  const navigate = useNavigate();

  const loadReviews = () => {
    setLoading(true);
    axios
      .get('https://digitalworldkopargaonbackend.vercel.app/api/reviews')
      .then(r => setData(r.data || { reviews: [], total: 0, avgRating: 0 }))
      .catch(() => setData({ reviews: [], total: 0, avgRating: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (!user || !token) {
      setMyReview(null);
      return;
    }
    axios
      .get('https://digitalworldkopargaonbackend.vercel.app/api/reviews/mine', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => setMyReview(r.data?.review || null))
      .catch(() => setMyReview(null));
  }, [user, token]);

  const handleOpenModal = () => {
    if (!user) {
      alert('🔒 Please login to submit a review');
      navigate('/login?redirect=/');
      return;
    }
    if (user.role !== 'user') {
      alert('Only customers can write reviews');
      return;
    }
    setMsg('');
    setForm({ rating: 5, comment: '', city: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!user || !token) {
      setMsg('Please login to submit a review');
      return;
    }

    if (!form.comment.trim()) {
      setMsg('Please write your review');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        'https://digitalworldkopargaonbackend.vercel.app/api/reviews',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      loadReviews();
      const r = await axios.get('https://digitalworldkopargaonbackend.vercel.app/api/reviews/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyReview(r.data?.review || null);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await axios.delete('https://digitalworldkopargaonbackend.vercel.app/api/reviews/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyReview(null);
      loadReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  };

  const renderStars = (rating, size = '1rem') => (
    <>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{
            color: i <= rating ? '#f59e0b' : '#d1d5db',
            fontSize: size,
            lineHeight: 1
          }}
        >
          ★
        </span>
      ))}
    </>
  );

  const formatDate = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div
        className="h-100 d-flex align-items-center justify-content-center"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          minHeight: '300px'
        }}
      >
        <Spinner animation="border" style={{ color: '#1e40af' }} />
      </div>
    );
  }

  return (
    <div
      className="h-100 d-flex flex-column"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '1.5rem'
      }}
    >
      {/* HEADER */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <span style={{ fontSize: '1.2rem' }}>⭐</span>
        <h5
          className="fw-bold mb-0"
          style={{ color: '#1e40af', fontSize: '1.05rem' }}
        >
          Our Reviews
        </h5>
      </div>

      {/* OVERALL RATING */}
      {data.total > 0 && (
        <div
          className="d-flex align-items-center gap-3 p-3 mb-3"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px'
          }}
        >
          <div>
            <div
              className="fw-bold"
              style={{
                color: '#0f172a',
                fontSize: '1.9rem',
                letterSpacing: '-0.02em',
                lineHeight: 1
              }}
            >
              {data.avgRating}
            </div>
          </div>
          <div className="text-start flex-grow-1">
            <div className="mb-1">{renderStars(Math.round(data.avgRating), '1rem')}</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              Based on <strong>{data.total}</strong> {data.total === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>
      )}

      {/* WRITE REVIEW BUTTON / MY REVIEW */}
      <div className="mb-3">
        {myReview ? (
          <div
            className="d-flex align-items-center justify-content-between gap-2 p-2"
            style={{
              background: '#eff6ff',
              border: '1px dashed #bfdbfe',
              borderRadius: '10px'
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                className="fw-semibold"
                style={{ color: '#1e40af', fontSize: '0.78rem' }}
              >
                ✓ You already reviewed us
              </div>
              <div
                className="text-truncate"
                style={{ fontSize: '0.72rem', color: '#64748b' }}
              >
                {renderStars(myReview.rating, '0.75rem')} · {myReview.comment?.slice(0, 40)}...
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="border-0 fw-semibold flex-shrink-0"
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                fontSize: '0.72rem',
                padding: '5px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid #fecaca'
              }}
            >
              🗑️
            </button>
          </div>
        ) : (
          <button
            onClick={handleOpenModal}
            className="w-100 fw-semibold border-0 d-flex align-items-center justify-content-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              color: '#ffffff',
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)'
            }}
          >
            ✍️ Write a Review
          </button>
        )}
      </div>

      {/* REVIEWS LIST */}
      {data.reviews.length > 0 ? (
        <div
          className="d-flex flex-column gap-2"
          style={{
            flex: 1,
            maxHeight: '280px',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '6px',
            marginRight: '-6px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}
        >
          {data.reviews.map(review => (
            <div
              key={review._id}
              className="p-2"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                flexShrink: 0
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-1">
                <div
                  className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: getColor(review.name),
                    color: '#ffffff',
                    fontSize: '0.7rem'
                  }}
                >
                  {getInitials(review.name)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    className="fw-semibold text-truncate"
                    style={{ color: '#0f172a', fontSize: '0.82rem' }}
                  >
                    {review.name}
                  </div>
                  <div
                    className="d-flex align-items-center gap-1"
                    style={{ fontSize: '0.68rem' }}
                  >
                    <span>{renderStars(review.rating, '0.72rem')}</span>
                    <span className="text-muted">· {formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  color: '#475569',
                  fontSize: '0.75rem',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {review.comment}
              </div>

              {review.city && (
                <div
                  className="mt-1 pt-1"
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    color: '#94a3b8',
                    fontSize: '0.68rem'
                  }}
                >
                  📍 {review.city}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center d-flex flex-column align-items-center justify-content-center"
          style={{ flex: 1, padding: '1.5rem 0' }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
          <p className="text-muted small mb-0" style={{ fontSize: '0.82rem' }}>
            No reviews yet. Be the first!
          </p>
        </div>
      )}

      {/* WRITE REVIEW MODAL — title field kadha */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        contentClassName="border-0"
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-semibold" style={{ fontSize: '1rem' }}>
            ✍️ Write Your Review
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-0">
            {/* RATING */}
            <div className="mb-3">
              <label
                className="fw-semibold mb-2 d-block"
                style={{ fontSize: '0.82rem', color: '#374151' }}
              >
                Overall Rating <span className="text-danger">*</span>
              </label>
              <div className="d-flex gap-1 align-items-center">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoverStar(i)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setForm({ ...form, rating: i })}
                    className="border-0 bg-transparent p-0"
                    style={{
                      fontSize: '2rem',
                      lineHeight: 1,
                      color: i <= (hoverStar || form.rating) ? '#f59e0b' : '#d1d5db',
                      cursor: 'pointer',
                      transition: 'transform 0.15s'
                    }}
                  >
                    ★
                  </button>
                ))}
                <span
                  className="ms-2 fw-semibold"
                  style={{ color: '#0f172a', fontSize: '0.85rem' }}
                >
                  {form.rating}/5
                </span>
              </div>
            </div>

            {/* REVIEW */}
            <Form.Group className="mb-3">
              <Form.Label
                className="fw-semibold"
                style={{ fontSize: '0.82rem', color: '#374151' }}
              >
                Your Review <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                required
                maxLength={500}
                value={form.comment}
                onChange={e => setForm({ ...form, comment: e.target.value })}
                placeholder="Share your experience with our products & services..."
                style={{
                  background: '#f8fafc',
                  borderColor: '#e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  resize: 'none'
                }}
              />
              <div
                className="text-end mt-1"
                style={{ fontSize: '0.7rem', color: '#94a3b8' }}
              >
                {form.comment.length}/500
              </div>
            </Form.Group>

            {/* CITY */}
            <Form.Group className="mb-3">
              <Form.Label
                className="fw-semibold"
                style={{ fontSize: '0.82rem', color: '#374151' }}
              >
                City <span className="text-muted fw-normal">(optional)</span>
              </Form.Label>
              <Form.Control
                maxLength={50}
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="e.g., Mumbai"
                style={{
                  background: '#f8fafc',
                  borderColor: '#e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.9rem'
                }}
              />
            </Form.Group>

            {msg && (
              <div
                className="p-2 mb-2"
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  border: '1px solid #fecaca'
                }}
              >
                ⚠️ {msg}
              </div>
            )}
          </Modal.Body>

          <Modal.Footer className="border-0">
            <Button
              variant="light"
              onClick={() => setShowModal(false)}
              className="fw-semibold"
              style={{ fontSize: '0.875rem', borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="fw-semibold border-0"
              style={{
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                color: '#fff',
                padding: '0.5rem 1.2rem',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}