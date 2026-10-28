import { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Form, Button,
  Alert, Spinner, Badge, InputGroup
} from 'react-bootstrap';
import axios from 'axios';

const ENQUIRY_TYPES = [
  'Laptop / Desktop Enquiry',
  'Product Availability',
  'Computer Repair',
  'Printer Setup / Installation',
  'CCTV Installation',
  'Home Visit / Technical Support',
  'Order / Delivery Issue',
  'Warranty / Service',
  'Other'
];

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  enquiryType: '',
  message: ''
};

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState('');

  useEffect(() => {
    axios.get('https://digital-backend-fv2v.onrender.com/api/site-settings')
      .then(res => setSettings(res.data))
      .catch(() => setSettings({}))
      .finally(() => setLoadingSettings(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter valid Indian mobile (10 digits starting with 6-9)';
    }

    if (!form.enquiryType) {
      newErrors.enquiryType = 'Please select an enquiry type';
    }

    if (!form.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg('');

    if (!validate()) return;
    if (submitting) return;

    setSubmitting(true);

    try {
      await axios.post('https://digital-backend-fv2v.onrender.com/api/contact', form);

      setForm(INITIAL_FORM);
      setErrors({});
      alert('✅ Thank you! Your message has been sent successfully. Our team will contact you within 24 hours.');
      setTimeout(() => setServerMsg(''), 8000);
    } catch (err) {
      setServerMsg('❌ ' + (err.response?.data?.message || 'Failed to send message. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setServerMsg('');
  
  //   if (!validate()) return;
  //   if (submitting) return;
  
  //   setSubmitting(true);
  
  //   // ═══════════════════════════════════════════
  //   // STEP 1: Save to database
  //   // ═══════════════════════════════════════════
  //   let savedToDB = false;
  //   try {
  //     await axios.post('https://digital-backend-fv2v.onrender.com/api/contact', form);
  //     savedToDB = true;
  //   } catch (err) {
  //     console.error('DB save failed:', err);
  //     // Continue to WhatsApp even if DB fails
  //   }
  
  //   // ═══════════════════════════════════════════
  //   // STEP 2: Open WhatsApp with pre-filled message
  //   // ═══════════════════════════════════════════
  //   const adminWhatsApp = (settings?.whatsapp || '').replace(/\D/g, '');
  
  //   if (!adminWhatsApp) {
  //     setServerMsg('❌ Admin WhatsApp number not configured. Please contact support.');
  //     setSubmitting(false);
  //     return;
  //   }
  
  //   // Build WhatsApp message with all form details
  //   const waMessage = `🔔 *NEW ENQUIRY — Digital World*
  
  // Name: ${form.fullName}
  // Phone: ${form.phone}
  // Email: ${form.email}
  // Enquiry Type: ${form.enquiryType}
  
  // Message:
  // ${form.message}
  // `;
  
  //   const encodedMessage = encodeURIComponent(waMessage);
  //   const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodedMessage}`;
  
  //   // Open WhatsApp in new tab
  //   window.open(whatsappUrl, '_blank');
  
  //   // Show success message
  //   setServerMsg(
  //     savedToDB
  //       ? '✅ Thank you! WhatsApp opened. Please press *Send* in WhatsApp to complete your enquiry.'
  //       : '✅ WhatsApp opened. Please press *Send* in WhatsApp to complete your enquiry.'
  //   );
  
  //   // Reset form
  //   setForm(INITIAL_FORM);
  //   setErrors({});
  //   setTimeout(() => setServerMsg(''), 10000);
  //   setSubmitting(false);
  // };


  if (loadingSettings) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" style={{ color: '#1e40af' }} />
        <p className="mt-3 text-muted small">Loading contact information...</p>
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

  const whatsappClean = settings?.whatsapp
    ? settings.whatsapp.replace(/\D/g, '')
    : '';

  // Contact detail items array
  const contactItems = [
    (settings?.phone1 || settings?.phone2) && {
      icon: '📞',
      label: 'Phone',
      content: (
        <>
          {settings.phone1 && (
            <a
              href={`tel:${settings.phone1.replace(/\s/g, '')}`}
              className="d-block text-decoration-none fw-semibold mb-1"
              style={{ color: '#0f172a', fontSize: '0.9rem' }}
            >
              {settings.phone1}
            </a>
          )}
          {settings.phone2 && (
            <a
              href={`tel:${settings.phone2.replace(/\s/g, '')}`}
              className="d-block text-decoration-none fw-semibold"
              style={{ color: '#0f172a', fontSize: '0.9rem' }}
            >
              {settings.phone2}
            </a>
          )}
        </>
      )
    },
    (settings?.email1 || settings?.email2) && {
      icon: '✉️',
      label: 'Email',
      content: (
        <>
          {settings.email1 && (
            <a
              href={`mailto:${settings.email1}`}
              className="d-block text-decoration-none fw-semibold mb-1"
              style={{ color: '#0f172a', fontSize: '0.9rem', wordBreak: 'break-word' }}
            >
              {settings.email1}
            </a>
          )}
          {settings.email2 && (
            <a
              href={`mailto:${settings.email2}`}
              className="d-block text-decoration-none fw-semibold"
              style={{ color: '#0f172a', fontSize: '0.9rem', wordBreak: 'break-word' }}
            >
              {settings.email2}
            </a>
          )}
        </>
      )
    },
    whatsappClean && {
      icon: '💬',
      label: 'WhatsApp',
      content: (
        <>
          <div className="fw-semibold mb-2" style={{ color: '#0f172a', fontSize: '0.9rem' }}>
            {settings.whatsapp}
          </div>
          <a
            href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent('Hello! I would like to enquire about your products/services.')}`}
            target="_blank"
            rel="noreferrer"
            className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-1"
            style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              color: '#ffffff',
              padding: '0.35rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.75rem'
            }}
          >
            💬 Chat Now
          </a>
        </>
      )
    },
    fullAddress && {
      icon: '📍',
      label: 'Address',
      content: (
        <>
          {settings?.companyName && (
            <div className="fw-semibold mb-1" style={{ color: '#0f172a', fontSize: '0.9rem' }}>
              {settings.companyName}
            </div>
          )}
          <div style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.55 }}>
            {fullAddress}
          </div>
        </>
      )
    },
    settings?.workingHours && {
      icon: '🕐',
      label: 'Opening Hours',
      content: (
        <div
          className="fw-semibold"
          style={{
            color: '#0f172a',
            fontSize: '0.85rem',
            whiteSpace: 'pre-line',
            lineHeight: 1.6
          }}
        >
          {settings.workingHours}
        </div>
      )
    }
  ].filter(Boolean);

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
          <h1
            className="fw-bold mb-3"
            style={{
              fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15
            }}
          >
            Contact Us
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
            Have a question or need assistance? We're here to help.
          </p>
        </Container>
      </div>

      <Container style={{ marginTop: '-70px' }} className="pb-5 position-relative" >
        {/* ═══════════════════════════════════════════
            MAIN SECTION — FORM + CONTACT DETAILS
        ═══════════════════════════════════════════ */}
        <Row className="g-4 mb-5 align-items-stretch">
          {/* LEFT — SEND US A MESSAGE FORM */}
          <Col lg={7}>
            <Card
              className="border-0 h-100"
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
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                      fontSize: '1.3rem',
                      color: '#ffffff'
                    }}
                  >
                    ✉️
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1.1rem' }}>
                      Send Us a Message
                    </h5>
                    <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      Fill in the form below and we'll get back to you
                    </small>
                  </div>
                </div>

                {serverMsg && (
                  <Alert
                    variant={serverMsg.startsWith('✅') ? 'success' : 'danger'}
                    className="border-0 small"
                    style={{ borderRadius: '10px' }}
                  >
                    {serverMsg}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} noValidate>
                  <Row className="g-3">
                    {/* Full Name */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                          Full Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          isInvalid={!!errors.fullName}
                          disabled={submitting}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.fullName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Email */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                          Email Address <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          isInvalid={!!errors.email}
                          disabled={submitting}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Phone */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                          Phone Number <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text
                            style={{
                              background: '#f8fafc',
                              borderColor: '#e2e8f0',
                              borderRadius: '10px 0 0 10px',
                              fontSize: '0.9rem'
                            }}
                          >
                            +91
                          </InputGroup.Text>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                phone: e.target.value.replace(/\D/g, '').slice(0, 10)
                              })
                            }
                            placeholder="10-digit mobile"
                            isInvalid={!!errors.phone}
                            disabled={submitting}
                            maxLength={10}
                            style={{
                              background: '#f8fafc',
                              borderColor: '#e2e8f0',
                              borderRadius: '0 10px 10px 0',
                              fontSize: '0.9rem'
                            }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.phone}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    {/* Enquiry Type */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                          Enquiry Type <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="enquiryType"
                          value={form.enquiryType}
                          onChange={handleChange}
                          isInvalid={!!errors.enquiryType}
                          disabled={submitting}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                          }}
                        >
                          <option value="">-- Select Enquiry Type --</option>
                          {ENQUIRY_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.enquiryType}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Message */}
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                          Message <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help you..."
                          isInvalid={!!errors.message}
                          disabled={submitting}
                          maxLength={1000}
                          style={{
                            background: '#f8fafc',
                            borderColor: '#e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            resize: 'none'
                          }}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.message}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted small">
                          {form.message.length}/1000 characters
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Button
                        type="submit"
                        className="w-100 fw-semibold border-0 d-flex align-items-center justify-content-center gap-2"
                        disabled={submitting}
                        style={{
                          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                          color: '#ffffff',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)'
                        }}
                      >
                        {submitting ? (
                          <>
                            <Spinner animation="border" size="sm" />
                            Sending...
                          </>
                        ) : (
                          <>📩 Send Message</>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT — CONTACT DETAILS */}
          <Col lg={5}>
            <Card
              className="border-0 h-100"
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
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                      fontSize: '1.3rem',
                      color: '#ffffff'
                    }}
                  >
                    📇
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1.1rem' }}>
                      Contact Details
                    </h5>
                    <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      Reach us through these channels
                    </small>
                  </div>
                </div>

                {/* Contact items */}
                <div className="d-flex flex-column gap-3">
                  {contactItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="d-flex align-items-start gap-3 p-3"
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
                      <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: '42px',
                          height: '30px',
                          borderRadius: '12px',
                          background: '#eff6ff',
                          fontSize: '1.15rem'
                        }}
                      >
                        {item.icon}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          className="fw-semibold text-uppercase mb-1"
                          style={{
                            fontSize: '0.65rem',
                            letterSpacing: '0.1em',
                            color: '#3b82f6'
                          }}
                        >
                          {item.label}
                        </div>
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ═══════════════════════════════════════════
            MAP SECTION
        ═══════════════════════════════════════════ */}
       <Row>
  <Col lg={12} className="mx-auto">
    <Card
      className="border-1 shadow-sm mb-5"
      style={{
        borderRadius: '15px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}
    >
      <Card.Body className="p-3 p-md-4">
        <div className="text-center mb-3">
          <h5
            className="fw-bold mb-1"
            style={{
              color: '#0f172a',
              fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)',
              letterSpacing: '-0.02em'
            }}
          >
            Find Us Here
          </h5>
          <p className="text-muted small mb-0 mx-auto" style={{ maxWidth: '520px' }}>
            {fullAddress || 'Location will be updated soon'}
          </p>
        </div>

        {settings?.googleMapUrl ? (
          <div
            style={{
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
          >
            <iframe
              src={settings.googleMapUrl}
              width="100%"
              height="320"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Shop Location"
            />
          </div>
        ) : (
          <div
            className="text-center p-4"
            style={{
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px dashed #cbd5e1'
            }}
          >
            <div style={{ fontSize: '3rem' }}>🗺️</div>
            <p className="text-muted mt-2 mb-0 small">
              Map location will be added by admin
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  </Col>
</Row>
      </Container>
    </>
  );
}

