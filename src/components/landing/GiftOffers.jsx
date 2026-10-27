import { useState } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const INITIAL_LIMIT = 8;

export default function GiftOffers({ products }) {
  const [showAll, setShowAll] = useState(false);

  if (!products.length) return null;

  const displayedProducts = showAll ? products : products.slice(0, INITIAL_LIMIT);
  const hasMore = products.length > INITIAL_LIMIT;

  return (
    <Container fluid className="px-0 px-sm-2 px-md-4 my-4">
      <div
        className="p-3 p-md-4 bg-white"
        style={{
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* HEADER */}
        <div className="text-center mb-4">
          <Badge
            bg="light"
            text="dark"
            className="px-3 py-2 mb-3"
            style={{
              fontSize: '.75rem',
              letterSpacing: '1.5px',
              border: '1px solid #2874f0',
              color: '#2874f0',
              fontWeight: 600
            }}
          >
            🎁 EXPLORE GIFTS
          </Badge>
          <h4 className="fw-bold mb-1">Free Gifts with Purchase!</h4>
          <p className="text-muted small mb-0">
            Buy select products and get exciting gifts absolutely FREE
          </p>
        </div>

        {/* PRODUCTS GRID */}
        <Row xs={2} sm={2} md={3} lg={4} className="g-2 g-md-3">
          {displayedProducts.map(p => {
            const gifts = p.gifts || [];
            const giftCount = gifts.length;

            const giftLabel = giftCount === 0
              ? 'Surprise Gift'
              : giftCount === 1
                ? gifts[0].name
                : `${giftCount} Free Gifts`;

            const totalGiftValue = gifts.reduce(
              (sum, g) => sum + (Number(g.value) || 0),
              0
            );

            return (
              <Col key={p._id}>
                <div
                  className="h-100 d-flex flex-column p-2 p-md-3 bg-white position-relative"
                  style={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                                    {/* ✅ Condition Badge — Top Left */}
                                    <span
                    className="position-absolute fw-bold"
                    style={{
                      top: '6px',
                      left: '6px',
                      background: p.condition === 'Second Hand'
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: '#ffffff',
                      fontSize: '0.6rem',
                      padding: '3px 7px',
                      borderRadius: '6px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      zIndex: 2
                    }}
                  >
                    {p.condition === 'Second Hand' ? '♻️ Second Hand' : '🆕 New'}
                  </span>

                  {/* Gift count badge — Top Right */}
                  {giftCount > 0 && (
                    <Badge
                      bg="danger"
                      className="position-absolute"
                      style={{
                        top: '6px',
                        right: '6px',
                        fontSize: '0.75rem',
                        padding: '3px 6px',
                        zIndex: 1,
                        borderRadius: '6px'
                      }}
                    >
                      🎁 {giftCount}
                    </Badge>
                  )}

                  {/* Product image */}
                  <div
                    className="d-flex align-items-center justify-content-center mb-2"
                    style={{ height: '90px' }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>

                  {/* Product info */}
                  <h6
                    className="fw-bold mb-1 text-truncate"
                    style={{ fontSize: '0.85rem', color: '#1e293b' }}
                    title={p.name}
                  >
                    {p.name}
                  </h6>
                  <p className="text-muted small mb-2">
                    ₹{p.price.toLocaleString()}
                  </p>

                  {/* Gift info box */}
                  <div
                    className="p-2 mb-2 mt-auto"
                    style={{
                      borderRadius: '8px',
                      border: '1px dashed #cbd5e1'
                    }}
                  >
                    <div
                      className="text-uppercase fw-bold text-muted"
                      style={{
                        fontSize: '0.6rem',
                        letterSpacing: '1px'
                      }}
                    >
                      🎁 Free {giftCount > 1 ? 'Gifts' : 'Gift'}
                    </div>

                    <div
                      className="fw-bold text-truncate"
                      style={{ fontSize: '0.75rem' }}
                      title={giftLabel}
                    >
                      {giftLabel}
                    </div>

                    {totalGiftValue > 0 && (
                      <div
                        className="text-muted"
                        style={{ fontSize: '0.65rem' }}
                      >
                        Worth ₹{totalGiftValue.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Button */}
                  <Button
                    as={Link}
                    to={`/product/${p._id}`}
                    variant="danger"
                    size="sm"
                    className="fw-bold w-100 border-0"
                    style={{
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      padding: '6px'
                    }}
                  >
                    Grab Offer →
                  </Button>
                </div>
              </Col>
            );
          })}
        </Row>

        {/* VIEW ALL / SHOW LESS */}
        {hasMore && (
          <div className="text-center mt-4">
            <Button
              variant="outline-primary"
              className="fw-semibold px-4 py-2"
              style={{ borderRadius: '24px', fontSize: '0.85rem' }}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>Show Less ↑</>
              ) : (
                <>View All {products.length} Offers ↓</>
              )}
            </Button>
          </div>
        )}

      </div>
    </Container>
  );
}