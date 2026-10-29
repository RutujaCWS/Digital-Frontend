import { useEffect, useState, useMemo } from 'react';
import {
  Container, Card, Table, Form, Row, Col, Alert, Spinner
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const inputStyle = {
  background: '#ffffff',
  borderColor: '#d1d5db',
  borderRadius: '8px',
  fontSize: '0.9rem'
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLoading(true);
    axios
      .get('https://digitalworldkopargaonbackend.vercel.app/api/orders/admin/reports', { headers })
      .then(r => setReports(r.data || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Total Summary Calculate
  const stats = useMemo(() => {
    const totalRevenue = reports.reduce((s, r) => s + (Number(r.totalRevenue) || 0), 0);
    const totalDealerCost = reports.reduce((s, r) => s + (Number(r.totalDealerCost) || 0), 0);
    const totalProfit = reports.reduce((s, r) => s + (Number(r.totalProfit) || 0), 0);
    const totalOrders = reports.reduce((s, r) => s + (Number(r.totalOrders) || 0), 0);
    return { totalRevenue, totalDealerCost, totalProfit, totalOrders };
  }, [reports]);

  // ✅ Search Filter
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(r => r.month?.toLowerCase().includes(q));
  }, [reports, searchQuery]);

  return (
    <div
      style={{
        background: '#f9fafb',
        minHeight: '100vh',
        paddingTop: '2rem',
        paddingBottom: '3rem'
      }}
    >
      <Container fluid className="px-3 px-md-4" style={{ maxWidth: '1400px' }}>
        {/* HEADER */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h2
                className="fw-bold mb-1"
                style={{
                  color: '#111827',
                  fontSize: 'clamp(1.35rem, 3vw, 1.6rem)',
                  letterSpacing: '-0.02em'
                }}
              >
                Reports & Profit
              </h2>
              <p className="text-muted small mb-0" style={{ color: '#6b7280' }}>
                Monthly revenue, dealer cost & net profit overview
              </p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <Row className="g-3 mb-4">
          <Col xs={6} lg={3}>
            <div
              className="p-3"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderLeft: '3px solid #1e40af', // Blue
                borderRadius: '10px'
              }}
            >
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>
                Total Revenue
              </div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>
                ₹{stats.totalRevenue.toLocaleString()}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: '3px solid #f59e0b', borderRadius: '10px' }}>
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>
                Dealer Cost Revenue
              </div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>
                ₹{stats.totalDealerCost.toLocaleString()}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: '3px solid #16a34a', borderRadius: '10px' }}>
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>
                Total Profit
              </div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>
                ₹{stats.totalProfit.toLocaleString()}
              </div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: '3px solid #dc2626', borderRadius: '10px' }}>
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#6b7280' }}>
                Orders Delivered
              </div>
              <div className="fw-bold" style={{ color: '#111827', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', lineHeight: 1.2 }}>
                {stats.totalOrders}
              </div>
            </div>
          </Col>
        </Row>

        {/* FILTERS */}
        <div className="mb-3 p-3" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
          <Row className="g-2 align-items-center">
            <Col xs={12} md={4}>
              <Form.Control
                placeholder="Search by month... (e.g. Oct 2026)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={inputStyle}
              />
            </Col>
          </Row>
        </div>

        {/* REPORT TABLE */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: '#1e40af' }} />
              <p className="mt-3 text-muted small mb-0">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
              <p className="text-muted small mb-0">No reports found. Place some orders to see data.</p>
            </div>
          ) : (
            <div className="d-none d-md-block">
              <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Month', 'Orders', 'Revenue', 'Dealer Cost', 'Profit'].map((h, i) => (
                      <th
                        key={h}
                        className={`border-0 fw-semibold ${i === 4 ? 'text-end' : ''}`}
                        style={{
                          color: '#6b7280',
                          fontSize: '0.7rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          padding: '0.75rem 1rem'
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div className="fw-semibold" style={{ color: '#111827', fontSize: '0.9rem' }}>
                          {r.month}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          className="fw-semibold"
                          style={{
                            background: '#f3f4f6',
                            color: '#374151',
                            fontSize: '0.72rem',
                            padding: '4px 10px',
                            borderRadius: '6px'
                          }}
                        >
                          {r.totalOrders}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div className="fw-semibold" style={{ color: '#1e40af', fontSize: '0.9rem' }}>
                          ₹{Number(r.totalRevenue).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div className="fw-semibold text-danger" style={{ fontSize: '0.9rem' }}>
                          ₹{Number(r.totalDealerCost).toLocaleString()}
                        </div>
                      </td>
                      <td className="text-end" style={{ padding: '0.85rem 1rem' }}>
                        <div className="fw-bold text-success" style={{ fontSize: '0.95rem' }}>
                          ₹{Number(r.totalProfit).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}