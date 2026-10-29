import { Card, Badge, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please login first to add items to cart');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (user.role !== 'user') {
      alert('Only customers can add items to cart');
      return;
    }
    if (product.countInStock === 0) return;

    setAdding(true);
    try {
      await addToCart(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setAdding(false);
    }
  };

  const outOfStock = product.countInStock === 0;
  const giftCount = product.gifts?.length || 0;

  return (
    <Card
      className="h-100 shadow-sm position-relative overflow-hidden"
      style={{
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.12)';
        e.currentTarget.style.borderColor = '#1e40af';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
            {product.hasGift && giftCount > 0 && (
        <div
          className="position-absolute fw-bold"
          style={{
            top: '8px',
            right: '8px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#ffffff',
            fontSize: '0.62rem',
            padding: '3px 8px',
            borderRadius: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 4
          }}
        >
          🎁 {giftCount === 1 ? 'FREE GIFT' : `${giftCount} FREE GIFTS`}
        </div>
      )}

      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="product-img-wrap" style={{ position: 'relative' }}>
          <span
            className="position-absolute fw-bold"
            style={{
              top: '8px',
              left: '8px',
              background: product.condition === 'Second Hand'
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#ffffff',
              fontSize: '0.62rem',
              padding: '3px 8px',
              borderRadius: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              zIndex: 3
            }}
          >
            {product.condition === 'Second Hand' ? '♻️ Second Hand' : '🆕 New'}
          </span>

          <Card.Img src={product.image || product.images?.[0]} />
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title style={{ fontSize: '.95rem' }} className="text-truncate mb-2">
            {product.name}
          </Card.Title>
          {/* <div className="mb-2">
            <Badge bg="success">{product.rating} ★</Badge>
            <small className="text-muted ms-2">({product.numReviews})</small>
          </div> */}
         
<div className="mb-2">
  <div className="d-flex flex-wrap align-items-baseline gap-1">
    <span
      className="fw-bold"
      style={{
        fontSize: 'clamp(0.85rem, 3.5vw, 1.15rem)',
        whiteSpace: 'nowrap'
      }}
    >
      ₹{product.price.toLocaleString('en-IN')}
    </span>

    {product.originalPrice && (
      <small
        className="text-muted text-decoration-line-through"
        style={{
          fontSize: '0.7rem',
          whiteSpace: 'nowrap'
        }}
      >
        ₹{product.originalPrice.toLocaleString('en-IN')}
      </small>
    )}
  </div>

  {product.originalPrice && (
    <div className="text-success small fw-bold">
      {discount}% off
    </div>
  )}
</div>


          <Button
            variant={outOfStock ? 'secondary' : added ? 'success' : 'warning'}
            size="sm"
            className="w-100 fw-bold mt-auto"
            disabled={outOfStock || adding}
            onClick={handleAddToCart}
          >
            {outOfStock
              ? 'OUT OF STOCK'
              : adding
              ? 'ADDING...'
              : added
              ? '✅ ADDED!'
              : 'ADD TO CART'}
          </Button>
        </Card.Body>
      </Link>
    </Card>
  );
}