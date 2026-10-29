import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function WhatsAppConnect() {
  const [waStatus, setWaStatus] = useState({
    status: 'disconnected',   // disconnected | initializing | qr_ready | connected
    qr: null,
    connectedNumber: null
  });
  const [waLoading, setWaLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { token } = useAuth();

  const headers = { Authorization: `Bearer ${token}` };
  const API = 'https://digital-backend-phi.vercel.app/api/whatsapp';

  // ✅ Status poll — दर 3 सेकंदाला
  useEffect(() => {
    if (!token) return;

    const fetchStatus = () => {
      axios
        .get(`${API}/status`, { headers })
        .then(r => setWaStatus(r.data))
        .catch(() => {});
    };

    fetchStatus();
    const timer = setInterval(fetchStatus, 3000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleConnect = async () => {
    setErrorMsg('');
    setWaLoading(true);
    try {
      await axios.post(`${API}/connect`, {}, { headers });
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Connect failed');
    } finally {
      setWaLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('WhatsApp disconnect करायचं? Number change करण्यासाठी पुन्हा scan करावं लागेल.')) return;
    setWaLoading(true);
    try {
      await axios.post(`${API}/logout`, {}, { headers });
      setWaStatus({ status: 'disconnected', qr: null, connectedNumber: null });
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Logout failed');
    } finally {
      setWaLoading(false);
    }
  };

  return (
    <Card
      className="border-0 mb-3"
      style={{
        borderRadius: '14px',
        background: '#ffffff',
        border: '1px solid #e2e8f0'
      }}
    >
      <Card.Body className="p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6
            className="fw-bold mb-0"
            style={{ color: '#0f172a', fontSize: '0.95rem' }}
          >
            WhatsApp Connection
          </h6>
          <span
            className="badge"
            style={{
              background:
                waStatus.status === 'connected'
                  ? '#dcfce7'
                  : waStatus.status === 'qr_ready'
                  ? '#fef3c7'
                  : '#f1f5f9',
              color:
                waStatus.status === 'connected'
                  ? '#16a34a'
                  : waStatus.status === 'qr_ready'
                  ? '#d97706'
                  : '#64748b',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '5px 10px'
            }}
          >
            {waStatus.status === 'connected'
              ? '● Connected'
              : waStatus.status === 'qr_ready'
              ? '● Scan QR'
              : waStatus.status === 'initializing'
              ? '● Starting...'
              : '● Disconnected'}
          </span>
        </div>

        {errorMsg && (
          <div
            className="small mb-2"
            style={{ color: '#dc2626', fontSize: '0.78rem' }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* CONNECTED */}
        {waStatus.status === 'connected' && (
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div>
              <div
                className="text-uppercase fw-semibold mb-1"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: '#64748b'
                }}
              >
                Connected Number
              </div>
              <div
                className="fw-bold"
                style={{
                  color: '#0f172a',
                  fontSize: '1.1rem',
                  letterSpacing: '-0.02em'
                }}
              >
                +{waStatus.connectedNumber}
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline-danger ms-auto"
              onClick={handleLogout}
              disabled={waLoading}
              style={{ fontSize: '0.8rem', fontWeight: 600 }}
            >
              {waLoading ? 'Disconnecting...' : 'Disconnect / Change Number'}
            </button>
          </div>
        )}

        {/* QR READY */}
        {waStatus.status === 'qr_ready' && waStatus.qr && (
          <div className="text-center">
            <p
              className="small mb-2"
              style={{ color: '#64748b', fontSize: '0.8rem' }}
            >
              WhatsApp उघडा → Settings → Linked Devices → Link a Device
            </p>
            <img
              src={waStatus.qr}
              alt="WhatsApp QR"
              style={{
                width: 220,
                height: 220,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 8,
                background: '#fff'
              }}
            />
            <p
              className="small mt-2 mb-0"
              style={{ color: '#94a3b8', fontSize: '0.72rem' }}
            >
              QR 20-30 seconds मध्ये expire होतो — auto refresh होईल
            </p>
          </div>
        )}

        {/* DISCONNECTED / INITIALIZING */}
        {(waStatus.status === 'disconnected' ||
          waStatus.status === 'initializing') && (
          <div>
            <p
              className="small mb-2"
              style={{ color: '#64748b', fontSize: '0.8rem' }}
            >
              Connect करा → QR scan करा → Orders चे WhatsApp messages
              customers ना जातील
            </p>
            <button
              className="btn btn-sm btn-success"
              onClick={handleConnect}
              disabled={waLoading || waStatus.status === 'initializing'}
              style={{ fontSize: '0.8rem', fontWeight: 600 }}
            >
              {waStatus.status === 'initializing' || waLoading
                ? 'Starting...'
                : 'Connect WhatsApp'}
            </button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}