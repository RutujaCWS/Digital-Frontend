import { useState } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('https://digitalworldkopargaonbackend.vercel.app/api/auth/login', form);
      login(data.user, data.token);

      // ✅ जर redirect असेल तर तिथे जा, नाहीतर रोलनुसार पेजवर जा
      if (redirect) {
        navigate(decodeURIComponent(redirect));
      } else if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'backoffice') {
        navigate('/backoffice');
      } else if (data.user.role === 'network') {
        navigate('/network');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '460px' }}>
      
      <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4 p-md-5">
          {/* HEADER */}
          <div className="text-center mb-4">
            <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Welcome Back</h4>
            <p className="text-muted mb-0 small">
              Login to continue shopping
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="border-0 small" style={{ borderRadius: '10px' }}>
              ⚠️ {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                Email Address
              </Form.Label>
              <InputGroup>
                <InputGroup.Text
                  className="border-end-0"
                  style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px 0 0 10px' }}
                >
                  📧
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="border-start-0"
                  style={{
                    borderColor: '#e2e8f0',
                    borderRadius: '0 10px 10px 0',
                    background: '#f8fafc',
                    fontSize: '0.9rem'
                  }}
                />
              </InputGroup>
            </Form.Group>

            {/* PASSWORD */}
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="fw-semibold small mb-0" style={{ color: '#334155' }}>
                  Password
                </Form.Label>
              </div>
              <InputGroup>
                <InputGroup.Text
                  className="border-end-0"
                  style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px 0 0 10px' }}
                >
                  🔒
                </InputGroup.Text>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="border-start-0 border-end-0"
                  style={{
                    borderColor: '#e2e8f0',
                    background: '#f8fafc',
                    fontSize: '0.9rem'
                  }}
                />
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="border-start-0"
                  style={{
                    borderColor: '#e2e8f0',
                    borderRadius: '0 10px 10px 0',
                    background: '#f8fafc'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* SUBMIT */}
            <Button
              type="submit"
              className="w-100 fw-bold border-0"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                color: '#ffffff',
                padding: '0.7rem',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)',
                fontSize: '0.95rem'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                <>Login</>
              )}
            </Button>
          </Form>

          {/* DIVIDER */}
          <div className="d-flex align-items-center gap-3 my-4">
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span className="text-muted small">or</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* FORGOT + REGISTER */}
          <p className="text-center mb-2">
            <Link
              to="/forgot-password"
              className="fw-semibold text-decoration-none small"
              style={{ color: '#1e40af' }}
            >
              Forgot Password?
            </Link>
          </p>
          <p className="text-center mb-0">
            <span className="text-muted small">Don't have an account? </span>
            <Link
              to={redirect ? `/register?redirect=${redirect}` : '/register'}
              className="fw-bold text-decoration-none"
              style={{ color: '#1e40af' }}
            >
              Register here
            </Link>
          </p>
          <p className="text-center mt-2 mb-0">
            <Link
              to="/"
              className="fw-semibold text-decoration-none small"
              style={{ color: '#1e40af' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1e40af')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
            >
              ← Back to Home
            </Link>
         </p>
        </Card.Body>
      </Card>
    </Container>
  );
}