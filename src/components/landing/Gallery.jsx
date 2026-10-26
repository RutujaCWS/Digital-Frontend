
import { useEffect, useState } from 'react';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import axios from 'axios';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [imagesPerRow, setImagesPerRow] = useState(5);

  // Responsive columns according to screen size
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
    
      if (width <= 400) {
        setImagesPerRow(2); // Small mobile: 2 images
      } else if (width < 1024) {
        setImagesPerRow(3); // Mobile and tablet: 3 images
      } else {
        setImagesPerRow(5); // Desktop and large screens: 5 images
      }
    };

    updateColumns();

    window.addEventListener('resize', updateColumns);

    return () => {
      window.removeEventListener('resize', updateColumns);
    };
  }, []);

  // Fetch gallery items
  useEffect(() => {
    axios
      .get('https://digital-backend-phi.vercel.app/api/gallery')
      .then((r) => setItems(r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Reset page when screen size changes
  useEffect(() => {
    setPage(0);
  }, [imagesPerRow]);

  if (loading || items.length === 0) return null;

  // Always show 2 rows per page
  const ITEMS_PER_PAGE = imagesPerRow * 2;

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = page * ITEMS_PER_PAGE;

  const currentItems = items.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const nextPage = () => {
    if (page < totalPages - 1) {
      setPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  const hasNext = page < totalPages - 1;
  const hasPrev = page > 0;

  return (
    <Container fluid className="px-2 px-sm-3 px-md-4 my-4 gallery-container">

      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-none d-sm-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              color: '#fff',
              fontSize: '1.3rem',
              boxShadow: '0 8px 20px rgba(30, 64, 175, 0.3)',
            }}
          >
            📸
          </div>

          <div>
            <h4
              className="fw-bold mb-0"
              style={{
                color: '#0f172a',
                fontSize: 'clamp(1.05rem, 2.5vw, 1.35rem)',
                letterSpacing: '-0.02em',
              }}
            >
              Our <span style={{ color: '#1e40af' }}>Gallery</span>
            </h4>

            <p
              className="text-muted mb-0"
              style={{ fontSize: 'clamp(0.68rem, 1.5vw, 0.8rem)' }}
            >
              Moments from our store
            </p>
          </div>
        </div>

        {/* PREVIOUS / NEXT BUTTONS */}
        {totalPages > 1 && (
          <div className="d-flex gap-2">
            <button
              onClick={prevPage}
              disabled={!hasPrev}
              aria-label="Previous page"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: hasPrev ? '#ffffff' : '#f1f5f9',
                border: hasPrev
                  ? '1.5px solid #e2e8f0'
                  : '1.5px solid #f1f5f9',
                color: hasPrev ? '#1e40af' : '#cbd5e1',
                fontSize: '1.2rem',
                cursor: hasPrev ? 'pointer' : 'not-allowed',
                boxShadow: hasPrev
                  ? '0 4px 12px rgba(0,0,0,0.06)'
                  : 'none',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                if (hasPrev) {
                  e.currentTarget.style.background = '#1e40af';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#1e40af';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (hasPrev) {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#1e40af';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              ‹
            </button>

            <button
              onClick={nextPage}
              disabled={!hasNext}
              aria-label="Next page"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: hasNext
                  ? 'linear-gradient(135deg, #1e40af, #3b82f6)'
                  : '#f1f5f9',
                border: hasNext ? 'none' : '1.5px solid #f1f5f9',
                color: hasNext ? '#ffffff' : '#cbd5e1',
                fontSize: '1.2rem',
                cursor: hasNext ? 'pointer' : 'not-allowed',
                boxShadow: hasNext
                  ? '0 6px 16px rgba(30, 64, 175, 0.3)'
                  : 'none',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                if (hasNext) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (hasNext) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* RESPONSIVE GALLERY GRID */}
      <Row className="g-1 g-sm-2 gallery-grid">
        {currentItems.map((item, idx) => {
          const isHovered = hovered === item._id;

          return (
            <Col
              key={item._id}
              style={{
                flex: `0 0 ${100 / imagesPerRow}%`,
                maxWidth: `${100 / imagesPerRow}%`,
                padding: '3px',
                animation: `galleryFadeIn 0.4s ease-out ${idx * 0.02}s both`,
              }}
            >
              <div
                className="position-relative overflow-hidden gallery-item"
                style={{
                  borderRadius: '10px',
                  cursor: 'pointer',
                  aspectRatio: '1 / 1',
                  background: '#f1f5f9',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isHovered
                    ? '0 12px 24px rgba(30, 64, 175, 0.22)'
                    : '0 2px 6px rgba(0, 0, 0, 0.05)',
                  transform: isHovered
                    ? 'translateY(-3px)'
                    : 'translateY(0)',
                  border: isHovered
                    ? '2px solid #1e40af'
                    : '2px solid transparent',
                }}
                onClick={() => setSelected(item)}
                onMouseEnter={() => setHovered(item._id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* IMAGE OR VIDEO */}
                {item.mediaType === 'image' ? (
                  <img
                    src={item.imageUrl}
                    alt={item.description || 'Gallery image'}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s',
                      transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                    }}
                  />
                ) : (
                  <>
                    <video
                      src={item.videoUrl}
                      muted
                      preload="metadata"
                      playsInline
                      aria-label={item.description || 'Gallery video'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />

                    <div
                      className="position-absolute d-flex align-items-center justify-content-center"
                      style={{
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: 'clamp(24px, 5vw, 36px)',
                          height: 'clamp(24px, 5vw, 36px)',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.95)',
                          color: '#dc2626',
                          fontSize: 'clamp(0.6rem, 1.5vw, 0.9rem)',
                          paddingLeft: '3px',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                          transition: 'transform 0.3s',
                          transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                        }}
                      >
                        ▶
                      </div>
                    </div>
                  </>
                )}

                {/* MEDIA TYPE BADGE */}
                <div
                  className="position-absolute"
                  style={{
                    top: '4px',
                    right: '4px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background:
                      item.mediaType === 'video'
                        ? 'rgba(220, 38, 38, 0.92)'
                        : 'rgba(30, 64, 175, 0.92)',
                    color: '#fff',
                    fontSize: 'clamp(0.5rem, 1vw, 0.6rem)',
                    fontWeight: 700,
                    backdropFilter: 'blur(8px)',
                    zIndex: 2,
                  }}
                >
                  {item.mediaType === 'video' ? '🎥' : '🖼️'}
                </div>

                {/* DESCRIPTION */}
                {item.description && (
                  <div
                    className="position-absolute w-100"
                    style={{
                      bottom: 0,
                      left: 0,
                      padding: '4px 6px',
                      background:
                        'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)',
                      color: '#fff',
                      fontSize: 'clamp(0.55rem, 1.2vw, 0.85rem)',
                      fontWeight: 500,
                      opacity: 1,
                      transition: 'all 0.3s',
                      lineHeight: 1.25,
                      maxHeight: '60%',
                      overflow: 'hidden',
                      overflowWrap: 'anywhere',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                    }}
                  >
                    {item.description}
                  </div>
                )}
              </div>
            </Col>
          );
        })}
      </Row>

      {/* PAGINATION DOTS */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4 flex-wrap">
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx)}
              aria-label={`Go to page ${idx + 1}`}
              aria-current={idx === page ? 'page' : undefined}
              style={{
                width: idx === page ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === page ? '#1e40af' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                if (idx !== page) {
                  e.currentTarget.style.background = '#94a3b8';
                }
              }}
              onMouseLeave={(e) => {
                if (idx !== page) {
                  e.currentTarget.style.background = '#cbd5e1';
                }
              }}
            />
          ))}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      <Modal
        show={!!selected}
        onHide={() => setSelected(null)}
        centered
        size="lg"
        contentClassName="border-0"
        backdropClassName="gallery-backdrop-blur"
        style={{ padding: 0 }}
      >
        <Modal.Body
          className="p-0 position-relative"
          style={{
            background: 'rgba(15, 23, 42, 0.98)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {selected?.mediaType === 'video' ? (
            <video
              key={selected.videoUrl}
              src={selected.videoUrl}
              controls
              autoPlay
              playsInline
              style={{
                width: '100%',
                maxHeight: '75vh',
                display: 'block',
                background: '#000',
              }}
            />
          ) : (
            <img
              src={selected?.imageUrl}
              alt={selected?.description || 'Gallery image'}
              style={{
                width: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}

          {selected?.description && (
            <div
              style={{
                padding: '12px 18px',
                background: 'rgba(15, 23, 42, 0.98)',
                color: '#e2e8f0',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                overflowWrap: 'anywhere',
              }}
            >
              📝 {selected.description}
            </div>
          )}

          {/* CLOSE BUTTON */}
          <button
            onClick={() => setSelected(null)}
            aria-label="Close gallery"
            className="position-absolute"
            style={{
              top: '10px',
              right: '10px',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.65)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              color: '#fff',
              fontSize: '0.95rem',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              zIndex: 5,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.65)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </Modal.Body>
      </Modal>

      {/* ANIMATIONS AND RESPONSIVE STYLES */}
      <style>{`
        @keyframes galleryFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gallery-backdrop-blur {
          background-color: rgba(0, 0, 0, 0.85) !important;
          backdrop-filter: blur(8px);
        }

        .gallery-container {
          min-width: 0;
        }

        .gallery-grid {
          width: 100%;
          margin-left: 0;
          margin-right: 0;
        }

        .gallery-item img,
        .gallery-item video {
          display: block;
        }

        @media (max-width: 400px) {
          .gallery-container {
            padding-left: 6px !important;
            padding-right: 6px !important;
          }

          .gallery-grid {
            --bs-gutter-x: 4px;
            --bs-gutter-y: 4px;
          }

          .gallery-item {
            border-radius: 7px !important;
          }
        }

        @media (max-width: 350px) {
          .gallery-container {
            margin-top: 12px !important;
            margin-bottom: 12px !important;
          }

          .gallery-container h4 {
            font-size: 1rem !important;
          }
        }

        @media (hover: none) {
          .gallery-item {
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </Container>
  );
}
