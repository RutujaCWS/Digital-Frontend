import { useState } from 'react';
import { Row, Col, Card, Placeholder, Button } from 'react-bootstrap';
import ProductCard from '../ProductCard';

const INITIAL_LIMIT = 10;

export default function FeaturedProducts({ products, loading }) {
  const [showAll, setShowAll] = useState(false);

  // ═══════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════
  if (loading) {
    return (
      <Row xs={2} sm={2} md={3} lg={5} className="g-2 g-md-3">
        {[...Array(10)].map((_, i) => (
          <Col key={i}>
            <Card
              className="border-0 shadow-sm h-100"
              style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
            >
              <Card.Body className="p-3">
                <Placeholder as="div" animation="glow" className="mb-3">
                  <Placeholder
                    xs={12}
                    style={{ height: '140px', borderRadius: '8px' }}
                  />
                </Placeholder>
                <Placeholder as="p" animation="glow" className="mb-2">
                  <Placeholder xs={9} />
                </Placeholder>
                <Placeholder as="p" animation="glow" className="mb-2">
                  <Placeholder xs={5} />
                </Placeholder>
                <Placeholder as="p" animation="glow" className="mb-3">
                  <Placeholder xs={6} />
                </Placeholder>
                <Placeholder.Button xs={12} variant="warning" size="sm" />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  // ═══════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════
  if (products.length === 0) {
    return (
      <Card
        className="border-0 shadow-sm"
        style={{ borderRadius: '12px' }}
      >
        <Card.Body className="text-center py-5 text-muted">
          <div style={{ fontSize: '3rem' }}>🔍</div>
          <p className="mt-2 mb-0 fw-semibold">No products found</p>
          <small>Try a different search or category</small>
        </Card.Body>
      </Card>
    );
  }

  // ═══════════════════════════════════════════
  // PRODUCTS GRID + VIEW ALL
  // ═══════════════════════════════════════════
  const displayedProducts = showAll ? products : products.slice(0, INITIAL_LIMIT);
  const hasMore = products.length > INITIAL_LIMIT;

  return (
    <>
     <Row xs={2} sm={2} md={3} lg={5} className="g-2 g-md-3">
        {displayedProducts.map(p => (
          <Col key={p._id}>
            <ProductCard product={p} />
          </Col>
        ))}
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
              <>View All {products.length} Products ↓</>
            )}
          </Button>
        </div>
      )}
    </>
  );
}