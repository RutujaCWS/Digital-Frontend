import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import axios from 'axios';

export default function BrandStrip() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://digitalworldkopargaonbackend.vercel.app/api/brands')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setBrands(res.data);
        }
      })
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || brands.length === 0) return null;

  return (
    <Container fluid className="px-0 px-sm-2 px-md-4 my-4">
      <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4 p-md-5">
          {/* HEADER */}
          <div className="text-center mb-4">
            <h5
              className="fw-bold mb-1"
              style={{ color: '#1e293b' }}
            >
              Authorized Dealer For
            </h5>
            <p className="text-muted small mb-0">
              We're proud to partner with leading technology brands
            </p>
          </div>

          {/* BRANDS GRID */}
          <Row className="g-3 justify-content-center">
            {brands.map((b, i) => (
              <Col
                key={b._id || i}
                xs={4}
                sm={3}
                md={3}
                lg={2}
              >
                <div
                  className="d-flex align-items-center justify-content-center bg-white h-100"
                  style={{
                    minHeight: '80px',
                    padding: '16px 8px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#1e40af';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(30, 64, 175, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {b.logo ? (
                    <Image
                      src={b.logo}
                      alt={b.name}
                      style={{
                        maxHeight: '50px',
                        maxWidth: '100%',
                        objectFit: 'contain'
                        // ✅ grayscale + opacity kadle — colors always visible
                      }}
                    />
                  ) : (
                    <div
                      className="fw-bold text-center text-truncate"
                      style={{
                        fontSize: '1.1rem',
                        fontStyle: 'italic',
                        color: '#1e40af',  // ✅ blue color for text-based brands
                        letterSpacing: '0.5px'
                      }}
                      title={b.name}
                    >
                      {b.name}
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}