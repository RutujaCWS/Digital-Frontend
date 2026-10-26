import { useEffect, useState } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';

export default function FeatureBar() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://digital-backend-phi.vercel.app/api/site-settings')
      .then(res => {
        if (res.data?.features && res.data.features.length > 0) {
          const sorted = [...res.data.features].sort(
            (a, b) => (a.order || 0) - (b.order || 0)
          );
          setFeatures(sorted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || features.length === 0) return null;

  return (
    <Container fluid className="px-md-4 mb-5">
      <div
        className="rounded-4 p-4 p-md-5 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
          border: '1px solid #f0f0f0'
        }}
      >
        {/* HEADER */}
        <div className="text-center mb-5">
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
            ✨ WHY CHOOSE US
          </Badge>

          <h3 className="fw-bold mb-2">
            Everything You Need,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #2874f0, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              All in One Place
            </span>
          </h3>

          <p className="text-muted mb-0">
            We deliver quality, trust, and convenience with every order
          </p>

          <div
            className="mx-auto mt-3"
            style={{
              width: '60px',
              height: '4px',
              background: 'linear-gradient(90deg, #2874f0, #7c3aed)',
              borderRadius: '2px'
            }}
          />
        </div>

        {/* FEATURES GRID */}
        <Row className="g-3 justify-content-center">
          {features.map((f, i) => (
            <Col key={i} xs={6} md={4} lg={features.length >= 5 ? 2 : 3}>
              <div
                className="h-100 text-center p-4 rounded-4 bg-white"
                style={{
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(40, 116, 240, 0.15)';
                  e.currentTarget.style.borderColor = '#2874f0';
                  const iconWrap = e.currentTarget.querySelector('.icon-wrap');
                  if (iconWrap) {
                    iconWrap.style.transform = 'scale(1.15) rotate(8deg)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  const iconWrap = e.currentTarget.querySelector('.icon-wrap');
                  if (iconWrap) {
                    iconWrap.style.transform = 'scale(1) rotate(0deg)';
                  }
                }}
              >
                {/* Icon Circle */}
                <div
                  className="icon-wrap mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '72px',
                    height: '72px',
                    background: f.color || '#e3f2fd',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    transition: 'transform 0.4s ease'
                  }}
                >
                  <span style={{ fontSize: '2rem', lineHeight: 1 }}>
                    {f.icon || '✨'}
                  </span>
                </div>

                {/* Title */}
                <h6 className="fw-bold mb-1" style={{ fontSize: '.95rem', color: '#212121' }}>
                  {f.title}
                </h6>

                {/* Description */}
                {f.description && (
                  <p className="text-muted mb-0" style={{ fontSize: '.8rem', lineHeight: 1.4 }}>
                    {f.description}
                  </p>
                )}
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
}