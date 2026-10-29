import { useState } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      setError('Mobile number must be 10 digits');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        'https://digitalworldkopargaonbackend.vercel.app/api/auth/register',
        form
      );
      login(data.user, data.token);
      navigate(redirect ? decodeURIComponent(redirect) : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '700px' }}>
      <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4 p-md-5">
          {/* HEADER */}
          <div className="text-center mb-4">
            <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Create Account</h4>
            <p className="text-muted mb-0 small">
              Register to start shopping
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="border-0 small" style={{ borderRadius: '10px' }}>
              ⚠️ {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* Name */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                    Full Name <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      className="border-end-0"
                      style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px 0 0 10px' }}
                    >
                      👤
                    </InputGroup.Text>
                    <Form.Control
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
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
              </Col>

              {/* Mobile */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                    Mobile Number <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      className="border-end-0"
                      style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px 0 0 10px' }}
                    >
                      📱 +91
                    </InputGroup.Text>
                    <Form.Control
                      type="tel"
                      name="phone"
                      required
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })
                      }
                      placeholder="10 digit mobile"
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
              </Col>

              {/* Email */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                    Email Address <span className="text-danger">*</span>
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
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
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
              </Col>

              {/* Address */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                    Address
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      className="border-end-0"
                      style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px 0 0 10px' }}
                    >
                      🏠
                    </InputGroup.Text>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House no., Street, City, State, Pincode"
                      disabled={loading}
                      className="border-start-0"
                      style={{
                        resize: 'none',
                        borderColor: '#e2e8f0',
                        borderRadius: '0 10px 10px 0',
                        background: '#f8fafc',
                        fontSize: '0.9rem'
                      }}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Password */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                    Password <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      className="border-end-0"
                      style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px 0 0 10px' }}
                    >
                      🔒
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      minLength={6}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
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
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      title={showPassword ? 'Hide password' : 'Show password'}
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
              </Col>

              {/* Confirm Password */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>
                    Confirm Password <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      className="border-end-0"
                      style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px 0 0 10px' }}
                    >
                      🔒
                    </InputGroup.Text>
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      minLength={6}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      type="button"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      disabled={loading}
                      className="border-start-0"
                      style={{
                        borderColor: '#e2e8f0',
                        borderRadius: '0 10px 10px 0',
                        background: '#f8fafc'
                      }}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </Button>
                  </InputGroup>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <Form.Text className="text-danger small">
                      ❌ Passwords do not match
                    </Form.Text>
                  )}
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <Form.Text className="text-success small">
                      ✅ Passwords match
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              {/* Submit */}
              <Col md={12}>
                <Button
                  type="submit"
                  className="w-100 fw-bold border-0 mt-2"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    color: '#ffffff',
                    padding: '0.7rem',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>Create Account</>
                  )}
                </Button>
              </Col>
            </Row>
          </Form>

          {/* LOGIN LINK */}
          <p className="text-center mt-4 mb-0">
            <span className="text-muted small">Already have an account? </span>
            <Link
              to={redirect ? `/login?redirect=${redirect}` : '/login'}
              className="fw-bold text-decoration-none"
              style={{ color: '#1e40af' }}
            >
              Login here
            </Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}