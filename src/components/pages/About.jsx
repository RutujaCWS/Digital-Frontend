import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function About() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://digitalworldkopargaonbackend.vercel.app/api/site-settings')
      .then(r => setSettings(r.data))
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" style={{ color: '#1e40af' }} />
        <p className="mt-3 text-muted small">Loading...</p>
      </Container>
    );
  }

  const fullAddress = [
    settings?.address?.shopNo,
    settings?.address?.street,
    settings?.address?.city,
    settings?.address?.state,
    settings?.address?.pincode
  ].filter(Boolean).join(', ');

  const companyName = settings?.companyName || 'Our Company';
  const tagline = settings?.tagline || 'The Computer Zone';
  const establishedYear = settings?.establishedYear;

  return (
    <>
      {/* ═══════════════════════════════════════════
          HERO HEADER
      ═══════════════════════════════════════════ */}
      <div
        className="position-relative"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          padding: '72px 0 96px',
          color: '#ffffff',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Decorative circles */}
        <div
          className="position-absolute"
          style={{
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            top: '-100px',
            right: '-80px'
          }}
        />
        <div
          className="position-absolute"
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            bottom: '-60px',
            left: '-40px'
          }}
        />

        <Container className="position-relative">
          <span
            className="d-inline-block fw-semibold mb-3"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.85)',
              padding: '6px 16px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '20px'
            }}
          >
            ✨ About Us
          </span>
          <h1
            className="fw-bold mb-3"
            style={{
              fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15
            }}
          >
            {companyName}
          </h1>
          <p
            className="mb-0 mx-auto"
            style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
              opacity: 0.92,
              maxWidth: '580px',
              lineHeight: 1.6
            }}
          >
            {tagline}
            {establishedYear && (
              <>
                {' '}— Trusted since <strong>{establishedYear}</strong>
              </>
            )}
          </p>
        </Container>
      </div>

      {/* Overlapping content section */}
      <Container style={{ marginTop: '-70px' }} className="pb-5">
        {/* ═══════════════════════════════════════════
            OUR STORY
        ═══════════════════════════════════════════ */}
        {settings.aboutStory && (
          <Row className="mb-4 mb-md-5">
            <Col lg={10} className="mx-auto">
              <Card
                className="border-0"
                style={{
                  borderRadius: '20px',
                  boxShadow: '0 12px 40px rgba(30, 64, 175, 0.10)',
                  background: '#ffffff'
                }}
              >
                <Card.Body className="p-4 p-md-5">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                        fontSize: '1.5rem',
                        color: '#ffffff'
                      }}
                    >
                      📖
                    </div>
                    <div>
                      <h4 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                        Our Story
                      </h4>
                      <small style={{ color: '#64748b' }}>How it all began</small>
                    </div>
                  </div>
                  <p
                    className="mb-0"
                    style={{
                      whiteSpace: 'pre-line',
                      lineHeight: 1.85,
                      fontSize: '0.95rem',
                      color: '#475569'
                    }}
                  >
                    {settings.aboutStory}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* ═══════════════════════════════════════════
            MISSION / VISION / VALUES
        ═══════════════════════════════════════════ */}
        {(settings.mission || settings.vision || settings.values) && (
          <div className={settings.aboutStory ? 'mt-5' : ''}>
            <div className="text-center mb-4 mb-md-5">
              <span
                className="d-inline-block fw-semibold mb-2"
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#3b82f6'
                }}
              >
                Our Foundation
              </span>
              <h3
                className="fw-bold mb-2"
                style={{
                  color: '#0f172a',
                  fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                  letterSpacing: '-0.02em'
                }}
              >
                What Drives Us
              </h3>
              <p className="text-muted small mb-0 mx-auto" style={{ maxWidth: '480px' }}>
                The values that shape everything we do
              </p>
            </div>

            <Row className="g-4">
              {settings.mission && (
                <Col md={6} lg={4}>
                  <Card
                    className="border-1 h-100 position-relative overflow-hidden"
                    style={{
                      borderRadius: '20px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(30, 64, 175, 0.12)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    {/* Top accent bar */}
                    <div
                      style={{
                        height: '3px',
                        background: 'linear-gradient(90deg, #1e40af, #3b82f6)'
                      }}
                    />
                    <Card.Body className="p-4">
                      <div
                        className="d-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '14px',
                          background: '#eff6ff',
                          fontSize: '1.6rem'
                        }}
                      >
                        🎯
                      </div>
                      <h5 className="fw-bold mb-2" style={{ color: '#0f172a', fontSize: '1.05rem' }}>
                        Our Mission
                      </h5>
                      <p
                        className="mb-0 small"
                        style={{
                          whiteSpace: 'pre-line',
                          lineHeight: 1.75,
                          color: '#64748b'
                        }}
                      >
                        {settings.mission}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              )}

              {settings.vision && (
                <Col md={6} lg={4}>
                  <Card
                    className="border-1 h-100 position-relative overflow-hidden"
                    style={{
                      borderRadius: '20px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(30, 64, 175, 0.12)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div
                      style={{
                        height: '3px',
                        background: 'linear-gradient(90deg, #1e40af, #3b82f6)'
                      }}
                    />
                    <Card.Body className="p-4">
                      <div
                        className="d-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '14px',
                          background: '#eff6ff',
                          fontSize: '1.6rem'
                        }}
                      >
                        👁️
                      </div>
                      <h5 className="fw-bold mb-2" style={{ color: '#0f172a', fontSize: '1.05rem' }}>
                        Our Vision
                      </h5>
                      <p
                        className="mb-0 small"
                        style={{
                          whiteSpace: 'pre-line',
                          lineHeight: 1.75,
                          color: '#64748b'
                        }}
                      >
                        {settings.vision}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              )}

              {settings.values && (
                <Col md={6} lg={4}>
                  <Card
                    className="border-1 h-100 position-relative overflow-hidden"
                    style={{
                      borderRadius: '20px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(30, 64, 175, 0.12)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div
                      style={{
                        height: '3px',
                        background: 'linear-gradient(90deg, #1e40af, #3b82f6)'
                      }}
                    />
                    <Card.Body className="p-4">
                      <div
                        className="d-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '14px',
                          background: '#eff6ff',
                          fontSize: '1.6rem'
                        }}
                      >
                        💎
                      </div>
                      <h5 className="fw-bold mb-2" style={{ color: '#0f172a', fontSize: '1.05rem' }}>
                        Our Values
                      </h5>
                      <p
                        className="mb-0 small"
                        style={{
                          whiteSpace: 'pre-line',
                          lineHeight: 1.75,
                          color: '#64748b'
                        }}
                      >
                        {settings.values}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )}

        {/* ═══════════════════════════════════════════
    BUSINESS INFO + CTA — Side by Side (2 columns)
═══════════════════════════════════════════ */}
{(settings.gstNumber || fullAddress) && (
  <Row className="mt-5 g-4 align-items-stretch">
    {/* LEFT: Business Information */}
    <Col lg={7}>
      <Card
        className="border-1 h-100"
        style={{
          borderRadius: '20px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        <Card.Body className="p-4 p-md-5">
          {/* Header */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                fontSize: '1.3rem',
                color: '#ffffff'
              }}
            >
              🏢
            </div>
            <div>
              <h5
                className="fw-bold mb-0"
                style={{
                  color: '#0f172a',
                  fontSize: '1.1rem',
                  letterSpacing: '-0.01em'
                }}
              >
                Business Information
              </h5>
              <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
                Official registration details
              </small>
            </div>
          </div>

          {/* Info items - stacked vertically */}
          <div className="d-flex flex-column gap-3">
            {settings.gstNumber && (
              <div
                className="p-3 p-md-4"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '9px',
                      background: '#eff6ff',
                      fontSize: '0.9rem'
                    }}
                  >
                    🏛️
                  </div>
                  <span
                    className="fw-semibold text-uppercase"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#3b82f6'
                    }}
                  >
                    GST Number
                  </span>
                </div>
                <div
                  className="fw-bold"
                  style={{
                    fontSize: '1rem',
                    color: '#0f172a',
                    wordBreak: 'break-word',
                    letterSpacing: '0.02em',
                    fontFamily: 'monospace'
                  }}
                >
                  {settings.gstNumber}
                </div>
                <div
                  className="mt-2 d-flex align-items-center gap-1"
                  style={{ fontSize: '0.75rem', color: '#64748b' }}
                >
                  <span style={{ color: '#10b981' }}>✓</span> Verified
                </div>
              </div>
            )}

            {fullAddress && (
              <div
                className="p-3 p-md-4"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '9px',
                      background: '#eff6ff',
                      fontSize: '0.9rem'
                    }}
                  >
                    📍
                  </div>
                  <span
                    className="fw-semibold text-uppercase"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: '#3b82f6'
                    }}
                  >
                    Registered Address
                  </span>
                </div>
                <div
                  className="fw-semibold"
                  style={{
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    lineHeight: 1.6
                  }}
                >
                  {fullAddress}
                </div>
                <div
                  className="mt-2 d-flex align-items-center gap-1"
                  style={{ fontSize: '0.75rem', color: '#64748b' }}
                >
                  <span style={{ color: '#10b981' }}>✓</span> Primary location
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </Col>

    {/* RIGHT: CTA Card */}
    <Col lg={5}>
      <div
        className="h-100 d-flex flex-column align-items-center justify-content-center text-center position-relative overflow-hidden p-4 p-md-5"
        style={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: '#ffffff',
          minHeight: '100%'
        }}
      >
        {/* Decorative circles */}
        <div
          className="position-absolute"
          style={{
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            top: '-80px',
            right: '-60px'
          }}
        />
        <div
          className="position-absolute"
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            bottom: '-40px',
            left: '-30px'
          }}
        />

        <div className="position-relative">
          <div
            className="d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontSize: '1.6rem'
            }}
          >
            💬
          </div>

          <span
            className="d-block fw-semibold mb-2"
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.75)'
            }}
          >
            Get in touch
          </span>

          <h4
            className="fw-bold mb-2"
            style={{
              fontSize: 'clamp(1.15rem, 2.5vw, 1.5rem)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}
          >
            Want to know more?
          </h4>

          <p
            className="mb-4 mx-auto"
            style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: '340px',
              lineHeight: 1.6
            }}
          >
            Get in touch with our team — we'd love to hear from you
          </p>

          <Link
            to="/contact"
            className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-2"
            style={{
              background: '#ffffff',
              color: '#1e40af',
              padding: '0.7rem 1.75rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
            }}
          >
            Contact Us <span>→</span>
          </Link>
        </div>
      </div>
    </Col>
  </Row>
)}

{/* CTA Footer — only if Business Info is NOT shown (fallback) */}
{!(settings.gstNumber || fullAddress) && (
  <Row className="mt-5">
    <Col lg={10} className="mx-auto">
      <div
        className="text-center p-4 p-md-5 position-relative overflow-hidden"
        style={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe'
        }}
      >
        <div className="position-relative">
          <div
            className="d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              fontSize: '1.6rem',
              color: '#ffffff'
            }}
          >
            💬
          </div>
          <h4
            className="fw-bold mb-2"
            style={{
              color: '#0f172a',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              letterSpacing: '-0.01em'
            }}
          >
            Want to know more?
          </h4>
          <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '420px' }}>
            Get in touch with our team — we'd love to hear from you
          </p>
          <Link
            to="/contact"
            className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              color: '#ffffff',
              padding: '0.7rem 1.75rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              boxShadow: '0 6px 16px rgba(30, 64, 175, 0.25)'
            }}
          >
            Contact Us <span>→</span>
          </Link>
        </div>
      </div>
    </Col>
  </Row>
)}
        
      </Container>
    </>
  );
}