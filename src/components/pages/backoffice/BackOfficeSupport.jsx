import { useEffect, useState } from 'react';
import {
  Container, Card, Button, Badge, Form, Modal,
  Row, Col, Alert
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const statusColors = {
  Open: 'warning', Assigned: 'info', 'In Progress': 'primary',
  Resolved: 'success', Closed: 'secondary', Rejected: 'danger'
};

const ISSUE_TYPES = [
  'Networking', 'Computer Repair', 'Software Installation',
  'Hardware Issue', 'Printer Issue', 'CCTV Installation',
  'AMC Service', 'Other'
];

export default function BackOfficeSupport() {
  const [tickets, setTickets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState(null);
  const [assignForm, setAssignForm] = useState({ networkEngineerId: '', note: '' });
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    axios.get('https://digital-backend-phi.vercel.app/api/support/triage', { headers }).then(r => setTickets(r.data));
    axios.get('https://digital-backend-phi.vercel.app/api/staff/meta/network-engineers', { headers }).then(r => setEngineers(r.data));
  };

  useEffect(() => { load(); }, []);

  const openAssign = (t) => {
    setCurrent(t);
    setAssignForm({ networkEngineerId: '', note: '' });
    setShowAssign(true);
  };

  const openEdit = (t) => {
    setCurrent(t);
    setForm({
      issueName: t.issueName,
      issueType: t.issueType,
      description: t.description,
      contactNumber: t.contactNumber || '',
      address: t.address,
      expectedVisitDate: t.expectedVisitDate
        ? new Date(t.expectedVisitDate).toISOString().split('T')[0]
        : ''
    });
    setShowEdit(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://digital-backend-phi.vercel.app/api/support/${current._id}/assign`, assignForm, { headers });
      setShowAssign(false);
      setMsg('✅ Ticket assigned');
      load();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`https://digital-backend-phi.vercel.app/api/support/${current._id}`, form, { headers });
      setShowEdit(false);
      setMsg('✅ Ticket updated');
      load();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await axios.delete(`https://digital-backend-phi.vercel.app/api/support/${id}`, { headers });
      setMsg('✅ Ticket deleted');
      load();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Container fluid className="py-4">
      <h3 className="mb-3">🛠️ Support Triage (Back Office)</h3>

      {msg && <Alert variant="success">{msg}</Alert>}

      <Row className="g-3">
        {tickets.length === 0 ? (
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5 text-muted">No open tickets</Card.Body>
            </Card>
          </Col>
        ) : tickets.map(t => (
          <Col md={6} key={t._id}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <strong>{t.ticketNumber}</strong>
                  <Badge bg={statusColors[t.status]}>{t.status}</Badge>
                </div>
                <h6>{t.issueName}</h6>
                <p className="small text-muted mb-2">{t.description}</p>
                <div className="small mb-2">
                  👤 {t.userName}<br />
                  📞 Contact: <strong>{t.contactNumber || '-'}</strong><br />
                  📋 Type: {t.issueType}<br />
                  📅 Visit: {t.expectedVisitDate
                    ? new Date(t.expectedVisitDate).toLocaleDateString()
                    : '-'}<br />
                  📍 {t.address}
                </div>

                <div className="d-flex gap-2">
                  <Button variant="primary" size="sm" className="flex-grow-1" onClick={() => openAssign(t)}>
                    Assign →
                  </Button>
                  <Button variant="outline-primary" size="sm" onClick={() => openEdit(t)}>✏️</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(t._id)}>🗑️</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Assign Modal */}
      <Modal show={showAssign} onHide={() => setShowAssign(false)}>
        <Modal.Header closeButton><Modal.Title>Assign Ticket</Modal.Title></Modal.Header>
        <Form onSubmit={handleAssign}>
          <Modal.Body>
            {current && (
              <Alert variant="info" className="small">
                <strong>{current.ticketNumber}</strong><br />
                {current.issueName}<br />
                Type: {current.issueType}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Network Engineer *</Form.Label>
              <Form.Select required value={assignForm.networkEngineerId} onChange={e => setAssignForm({ ...assignForm, networkEngineerId: e.target.value })}>
                <option value="">-- Select --</option>
                {engineers.map(eng => (
                  <option key={eng._id} value={eng._id}>{eng.name} ({eng.employeeId})</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control as="textarea" rows={2} value={assignForm.note} onChange={e => setAssignForm({ ...assignForm, note: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAssign(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Assign</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>✏️ Edit Ticket</Modal.Title></Modal.Header>
        <Form onSubmit={handleEdit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Issue Name *</Form.Label>
                  <Form.Control required value={form.issueName || ''} onChange={(e) => setForm({ ...form, issueName: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Issue Type *</Form.Label>
                  <Form.Select required value={form.issueType || ''} onChange={(e) => setForm({ ...form, issueType: e.target.value })}>
                    {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control as="textarea" rows={3} required value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Number *</Form.Label>
                  <Form.Control required maxLength={10} value={form.contactNumber || ''} onChange={(e) => setForm({ ...form, contactNumber: e.target.value.replace(/\D/g, '') })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Visit Date *</Form.Label>
                  <Form.Control type="date" required min={today} value={form.expectedVisitDate || ''} onChange={(e) => setForm({ ...form, expectedVisitDate: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control as="textarea" rows={2} required value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}