import { useState } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step 1: verify email | Step 2: new password | Step 3: success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ═══════════════════════════════════════════
  // STEP 1: Verify Email
  // ═══════════════════════════════════════════
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(
        'https://digitalworldkopargaonbackend.vercel.app/api/auth/verify-email',
        { email }
      );
      setUserName(data.name);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════
  // STEP 2: Reset Password
  // ═══════════════════════════════════════════
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        'https://digitalworldkopargaonbackend.vercel.app/api/auth/reset-password',
        { email, newPassword, confirmPassword }
      );
      setSuccess(data.message);
      setStep(3);

      // Auto redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4 p-md-5">

          {/* ═══════════════════════════════════════════
              STEP 1: EMAIL
          ═══════════════════════════════════════════ */}
          {step === 1 && (
            <>
              <div className="text-center mb-4">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                    fontSize: '1.8rem'
                  }}
                >
                  🔐
                </div>
                <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>
                  Forgot Password?
                </h4>
                <p className="text-muted mb-0 small">
                  Enter your registered email to continue
                </p>
              </div>

              {/* Steps indicator */}
              <div className="d-flex justify-content-center align-items-center gap-2 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#1e40af',
                    color: '#ffffff',
                    fontSize: '0.75rem'
                  }}
                >
                  1
                </div>
                <div
                  style={{ width: '40px', height: '2px', background: '#e2e8f0' }}
                />
                <div
                  className="d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    color: '#94a3b8',
                    fontSize: '0.75rem'
                  }}
                >
                  2
                </div>
              </div>

              {error && (
                <Alert
                  variant="danger"
                  className="border-0 small"
                  style={{ borderRadius: '10px' }}
                >
                  ⚠️ {error}
                </Alert>
              )}

              <Form onSubmit={handleVerifyEmail}>
                <Form.Group className="mb-3">
                  <Form.Label
                    className="fw-semibold small"
                    style={{ color: '#334155' }}
                  >
                    Registered Email
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      className="border-end-0"
                      style={{
                        background: '#f8fafc',
                        borderColor: '#e2e8f0',
                        borderRadius: '10px 0 0 10px'
                      }}
                    >
                      📧
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={loading}
                      autoFocus
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
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Verifying...
                    </>
                  ) : (
                    <>Continue →</>
                  )}
                </Button>
              </Form>

              <p className="text-center mt-4 mb-0">
                <Link
                  to="/login"
                  className="fw-semibold text-decoration-none small"
                  style={{ color: '#1e40af' }}
                >
                  ← Back to Login
                </Link>
              </p>
            </>
          )}

          {/* ═══════════════════════════════════════════
              STEP 2: NEW PASSWORD
          ═══════════════════════════════════════════ */}
          {step === 2 && (
            <>
              <div className="text-center mb-4">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                    fontSize: '1.8rem'
                  }}
                >
                  🔒
                </div>
                <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>
                  Set New Password
                </h4>
                <p className="text-muted mb-0 small">
                  Hi <strong>{userName}</strong>, choose a new password
                </p>
              </div>

              {/* Steps indicator */}
              <div className="d-flex justify-content-center align-items-center gap-2 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '0.75rem'
                  }}
                >
                  ✓
                </div>
                <div
                  style={{ width: '40px', height: '2px', background: '#16a34a' }}
                />
                <div
                  className="d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#1e40af',
                    color: '#ffffff',
                    fontSize: '0.75rem'
                  }}
                >
                  2
                </div>
              </div>

              {/* Verified email display */}
              <div
                className="d-flex align-items-center gap-2 mb-4 p-2"
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  fontSize: '0.85rem'
                }}
              >
                <span>✅</span>
                <span className="text-success fw-semibold">{email}</span>
              </div>

              {error && (
                <Alert
                  variant="danger"
                  className="border-0 small"
                  style={{ borderRadius: '10px' }}
                >
                  ⚠️ {error}
                </Alert>
              )}

              <Form onSubmit={handleResetPassword}>
                {/* NEW PASSWORD */}
                <Form.Group className="mb-3">
                  <Form.Label
                    className="fw-semibold small"
                    style={{ color: '#334155' }}
                  >
                    New Password
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      className="border-end-0"
                      style={{
                        background: '#f8fafc',
                        borderColor: '#e2e8f0',
                        borderRadius: '10px 0 0 10px'
                      }}
                    >
                      🔒
                    </InputGroup.Text>
                    <Form.Control
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      disabled={loading}
                      autoFocus
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
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                      className="border-start-0"
                      style={{
                        borderColor: '#e2e8f0',
                        borderRadius: '0 10px 10px 0',
                        background: '#f8fafc'
                      }}
                    >
                      {showNewPassword ? '🙈' : '👁️'}
                    </Button>
                  </InputGroup>
                </Form.Group>

                {/* CONFIRM PASSWORD */}
                <Form.Group className="mb-3">
                  <Form.Label
                    className="fw-semibold small"
                    style={{ color: '#334155' }}
                  >
                    Confirm Password
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      className="border-end-0"
                      style={{
                        background: '#f8fafc',
                        borderColor: '#e2e8f0',
                        borderRadius: '10px 0 0 10px'
                      }}
                    >
                      🔒
                    </InputGroup.Text>
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {confirmPassword && newPassword !== confirmPassword && (
                    <Form.Text className="text-danger small">
                      ❌ Passwords do not match
                    </Form.Text>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <Form.Text className="text-success small">
                      ✅ Passwords match
                    </Form.Text>
                  )}
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 fw-bold border-0"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                    color: '#ffffff',
                    padding: '0.7rem',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                    fontSize: '0.95rem'
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Resetting...
                    </>
                  ) : (
                    <>🔓 Reset Password</>
                  )}
                </Button>
              </Form>

              <p className="text-center mt-4 mb-0">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="border-0 bg-transparent fw-semibold small"
                  style={{ color: '#1e40af', cursor: 'pointer' }}
                >
                  ← Change email
                </button>
              </p>
            </>
          )}

          {/* ═══════════════════════════════════════════
              STEP 3: SUCCESS
          ═══════════════════════════════════════════ */}
          {step === 3 && (
            <div className="text-center py-3">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                  fontSize: '2.5rem'
                }}
              >
                ✅
              </div>
              <h4 className="fw-bold mb-2" style={{ color: '#16a34a' }}>
                Password Reset!
              </h4>
              <p className="text-muted mb-4 small">
                {success || 'Your password has been reset successfully.'}
              </p>
              <div
                className="p-3 mb-4"
                style={{
                  background: '#eff6ff',
                  borderRadius: '10px',
                  border: '1px solid #bfdbfe'
                }}
              >
                <div className="small" style={{ color: '#1e40af' }}>
                  🔄 Redirecting to login page...
                </div>
              </div>
              <Button
                as={Link}
                to="/login"
                className="fw-bold border-0 w-100"
                style={{
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  color: '#ffffff',
                  padding: '0.7rem',
                  borderRadius: '10px',
                  fontSize: '0.95rem'
                }}
              >
                Go to Login →
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}