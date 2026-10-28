import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    axios.get('https://digital-backend-fv2v.onrender.com/api/site-settings')
      .then(r => setSettings(r.data))
      .catch(() => {});
  }, []);

  const fullAddress = [
    settings?.address?.shopNo,
    settings?.address?.street,
    settings?.address?.city,
    settings?.address?.state,
    settings?.address?.pincode
  ].filter(Boolean).join(', ');

  return (
    <footer className="site-footer">
      <Container>
        <Row className="g-4">
          <Col md={3} xs={6}>
            <h6>Company</h6>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
          </Col>
          <Col md={3} xs={6}>
            <h6>Products</h6>
            <Link to="/?category=Laptops">Laptops</Link>
            <Link to="/?category=Desktops">Desktops</Link>
            <Link to="/?category=Printers">Printers</Link>
            <Link to="/?category=Accessories">Accessories</Link>
          </Col>
          <Col md={3} xs={6}>
            <h6>Support</h6>
            <Link to="/support">Support Center</Link>
            <a href="#">Warranty</a>
            <a href="#">Returns</a>
            <a href="#">FAQ</a>
          </Col>
          <Col md={3} xs={6}>
            <h6>Get in Touch</h6>
            <div style={{ fontSize: '.85rem', lineHeight: '1.8' }}>
              <strong>{settings?.companyName || 'Digital World'}</strong><br />
              {fullAddress && <>{fullAddress}<br /></>}
              {settings?.phone1 && <>📞 {settings.phone1}<br /></>}
              {settings?.email1 && <>✉️ {settings.email1}</>}
            </div>
            <div className="mt-3">
              {settings?.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" className="d-inline me-2">📘</a>}
              {settings?.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" className="d-inline me-2">📷</a>}
              {settings?.twitter && <a href={settings.twitter} target="_blank" rel="noreferrer" className="d-inline me-2">🐦</a>}
              {settings?.youtube && <a href={settings.youtube} target="_blank" rel="noreferrer" className="d-inline">▶️</a>}
            </div>
          </Col>
        </Row>
        <div className="footer-bottom">
          {settings?.footerText || `© ${new Date().getFullYear()} ${settings?.companyName || 'Digital World'}. All rights reserved.`}
        </div>
      </Container>
    </footer>
  );
}