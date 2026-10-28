import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Form, Button, Badge, Dropdown } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [settings, setSettings] = useState(null);
  const [expanded, setExpanded] = useState(false); // ✅ मोबाईल मेनू स्टेट
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://digital-backend-fv2v.onrender.com/api/site-settings')
      .then(r => setSettings(r.data))
      .catch(() => {});
  }, []);

  // ✅ लिंकवर क्लिक केल्यावर मेनू बंद करण्यासाठी
  const closeNav = () => setExpanded(false);
  
  const panelLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'backoffice') return '/backoffice';
    if (user?.role === 'network') return '/network';
    return null;
  };

  const panelLabel = () => {
    if (user?.role === 'admin') return '👑 Admin';
    if (user?.role === 'backoffice') return '📦 Back Office';
    if (user?.role === 'network') return '🖥️ Network';
    return null;
  };

  const isAdmin = user?.role === 'admin';

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <BSNavbar
      expand="lg"
      sticky="top"
      expanded={expanded} // ✅ स्टेट कंट्रोल
      onToggle={(isOpen) => setExpanded(isOpen)} // ✅ टॉगल हँडलर
      className="py-2 shadow-sm"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 1030
      }}
    >
      <Container fluid className="px-3 px-lg-4">
        
        {/* BRAND & MOBILE CART */}
        <div className="d-flex align-items-center justify-content-between w-100 w-lg-auto">
          <BSNavbar.Brand
            as={Link}
            to="/"
            onClick={closeNav}
            className="d-flex flex-column lh-1 me-3"
            style={{ lineHeight: 1 }}
          >
            <span
              className="fw-bold fst-italic d-block"
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                lineHeight: '1.3', 
                paddingBottom: '3px',
                paddingRight: '2px', 
                
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {settings?.companyName || 'Digital World'}
            </span>
            <small
              className="fst-italic"
              style={{
                fontSize: 'clamp(0.55rem, 1.5vw, 0.7rem)',
                letterSpacing: '0.3px',
                color: '#64748b'
              }}
            >
              {settings?.tagline || 'The Computer Zone'}
            </small>
          </BSNavbar.Brand>

          {/* ✅ मोबाईलवर कार्ट आयकॉन उजवीकडे दाखवण्यासाठी */}
          <div className="d-flex align-items-center d-lg-none gap-3">

          {user && (
            <NotificationBell />
          )}

            {!isAdmin && (
              <Link to="/cart" onClick={closeNav} className="position-relative d-flex align-items-center text-decoration-none">
                <span style={{ fontSize: '1.4rem' }}>🛒</span>
                <Badge
                  pill
                  className="position-absolute"
                  style={{
                    top: '-4px',
                    right: '-8px',
                    fontSize: '0.6rem',
                    background: '#1e40af',
                    color: '#ffffff',
                    fontWeight: 700,
                    padding: '3px 6px'
                  }}
                >
                  {cartCount}
                </Badge>
              </Link>
            )}
            <BSNavbar.Toggle
              aria-controls="main-navbar-nav"
              style={{ borderColor: '#cbd5e1', background: 'transparent' }}
            />
          </div>
        </div>

        <BSNavbar.Collapse id="main-navbar-nav">

          {/* NAV LINKS */}
          <Nav className="ms-auto align-items-lg-center order-lg-3 mt-2 mt-lg-0 pb-3 pb-lg-0">
            <Nav.Link as={Link} to="/" onClick={closeNav} className="fw-medium px-2 py-2" style={{ color: '#334155' }}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about" onClick={closeNav} className="fw-medium px-2 py-2" style={{ color: '#334155' }}>
              About
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" onClick={closeNav} className="fw-medium px-2 py-2" style={{ color: '#334155' }}>
              Contact
            </Nav.Link>

            {user ? (
              <>
                {panelLink() && (
                  <Nav.Link
                  as={Link}
                  to={panelLink()}
                  onClick={closeNav}
                  className="fw-bold px-2 py-2 d-flex align-items-center justify-content-center gap-1 text-nowrap"
                  style={{
                    color: '#1e40af',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <span>{user?.role === 'admin' ? '👑' : user?.role === 'backoffice' ? '📦' : '🖥️'}</span>
                  <span>
                    {user?.role === 'admin' ? 'Admin' : user?.role === 'backoffice' ? 'Back Office' : 'Network'}
                  </span>
                </Nav.Link>
                )}

                {!isAdmin && (
                  <>
                    <Nav.Link as={Link} to="/orders" onClick={closeNav} className="px-2 py-2" style={{ color: '#334155' }}>
                      Orders
                    </Nav.Link>
                    <Nav.Link as={Link} to="/support" onClick={closeNav} className="px-2 py-2" style={{ color: '#334155' }}>
                      Support
                    </Nav.Link>
                  </>
                )}

                {/* USER DROPDOWN */}
                <Dropdown align="end" className="ms-lg-2 mt-2 mt-lg-0 w-100 w-lg-auto">
                  <Dropdown.Toggle as="div" id="user-dropdown" className="d-flex align-items-center gap-2 px-2" style={{ cursor: 'pointer' }}>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                      style={{
                        width: '36px',
                        height: '36px',
                        fontSize: '0.85rem',
                        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                        color: '#ffffff'
                      }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <span className="d-lg-none d-xl-inline small fw-medium" style={{ color: '#334155' }}>
                      {user.name}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end" className="shadow border-0 mt-2" style={{ minWidth: '220px', borderRadius: '12px' }}>
                    <div className="px-3 py-2 border-bottom">
                      <div className="fw-bold text-dark">{user.name}</div>
                      <small className="text-muted d-block text-truncate">{user.email}</small>
                      {panelLabel() && (
                        <Badge bg="primary" className="mt-1">{panelLabel()}</Badge>
                      )}
                    </div>

                    {!isAdmin && (
                      <>
                        <Dropdown.Item as={Link} to="/orders" onClick={closeNav} className="py-2">📦 My Orders</Dropdown.Item>
                        <Dropdown.Item as={Link} to="/support" onClick={closeNav} className="py-2">🛠️ Support</Dropdown.Item>
                      </>
                    )}

                    {panelLink() && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={panelLink()} onClick={closeNav} className="py-2">
                          ⚙️ Go to {panelLabel()}
                        </Dropdown.Item>
                      </>
                    )}

                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="py-2 text-danger">
                      🚪 Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <Nav.Link as={Link} to="/login" onClick={closeNav} className="ms-lg-2 mt-2 mt-lg-0 px-2 py-2">
                <Button
                  size="sm"
                  className="fw-bold px-3 rounded-pill border-0 w-100"
                  style={{
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    color: '#ffffff'
                  }}
                >
                  Login
                </Button>
              </Nav.Link>
            )}

            {/* ✅ डेस्कटॉपवर कार्ट आयकॉन */}

            {user && (
              <div className="ms-lg-2 d-none d-lg-block">
                <NotificationBell />
              </div>
            )}
            
            {!isAdmin && (
              <Nav.Link as={Link} to="/cart" onClick={closeNav} className="ms-lg-2 d-none d-lg-flex position-relative align-items-center px-2">
                <span style={{ fontSize: '1.3rem' }}>🛒</span>
                <Badge
                  pill
                  className="position-absolute"
                  style={{
                    top: '2px',
                    right: '4px',
                    fontSize: '0.65rem',
                    background: '#1e40af',
                    color: '#ffffff',
                    fontWeight: 700
                  }}
                >
                  {cartCount}
                </Badge>
              </Nav.Link>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}