import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function BackOfficeDashboard() {
  return (
    <Container className="py-4">
      <h3 className="mb-4">📦 Back Office Dashboard</h3>
      <Row className="g-3">
        <Col md={6}>
          <Card as={Link} to="/backoffice/products" className="border-0 shadow-sm text-decoration-none text-dark">
            <Card.Body><h5>📦 Manage Products</h5><p className="text-muted mb-0">Add / edit products with gifts</p></Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card as={Link} to="/backoffice/support" className="border-0 shadow-sm text-decoration-none text-dark">
            <Card.Body><h5>🛠️ Support Requests</h5><p className="text-muted mb-0">Triage and assign tickets</p></Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}