import { useEffect, useRef, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function CategoryStrip() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    axios.get('https://digital-backend-phi.vercel.app/api/categories')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Update scroll indicators
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [categories]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" size="sm" style={{ color: '#1e40af' }} />
      </Container>
    );
  }

  if (categories.length === 0) return null;

  return (
    <Container fluid className="px-0 my-4 my-md-5">
      {/* Section Header */}
      <Container className="px-3 px-md-4 mb-3 mb-md-4">
        <div className="text-center">
          <span
            className="d-inline-block fw-semibold mb-2"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#3b82f6'
            }}
          >
            Categories
          </span>
          <h4
            className="fw-bold mb-1"
            style={{
              color: '#0f172a',
              fontSize: 'clamp(1.15rem, 3vw, 1.6rem)',
              letterSpacing: '-0.02em'
            }}
          >
            Browse by Category
          </h4>
          <p className="text-muted mb-0 small mx-auto" style={{ maxWidth: '480px' }}>
            Find exactly what you're looking for
          </p>
        </div>
      </Container>

      {/* Scrollable Strip */}
      <div className="position-relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="d-none d-md-flex align-items-center justify-content-center position-absolute border-0"
            style={{
              top: '50%',
              left: '20px',
              transform: 'translateY(-50%)',
              zIndex: 2,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#1e40af',
              color: '#ffffff',
              fontSize: '1.3rem',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(30, 64, 175, 0.35)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#152e7a';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1e40af';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="d-none d-md-flex align-items-center justify-content-center position-absolute border-0"
            style={{
              top: '50%',
              right: '20px',
              transform: 'translateY(-50%)',
              zIndex: 2,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#1e40af',
              color: '#ffffff',
              fontSize: '1.3rem',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(30, 64, 175, 0.35)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#152e7a';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1e40af';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}

        {/* Gradient Fades */}
        <div
          className="position-absolute d-none d-md-block"
          style={{
            top: 0,
            bottom: 0,
            left: 0,
            width: '60px',
            background: 'linear-gradient(to right, #f8fafc, transparent)',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: canScrollLeft ? 1 : 0,
            transition: 'opacity 0.3s'
          }}
        />
        <div
          className="position-absolute d-none d-md-block"
          style={{
            top: 0,
            bottom: 0,
            right: 0,
            width: '60px',
            background: 'linear-gradient(to left, #f8fafc, transparent)',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: canScrollRight ? 1 : 0,
            transition: 'opacity 0.3s'
          }}
        />

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="d-flex gap-3 gap-md-4 overflow-auto px-3 px-md-5 pb-3 pt-1"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory'
          }}
        >
          {categories.map((c, i) => (
            <Link
              to={`/?category=${c.name}`}
              key={c._id || i}
              className="text-decoration-none flex-shrink-0"
              style={{ width: '140px', scrollSnapAlign: 'start' }}
            >
              <div
                className="d-flex flex-column align-items-center text-center h-100 position-relative"
                style={{
                  padding: '20px 12px 18px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(30, 64, 175, 0.15)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Decorative top accent */}
                <div
                  className="position-absolute"
                  style={{
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #1e40af, #3b82f6)',
                    borderBottomLeftRadius: '4px',
                    borderBottomRightRadius: '4px'
                  }}
                />

                <div
                  className="d-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: c.color || '#eff6ff',
                    fontSize: '1.7rem',
                    transition: 'transform 0.3s'
                  }}
                >
                  {c.icon || '📦'}
                </div>
                <div
                  className="fw-semibold text-truncate w-100"
                  style={{
                    fontSize: '0.85rem',
                    color: '#1e293b',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {c.name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}