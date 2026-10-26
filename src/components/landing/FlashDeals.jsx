import { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import ProductCard from '../ProductCard';

export default function FlashDeals({ products, loading }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end - now);
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (loading || products.length === 0) return null;
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <Container fluid className="px-md-4 mb-4">
      <div className="flash-header">
        <div>
          <h4 className="mb-0 fw-bold">⚡ Flash Deals</h4>
          <small className="opacity-75">Hurry! Limited time offer</small>
        </div>
        <div className="countdown">
          <div className="countdown-box">{pad(timeLeft.h)}<small>HRS</small></div>
          <div className="countdown-box">{pad(timeLeft.m)}<small>MIN</small></div>
          <div className="countdown-box">{pad(timeLeft.s)}<small>SEC</small></div>
        </div>
      </div>
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0 0 12px 12px' }}>
        <Card.Body>
          <Row xs={2} md={3} lg={6} className="g-3">
            {products.map(p => (<Col key={p._id}><ProductCard product={p} /></Col>))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}