import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function VisitOurStore({ settings }) {
  if (!settings) return null;

  const addressParts = [
    settings?.address?.shopNo,
    settings?.address?.street,
    settings?.address?.city,
    settings?.address?.state,
    settings?.address?.pincode
  ].filter(Boolean);

  const fullAddress = addressParts.join(', ');

  const hasPhone = settings?.phone1 || settings?.phone2;
  const hasEmail = settings?.email1 || settings?.email2;
  const hasWhatsapp = settings?.whatsapp;
  const hasAddress = addressParts.length > 0;
  const hasHours = settings?.workingHours;

  // Jar kahi nahi asel tar section hide
  if (!hasPhone && !hasEmail && !hasWhatsapp && !hasAddress && !hasHours) {
    return null;
  }

  return (
    <Card
      className="border-0 h-100"
      style={{
        borderRadius: '20px',
        background: '#ffffff',
        border: '1px solid #e2e8f0'
      }}
    >
      <Card.Body className="p-4">
        {/* HEADER */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <span style={{ fontSize: '1.2rem' }}>📍</span>
          <h5
            className="fw-bold mb-0"
            style={{ color: '#1e40af', fontSize: '1.05rem' }}
          >
            Visit Our Store
          </h5>
        </div>

        {/* INFO LIST */}
        <div className="d-flex flex-column gap-3">
          {/* Phone */}
          {hasPhone && (
            <div className="d-flex align-items-start gap-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#eff4ff',
                  fontSize: '1rem'
                }}
              >
                📞
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div
                  className="fw-semibold mb-1"
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#64748b'
                  }}
                >
                  Phone
                </div>
                {settings.phone1 && (
                  <a
                    href={`tel:${settings.phone1.replace(/\s/g, '')}`}
                    className="d-block text-decoration-none mb-1"
                    style={{
                      fontSize: '0.88rem',
                      color: '#1e293b',
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}
                  >
                    {settings.phone1}
                  </a>
                )}
                {settings.phone2 && (
                  <a
                    href={`tel:${settings.phone2.replace(/\s/g, '')}`}
                    className="d-block text-decoration-none"
                    style={{
                      fontSize: '0.88rem',
                      color: '#1e293b',
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}
                  >
                    {settings.phone2}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Email */}
          {hasEmail && (
            <div className="d-flex align-items-start gap-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#eff4ff',
                  fontSize: '1rem'
                }}
              >
                ✉️
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div
                  className="fw-semibold mb-1"
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#64748b'
                  }}
                >
                  Email
                </div>
                {settings.email1 && (
                  <a
                    href={`mailto:${settings.email1}`}
                    className="d-block text-decoration-none mb-1"
                    style={{
                      fontSize: '0.88rem',
                      color: '#1e293b',
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}
                  >
                    {settings.email1}
                  </a>
                )}
                {settings.email2 && (
                  <a
                    href={`mailto:${settings.email2}`}
                    className="d-block text-decoration-none"
                    style={{
                      fontSize: '0.88rem',
                      color: '#1e293b',
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}
                  >
                    {settings.email2}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* WhatsApp */}
          {hasWhatsapp && (
            <div className="d-flex align-items-start gap-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#eff4ff',
                  fontSize: '1rem'
                }}
              >
                💬
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div
                  className="fw-semibold mb-1"
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#64748b'
                  }}
                >
                  WhatsApp
                </div>
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="d-block text-decoration-none"
                  style={{
                    fontSize: '0.88rem',
                    color: '#1e293b',
                    fontWeight: 500,
                    wordBreak: 'break-word'
                  }}
                >
                  {settings.whatsapp}
                </a>
              </div>
            </div>
          )}

          {/* Address */}
          {hasAddress && (
            <div className="d-flex align-items-start gap-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#eff4ff',
                  fontSize: '1rem'
                }}
              >
                🏢
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div
                  className="fw-semibold mb-1"
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#64748b'
                  }}
                >
                  Shop Address
                </div>
                <div
                  style={{
                    fontSize: '0.88rem',
                    color: '#1e293b',
                    fontWeight: 500,
                    lineHeight: 1.55
                  }}
                >
                  {fullAddress}
                </div>
              </div>
            </div>
          )}

          {/* Working Hours */}
          {hasHours && (
            <div className="d-flex align-items-start gap-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#eff4ff',
                  fontSize: '1rem'
                }}
              >
                🕐
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div
                  className="fw-semibold mb-1"
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#64748b'
                  }}
                >
                  Opening Hours
                </div>
                <div
                  style={{
                    fontSize: '0.88rem',
                    color: '#1e293b',
                    fontWeight: 500,
                    whiteSpace: 'pre-line',
                    lineHeight: 1.55
                  }}
                >
                  {settings.workingHours}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div
          className="mt-4 pt-3"
          style={{ borderTop: '1px solid #e2e8f0' }}
        >
          <Button
            as={Link}
            to="/contact"
            className="fw-semibold border-0 d-inline-flex align-items-center gap-2"
            style={{
              background: '#1e40af',
              borderRadius: '10px',
              padding: '0.55rem 1.3rem',
              fontSize: '0.85rem',
              boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)'
            }}
          >
            Contact Us
            <span>→</span>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}