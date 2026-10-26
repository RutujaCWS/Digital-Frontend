import { useEffect, useState, useCallback } from 'react';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

export default function AdminWhatsApp() {
  const [waStatus, setWaStatus] = useState({
    status: 'disconnected',
    qr: null,
    connectedNumber: null
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const API = 'https://digital-backend-phi.vercel.app/api/whatsapp';

  const fetchStatus = useCallback(() => {
    if (!token) return;
    axios
      .get(`${API}/status`, { headers })
      .then(r => setWaStatus(r.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchStatus();
    const timer = setInterval(fetchStatus, 3000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleConnect = async () => {
    setErrorMsg('');
    setMsg('');
    setActionLoading(true);
    try {
      await axios.post(`${API}/connect`, {}, { headers });
      setTimeout(fetchStatus, 1000);
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Connect failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    if (
      !window.confirm(
        'Disconnect WhatsApp? To change the number, you will need to scan a new QR code.'
      )
    )
      return;
    setErrorMsg('');
    setMsg('');
    setActionLoading(true);
    try {
      await axios.post(`${API}/logout`, {}, { headers });
      setWaStatus({ status: 'disconnected', qr: null, connectedNumber: null });
      setMsg('Disconnected successfully');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Logout failed');
    } finally {
      setActionLoading(false);
    }
  };

  const state = (() => {
    switch (waStatus.status) {
      case 'connected':
        return {
          label: 'Connected',
          badgeBg: '#ecfdf5',
          badgeColor: '#047857',
          dot: '#10b981',
          accent: '#10b981',
          icon: '✓'
        };
      case 'qr_ready':
        return {
          label: 'Awaiting Scan',
          badgeBg: '#fffbeb',
          badgeColor: '#b45309',
          dot: '#f59e0b',
          accent: '#f59e0b',
          icon: '⌁'
        };
      case 'initializing':
        return {
          label: 'Starting',
          badgeBg: '#eef2ff',
          badgeColor: '#4338ca',
          dot: '#6366f1',
          accent: '#6366f1',
          icon: '◔'
        };
      default:
        return {
          label: 'Disconnected',
          badgeBg: '#f1f5f9',
          badgeColor: '#64748b',
          dot: '#94a3b8',
          accent: '#94a3b8',
          icon: '○'
        };
    }
  })();

  const title =
    waStatus.status === 'connected'
      ? 'WhatsApp is connected'
      : waStatus.status === 'qr_ready'
      ? 'Scan the QR code'
      : waStatus.status === 'initializing'
      ? 'Starting WhatsApp...'
      : 'WhatsApp is not connected';

  const description =
    waStatus.status === 'connected'
      ? 'Order confirmations will be sent to your customers automatically.'
      : waStatus.status === 'qr_ready'
      ? 'Open WhatsApp on your phone → Settings → Linked Devices → Link a Device.'
      : waStatus.status === 'initializing'
      ? 'The WhatsApp client is starting up. This may take a few seconds.'
      : 'Connect your WhatsApp number to send automatic order notifications.';

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
          <h1
            className="fw-bold mb-1"
            style={{
              color: '#0f172a',
              fontSize: 'clamp(1.4rem, 3vw, 1.7rem)',
              letterSpacing: '-0.025em'
            }}
          >
            WhatsApp
          </h1>
          <p
            className="mb-0"
            style={{ color: '#64748b', fontSize: '0.875rem' }}
          >
            Connect your WhatsApp number to send order notifications
            automatically.
          </p>
        </div>

        {msg && (
          <Alert
            variant="success"
            className="border-0 py-2 px-3 mb-3"
            style={{ borderRadius: '10px', fontSize: '0.85rem' }}
          >
            {msg}
          </Alert>
        )}
        {errorMsg && (
          <Alert
            variant="danger"
            className="border-0 py-2 px-3 mb-3"
            style={{ borderRadius: '10px', fontSize: '0.85rem' }}
          >
            {errorMsg}
          </Alert>
        )}

        {/* MAIN CARD */}
        <Card
          className="border-0 mb-4"
          style={{
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
          }}
        >
          <Card.Body className="p-4 p-md-5">
            {loading ? (
              <div className="text-center py-5">
                <Spinner
                  animation="border"
                  size="sm"
                  style={{ color: '#1e40af' }}
                />
                <p
                  className="mt-3 mb-0"
                  style={{ color: '#94a3b8', fontSize: '0.82rem' }}
                >
                  Checking connection...
                </p>
              </div>
            ) : (
              <>
                {/* STATUS ROW */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: state.badgeBg,
                      color: state.accent,
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      border: `1px solid ${state.accent}22`
                    }}
                  >
                    {state.icon}
                  </div>
                  <div className="flex-grow-1 min-width-0">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <h6
                        className="fw-bold mb-0"
                        style={{ color: '#0f172a', fontSize: '0.98rem' }}
                      >
                        {title}
                      </h6>
                      <span
                        className="d-inline-flex align-items-center gap-1"
                        style={{
                          background: state.badgeBg,
                          color: state.badgeColor,
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: 20,
                          lineHeight: 1
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: state.dot
                          }}
                        />
                        {state.label}
                      </span>
                    </div>
                    <p
                      className="mb-0 mt-1"
                      style={{ color: '#64748b', fontSize: '0.82rem' }}
                    >
                      {description}
                    </p>
                  </div>
                </div>

                {/* CONNECTED NUMBER */}
                {waStatus.status === 'connected' &&
                  waStatus.connectedNumber && (
                    <div
                      className="d-flex align-items-center justify-content-between p-3 mb-4"
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: '#64748b',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            marginBottom: 2
                          }}
                        >
                          Connected Number
                        </div>
                        <div
                          className="fw-bold"
                          style={{
                            color: '#0f172a',
                            fontSize: '0.98rem',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          +{waStatus.connectedNumber}
                        </div>
                      </div>
                      <span
                        className="d-inline-flex align-items-center gap-1"
                        style={{
                          background: '#ecfdf5',
                          color: '#047857',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: 20
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: '#10b981'
                          }}
                        />
                        Active
                      </span>
                    </div>
                  )}

                {/* QR CODE */}
                {waStatus.status === 'qr_ready' && waStatus.qr && (
                  <div className="text-center mb-4">
                    <div
                      className="d-inline-block p-3"
                      style={{
                        background: '#ffffff',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <img
                        src={waStatus.qr}
                        alt="WhatsApp QR"
                        style={{
                          width: 220,
                          height: 220,
                          display: 'block',
                          borderRadius: 6
                        }}
                      />
                    </div>
                    <p
                      className="mt-3 mb-0"
                      style={{ color: '#94a3b8', fontSize: '0.75rem' }}
                    >
                      QR code refreshes automatically every 20–30 seconds
                    </p>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="d-flex gap-2 flex-wrap">
                  {waStatus.status === 'connected' && (
                    <Button
                      onClick={handleLogout}
                      disabled={actionLoading}
                      className="border-0 fw-semibold"
                      style={{
                        background: '#fef2f2',
                        color: '#b91c1c',
                        borderRadius: 10,
                        fontSize: '0.83rem',
                        padding: '0.55rem 1.1rem'
                      }}
                    >
                      {actionLoading ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                            style={{ width: 12, height: 12 }}
                          />
                          Disconnecting...
                        </>
                      ) : (
                        'Disconnect'
                      )}
                    </Button>
                  )}

                  {(waStatus.status === 'disconnected' ||
                    waStatus.status === 'initializing') && (
                    <Button
                      onClick={handleConnect}
                      disabled={
                        actionLoading || waStatus.status === 'initializing'
                      }
                      className="border-0 fw-semibold"
                      style={{
                        background: '#1e40af',
                        color: '#ffffff',
                        borderRadius: 10,
                        fontSize: '0.83rem',
                        padding: '0.55rem 1.2rem',
                        opacity:
                          actionLoading ||
                          waStatus.status === 'initializing'
                            ? 0.7
                            : 1
                      }}
                    >
                      {waStatus.status === 'initializing' || actionLoading ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                            style={{ width: 12, height: 12 }}
                          />
                          Starting...
                        </>
                      ) : (
                        'Connect WhatsApp'
                      )}
                    </Button>
                  )}

                  {waStatus.status === 'qr_ready' && (
                    <div
                      className="d-flex align-items-center"
                      style={{ color: '#b45309', fontSize: '0.8rem' }}
                    >
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                        style={{ width: 12, height: 12, color: '#f59e0b' }}
                      />
                      Waiting for scan...
                    </div>
                  )}
                </div>
              </>
            )}
          </Card.Body>
        </Card>

        {/* GUIDE CARD */}
        <Card
          className="border-0"
          style={{
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
          }}
        >
          <Card.Body className="p-4 p-md-5">
            <div className="d-flex align-items-center gap-2 mb-4">
              <h6
                className="fw-bold mb-0"
                style={{ color: '#0f172a', fontSize: '0.92rem' }}
              >
                How it works
              </h6>
            </div>

            <div className="d-flex flex-column gap-3">
              {[
                {
                  step: '01',
                  title: 'Connect your number',
                  desc: 'Click Connect WhatsApp to begin linking your account.'
                },
                {
                  step: '02',
                  title: 'Scan the QR code',
                  desc: 'Open WhatsApp → Settings → Linked Devices → Link a Device.'
                },
                {
                  step: '03',
                  title: 'You are live',
                  desc: 'Customers will receive order confirmations automatically.'
                },
                {
                  step: '04',
                  title: 'Change any time',
                  desc: 'Disconnect and scan a new QR to switch numbers.'
                }
              ].map((g, i, arr) => (
                <div key={g.step} className="d-flex gap-3">
                  <div
                    className="d-flex flex-column align-items-center flex-shrink-0"
                    style={{ width: 40 }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#eff6ff',
                        color: '#1e40af',
                        fontSize: '0.72rem'
                      }}
                    >
                      {g.step}
                    </div>
                    {i !== arr.length - 1 && (
                      <div
                        style={{
                          width: 1,
                          flexGrow: 1,
                          minHeight: 16,
                          background: '#e2e8f0',
                          marginTop: 4
                        }}
                      />
                    )}
                  </div>
                  <div className="pb-1">
                    <div
                      className="fw-semibold mb-1"
                      style={{ color: '#0f172a', fontSize: '0.86rem' }}
                    >
                      {g.title}
                    </div>
                    <div
                      style={{
                        color: '#64748b',
                        fontSize: '0.79rem',
                        lineHeight: 1.55
                      }}
                    >
                      {g.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* FOOTNOTE */}
        <p
          className="text-center mt-4 mb-0"
          style={{ color: '#94a3b8', fontSize: '0.75rem' }}
        >
          Only one number can be connected at a time.
        </p>
      </Container>
    </div>
  );
}