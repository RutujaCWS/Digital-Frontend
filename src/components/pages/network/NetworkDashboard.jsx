import { useEffect, useState } from 'react';
import { Container, Card, Badge, Button, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const statusColors = {
  Open: 'warning', Assigned: 'info', 'In Progress': 'primary',
  Resolved: 'success', Closed: 'secondary', Rejected: 'danger'
};

export default function NetworkDashboard() {
  const [tickets, setTickets] = useState([]);
  const [health, setHealth] = useState(null);
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ status: 'In Progress', note: '' });
  const [msg, setMsg] = useState('');
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    axios.get('https://digital-backend-fv2v.onrender.com/api/support/assigned', { headers }).then(r => setTickets(r.data));
    axios.get('https://digital-backend-fv2v.onrender.com/api/system/health', { headers }).then(r => setHealth(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const openUpdate = (t) => {
    setCurrent(t);
    setForm({ status: 'In Progress', note: '' });
    setShow(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://digital-backend-fv2v.onrender.com/api/support/${current._id}/status`, form, { headers });
      setShow(false);
      setMsg('✅ Ticket updated');
      load();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <Container fluid className="py-4">
      <h3 className="mb-3">🖥️ Network Engineer Dashboard</h3>

      {msg && <Alert variant="success">{msg}</Alert>}

      {health && (
        <Row className="g-3 mb-4">
          <Col md={3}><Card className="border-0 shadow-sm"><Card.Body><div className="text-muted small">Uptime</div><div className="fs-5 fw-bold">{(health.server.uptime / 3600).toFixed(1)} hrs</div></Card.Body></Card></Col>
          <Col md={3}><Card className="border-0 shadow-sm"><Card.Body><div className="text-muted small">Platform</div><div className="fs-5 fw-bold">{health.server.platform}</div></Card.Body></Card></Col>
          <Col md={3}><Card className="border-0 shadow-sm"><Card.Body><div className="text-muted small">Free Mem</div><div className="fs-5 fw-bold">{(health.server.freeMem / 1024 / 1024 / 1024).toFixed(1)} GB</div></Card.Body></Card></Col>
          <Col md={3}><Card className="border-0 shadow-sm"><Card.Body><div className="text-muted small">DB</div><div className="fs-5 fw-bold"><Badge bg={health.database.status === 'connected' ? 'success' : 'danger'}>{health.database.status}</Badge></div></Card.Body></Card></Col>
        </Row>
      )}

      <h5 className="mb-3">🎫 Assigned Tickets</h5>

      <Row className="g-3">
        {tickets.length === 0 ? (
          <Col><Card className="border-0 shadow-sm"><Card.Body className="text-center py-5 text-muted">No tickets assigned</Card.Body></Card></Col>
        ) : tickets.map(t => (
          <Col md={6} key={t._id}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <strong>{t.ticketNumber}</strong>
                  <Badge bg={statusColors[t.status]}>{t.status}</Badge>
                </div>
                <h6>{t.issueName}</h6>
                <p className="small mb-2">{t.description}</p>
                <div className="small text-muted mb-2">
                  👤 {t.userName}<br />
                  📞 <strong>{t.contactNumber || '-'}</strong><br />
                  📋 Type: {t.issueType}<br />
                  📅 Visit: {t.expectedVisitDate
                    ? new Date(t.expectedVisitDate).toLocaleDateString()
                    : '-'}<br />
                  📍 {t.address}<br />
                  🕐 Assigned: {new Date(t.assignedAt).toLocaleString()}
                </div>
                {t.resolution && (
                  <Alert variant="success" className="small py-2">
                    <strong>Resolution:</strong> {t.resolution}
                  </Alert>
                )}
                <Button variant="primary" size="sm" className="w-100" onClick={() => openUpdate(t)}>
                  Update Status
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton><Modal.Title>Update Ticket</Modal.Title></Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body>
            {current && (
              <Alert variant="info" className="small">
                <strong>{current.ticketNumber}</strong> — {current.issueName}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Status *</Form.Label>
              <Form.Select required value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Resolution Note</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Describe what was done..." />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Update</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}