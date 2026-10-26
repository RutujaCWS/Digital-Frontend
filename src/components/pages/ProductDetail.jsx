import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Card, Spinner, Modal, InputGroup, Form } from 'react-bootstrap';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get(`https://digital-backend-phi.vercel.app/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" style={{ color: '#1e40af' }} />
        <p className="mt-3 text-muted small">Loading product...</p>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <div style={{ fontSize: '3rem' }}>📦</div>
        <h5 className="fw-bold mt-3 mb-2">Product Not Found</h5>
        <Link
          to="/"
          className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            color: '#ffffff',
            padding: '0.6rem 1.5rem',
            borderRadius: '10px',
            fontSize: '0.9rem'
          }}
        >
          ← Back to Home
        </Link>
      </Container>
    );
  }

  const handleAddToCart = async (goToCart = true) => {
    if (!user) {
      alert('Please login first');
      navigate('/login?redirect=' + encodeURIComponent(`/product/${id}`));
      return;
    }
    if (user.role !== 'user') {
      alert('Only customers can shop');
      return;
    }

    if (goToCart) setAdding(true);
    else setBuying(true);

    try {
      await addToCart(product._id, qty);
      navigate('/cart');
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setAdding(false);
      setBuying(false);
    }
  };

  const handleQtyChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') {
      setQty('');
      return;
    }
    let num = parseInt(val, 10);
    if (num < 1) num = 1;
    setQty(num);
  };

  const handleQtyBlur = () => {
    if (qty === '' || qty < 1) {
      setQty(1);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const images = product.images && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const inStock = product.countInStock > 0;

  return (
    <>
      <Container className="py-4 py-md-5">
        <Card
          className="border-0"
          style={{
            borderRadius: '20px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
        >
          <Card.Body className="p-3 p-md-4 p-lg-5">
            <Row className="g-4 g-lg-5">
              {/* ═══════════════════════════════════════════
                  LEFT COLUMN — IMAGE + QUANTITY + BUTTONS
              ═══════════════════════════════════════════ */}
              <Col xs={12} md={5}>
                {/* Main image (clickable to zoom) */}
                <div
                  className="text-center position-relative"
                  onClick={() => images.length > 0 && setShowZoom(true)}
                  style={{
                    height: 'clamp(260px, 38vw, 380px)',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    cursor: images.length > 0 ? 'zoom-in' : 'default',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (images.length > 0) {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(30, 64, 175, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {discount > 0 && (
                    <Badge
                      className="position-absolute fw-semibold"
                      style={{
                        top: '12px',
                        left: '12px',
                        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        letterSpacing: '0.03em',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        zIndex: 2
                      }}
                    >
                      {discount}% OFF
                    </Badge>
                  )}
                  
                  {/* ✅ Condition Badge — Top Right */}
                  <Badge
                    className="position-absolute fw-semibold"
                    style={{
                      top: '12px',
                      right: '12px',
                      background: product.condition === 'Second Hand'
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      zIndex: 2
                    }}
                  >
                    {product.condition === 'Second Hand' ? '♻️ Second Hand' : '🆕 New'}
                  </Badge>

                  {!inStock && (
                    <Badge
                      className="position-absolute fw-semibold"
                      style={{
                        top: '12px',
                        right: '12px',
                        background: '#64748b',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        zIndex: 2
                      }}
                    >
                      OUT OF STOCK
                    </Badge>
                  )}



                  {images.length > 0 ? (
                    <img
                      src={images[activeImage]}
                      alt={product.name}
                      style={{
                        maxWidth: '85%',
                        maxHeight: '85%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div className="text-muted small">No image available</div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="d-flex gap-2 justify-content-center flex-wrap mt-3">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImage(i);
                        }}
                        style={{
                          width: '60px',
                          height: '60px',
                          border: activeImage === i ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#ffffff',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img
                          src={img}
                          alt={`thumb-${i}`}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {images.length > 0 && (
                  <div
                    className="text-center mt-2 small"
                    style={{ color: '#94a3b8', fontSize: '0.75rem' }}
                  >
                    🔍 Click image to zoom
                  </div>
                )}

                {/* ═══════════════════════════════════════════
                    QUANTITY + BUTTONS — OPEN LAYOUT (no box)
                ═══════════════════════════════════════════ */}
                <div className="mt-4">
                  {/* Quantity label */}
                  <div
                    className="fw-semibold text-uppercase mb-2"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#64748b'
                    }}
                  >
                    Quantity
                  </div>

                  {/* Quantity — full width */}
                  <InputGroup className="mb-3">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQty(q => Math.max(1, (parseInt(q, 10) || 1) - 1))}
                      disabled={!inStock || qty <= 1 || qty === ''}
                      style={{
                        borderColor: '#e2e8f0',
                        background: '#f8fafc',
                        color: '#334155',
                        fontWeight: 600,
                        borderRadius: '10px 0 0 10px',
                        width: '48px',
                        padding: '0.55rem 0',
                        fontSize: '1rem'
                      }}
                    >
                      −
                    </Button>
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      value={qty}
                      onChange={handleQtyChange}
                      onBlur={handleQtyBlur}
                      disabled={!inStock}
                      className="text-center fw-semibold border-start-0 border-end-0"
                      style={{
                        background: '#ffffff',
                        borderColor: '#e2e8f0',
                        fontSize: '0.95rem',
                        color: '#0f172a',
                        padding: '0.55rem 0'
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQty(q => (parseInt(q, 10) || 0) + 1)}
                      disabled={!inStock}
                      style={{
                        borderColor: '#e2e8f0',
                        background: '#f8fafc',
                        color: '#334155',
                        fontWeight: 600,
                        borderRadius: '0 10px 10px 0',
                        width: '48px',
                        padding: '0.55rem 0',
                        fontSize: '1rem'
                      }}
                    >
                      +
                    </Button>
                  </InputGroup>

                  {/* Buttons — side by side below quantity */}
                  <Row className="g-2">
                    <Col xs={6}>
                      <Button
                        className="w-100 fw-semibold border-0 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleAddToCart(true)}
                        disabled={adding || buying || !inStock}
                        style={{
                          background: '#eff6ff',
                          color: '#1e40af',
                          padding: '0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          border: '1px solid #bfdbfe'
                        }}
                      >
                        {adding ? (
                          <>
                            <Spinner animation="border" size="sm" />
                            Adding...
                          </>
                        ) : (
                          <>🛒 Add to Cart</>
                        )}
                      </Button>
                    </Col>
                    <Col xs={6}>
                      <Button
                        className="w-100 fw-semibold border-0 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleAddToCart(false)}
                        disabled={adding || buying || !inStock}
                        style={{
                          background: inStock
                            ? 'linear-gradient(135deg, #1e40af, #3b82f6)'
                            : '#cbd5e1',
                          color: '#ffffff',
                          padding: '0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          boxShadow: inStock ? '0 4px 12px rgba(30, 64, 175, 0.25)' : 'none'
                        }}
                      >
                        {buying ? (
                          <>
                            <Spinner animation="border" size="sm" />
                            Processing...
                          </>
                        ) : !inStock ? (
                          'Out of Stock'
                        ) : (
                          <>⚡ Buy Now</>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* ═══════════════════════════════════════════
                  RIGHT COLUMN — PRODUCT DETAILS
              ═══════════════════════════════════════════ */}
              <Col xs={12} md={7}>
                <div
                  className="fw-semibold text-uppercase mb-2"
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.15em',
                    color: '#3b82f6'
                  }}
                >
                  {product.category}
                </div>

                <h3
                  className="fw-bold mb-3"
                  style={{
                    color: '#0f172a',
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.3
                  }}
                >
                  {product.name}
                </h3>

                <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                  <Badge
                    className="fw-semibold"
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      padding: '4px 9px',
                      borderRadius: '7px',
                      letterSpacing: '0.02em'
                    }}
                  >
                    ★ {product.rating}
                  </Badge>
                  <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {product.numReviews} ratings
                  </small>
                  {product.brand && (
                    <>
                      <span className="text-muted">·</span>
                      <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        Brand:{' '}
                        <span style={{ color: '#0f172a', fontWeight: 500 }}>
                          {product.brand}
                        </span>
                      </small>
                    </>
                  )}
                </div>

                <div
                  className="p-3 mb-3"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px'
                  }}
                >
                  <div
                    className="fw-semibold text-uppercase mb-1"
                    style={{
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      color: '#10b981'
                    }}
                  >
                    Special Price
                  </div>
                  <div className="d-flex align-items-baseline gap-3 flex-wrap">
                    <span
                      className="fw-bold"
                      style={{
                        color: '#0f172a',
                        fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span
                          className="text-decoration-line-through"
                          style={{ color: '#94a3b8', fontSize: '0.95rem' }}
                        >
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                        <Badge
                          className="fw-semibold"
                          style={{
                            background: '#16a34a',
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            padding: '4px 9px',
                            borderRadius: '7px',
                            letterSpacing: '0.02em'
                          }}
                        >
                          Save {discount}%
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                {product.gst > 0 && (
                    <div
                      className="mt-2 pt-2"
                      style={{
                        borderTop: '1px dashed #e2e8f0',
                        fontSize: '0.72rem',
                        color: '#64748b'
                      }}
                    >
                      GST {product.gst}% included · Total with GST: ₹
                      {(product.price * (1 + product.gst / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  )}
               
                <div className="mb-3 d-flex align-items-center gap-2">
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: inStock ? '#10b981' : '#ef4444',
                      display: 'inline-block'
                    }}
                  />
                  <span
                    className="fw-semibold small"
                    style={{ color: inStock ? '#10b981' : '#ef4444' }}
                  >
                    {inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {inStock && product.countInStock <= 5 && (
                    <span className="text-muted small">
                      (Only {product.countInStock} left)
                    </span>
                  )}
                </div>

                {product.description && (
                  <div className="mb-3">
                    <div
                      className="fw-semibold text-uppercase mb-1"
                      style={{
                        fontSize: '0.6rem',
                        letterSpacing: '0.1em',
                        color: '#3b82f6'
                      }}
                    >
                      Description
                    </div>
                    <p
                      className="mb-0"
                      style={{
                        color: '#475569',
                        fontSize: '0.875rem',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {product.description}
                    </p>
                  </div>
                )}

                {product.hasGift && product.gifts?.length > 0 && (
                  <div
                    className="p-3 mb-3"
                    style={{
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                      border: '1px dashed #93c5fd',
                      borderRadius: '14px'
                    }}
                  >
                    <div
                      className="fw-semibold text-uppercase mb-2 d-flex align-items-center gap-2"
                      style={{
                        fontSize: '0.65rem',
                        letterSpacing: '0.1em',
                        color: '#1e40af'
                      }}
                    >
                      🎁 Free Gifts Included
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {product.gifts.map((g, i) => (
                        <div key={i} className="d-flex align-items-center gap-3">
                          {g.image && (
                            <div
                              className="d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: '40px',
                                height: '40px',
                                background: '#ffffff',
                                borderRadius: '9px',
                                border: '1px solid #e2e8f0',
                                padding: '3px'
                              }}
                            >
                              <img
                                src={g.image}
                                alt={g.name}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              />
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div
                              className="fw-semibold"
                              style={{ color: '#0f172a', fontSize: '0.875rem' }}
                            >
                              {g.name}
                            </div>
                            {g.value && (
                              <div style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 500 }}>
                                Worth ₹{g.value}
                              </div>
                            )}
                            {g.description && (
                              <div className="small text-muted">{g.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>

      {/* ═══════════════════════════════════════════
          IMAGE ZOOM MODAL
      ═══════════════════════════════════════════ */}
      <Modal
        show={showZoom}
        onHide={() => setShowZoom(false)}
        centered
        size="lg"
        contentClassName="border-0"
        style={{ backdropFilter: 'blur(4px)' }}
      >
        <Modal.Body
          className="p-0 position-relative"
          style={{
            background: '#0f172a',
            borderRadius: '16px',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={() => setShowZoom(false)}
            className="position-absolute border-0 d-flex align-items-center justify-content-center"
            style={{
              top: '14px',
              right: '14px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '1.1rem',
              cursor: 'pointer',
              zIndex: 3,
              backdropFilter: 'blur(8px)'
            }}
            aria-label="Close"
          >
            ✕
          </button>

          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              minHeight: '60vh',
              maxHeight: '85vh',
              padding: '40px 20px'
            }}
          >
            {images.length > 0 && (
              <img
                src={images[activeImage]}
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>

          {images.length > 1 && (
            <div
              className="d-flex gap-2 justify-content-center flex-wrap p-3"
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.2)'
              }}
            >
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(i)}
                  style={{
                    width: '56px',
                    height: '56px',
                    border: activeImage === i ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s'
                  }}
                >
                  <img
                    src={img}
                    alt={`modal-thumb-${i}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}