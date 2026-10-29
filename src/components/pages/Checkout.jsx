import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
  const { cart, fetchCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [offerDiscount, setOfferDiscount] = useState(0);
  const [appliedOffers, setAppliedOffers] = useState([]);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'COD'
  });

  const items = (cart.items || []).filter(
    i => i && i.product && typeof i.product.price === 'number'
  );

   // ✅ Base Price
   const baseSubtotal = items.reduce(
    (s, i) => s + (Number(i.product.price) || 0) * (Number(i.quantity) || 1),
    0
  );

  // ✅ Total GST
  const totalGst = items.reduce(
    (s, i) => s + ((Number(i.product.price) || 0) * (Number(i.quantity) || 1) * (Number(i.product.gst) || 0)) / 100,
    0
  );

  // ✅ Subtotal (GST Included)
  const itemsPrice = baseSubtotal + totalGst;
  const deliveryCharge = itemsPrice > 500 ? 0 : 40;
  const totalItems = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  useEffect(() => {
    if (items.length === 0 || itemsPrice === 0) {
      setOfferDiscount(0);
      setAppliedOffers([]);
      return;
    }

    const calculate = () => {
      const cartItems = items.map(i => ({
        product: i.product._id,
        productId: i.product._id,
        price: Number(i.product.price) || 0,
        quantity: Number(i.quantity) || 1,
        category: i.product.category,
        brand: i.product.brand
      }));

      axios
        .post('https://digitalworldkopargaonbackend.vercel.app/api/special-offers/calculate', {
          items: cartItems,
          subtotal: itemsPrice
        })
        .then(r => {
          setOfferDiscount(r.data.totalDiscount || 0);
          setAppliedOffers(r.data.appliedOffers || []);
        })
        .catch(() => {
          setOfferDiscount(0);
          setAppliedOffers([]);
        });
    };

    calculate();
    const id = setInterval(calculate, 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPrice, items.length]);

  const getItemDiscount = (productId) => {
    return appliedOffers
      .flatMap(o => o.itemBreakdown || [])
      .filter(b => b.productId === productId.toString())
      .reduce((s, b) => s + b.totalDiscount, 0);
  };

  const totalProductDiscount = appliedOffers
    .flatMap(o => o.itemBreakdown || [])
    .reduce((s, b) => s + b.totalDiscount, 0);

  const itemTotal = itemsPrice - totalProductDiscount;

  const orderOffers = appliedOffers.filter(o => o.itemBreakdown.length === 0);
  const totalOrderDiscount = orderOffers.reduce((s, o) => s + o.discount, 0);

  const totalPrice = itemTotal + deliveryCharge - totalOrderDiscount;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { paymentMethod, ...shippingAddress } = form;
      const { data } = await axios.post(
        'https://digitalworldkopargaonbackend.vercel.app/api/orders',
        { shippingAddress, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(
        `🎉 Order Placed Successfully!\n\n` +
        `Order No: ${data.orderNumber || 'N/A'}\n\n` +
        `Thank you for shopping with Digital World!\n` +
        `Our team will contact you shortly.\n\n` +
        `---\n` +
        `आपका ऑर्डर सफलतापूर्वक दे दिया गया है।\n` +
        `Digital World की टीम जल्द ही आपसे संपर्क करेगी।`
      );

      await fetchCart();
      navigate('/orders', { state: { orderNumber: data.orderNumber } });
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center py-4 py-md-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h4 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Your Cart is Empty</h4>
          <p className="text-muted small mb-4">Add products before proceeding to checkout.</p>
          <Link to="/" className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-2" style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#ffffff', padding: '0.75rem 2rem', borderRadius: '12px', fontSize: '0.9rem', boxShadow: '0 6px 20px rgba(30, 64, 175, 0.3)' }}>
            🛍️ Shop Now
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div style={{
      background: '#f9fafb',
      minHeight: '100vh',
      paddingTop: '2rem',
      paddingBottom: '3rem'
    }}
  >
    <Container fluid className="px-3 px-md-4" style={{ maxWidth: '1400px' }}>
        <div className="mb-4">
          <span className="d-inline-block fw-semibold mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#3b82f6' }}>Final Step</span>
          <div className="d-flex align-items-end justify-content-between flex-wrap gap-2">
            <h2 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)', letterSpacing: '-0.02em' }}>Checkout</h2>
            <Link to="/cart" className="text-decoration-none fw-semibold small d-none d-sm-inline-flex align-items-center gap-1" style={{ color: '#1e40af' }}>← Back to Cart</Link>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="border-0 small mb-4" style={{ borderRadius: '12px' }}>
            ⚠️ {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            <Col xs={12} lg={8}>
              {/* SHIPPING ADDRESS */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem', marginBottom: '1rem' }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#ffffff', fontSize: '1.1rem' }}>📍</div>
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1rem' }}>Shipping Address</h6>
                    <small style={{ color: '#64748b', fontSize: '0.78rem' }}>Where should we deliver?</small>
                  </div>
                </div>
                <hr style={{ borderTop: '1px dashed #e2e8f0', margin: '0 0 1.25rem 0', opacity: 1 }} />
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>Full Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control name="fullName" required value={form.fullName} onChange={handleChange} placeholder="Enter your full name" style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>Phone <span className="text-danger">*</span></Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px 0 0 10px', fontSize: '0.9rem' }}>+91</InputGroup.Text>
                        <Form.Control name="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile" maxLength={10} style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '0 10px 10px 0', fontSize: '0.9rem' }} />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>Address <span className="text-danger">*</span></Form.Label>
                      <Form.Control as="textarea" rows={2} name="address" required value={form.address} onChange={handleChange} placeholder="House no., Street, Landmark" style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '0.9rem', resize: 'none' }} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>City <span className="text-danger">*</span></Form.Label>
                      <Form.Control name="city" required value={form.city} onChange={handleChange} placeholder="City" style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>State <span className="text-danger">*</span></Form.Label>
                      <Form.Control name="state" required value={form.state} onChange={handleChange} placeholder="State" style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small" style={{ color: '#334155' }}>Pincode <span className="text-danger">*</span></Form.Label>
                      <Form.Control name="pincode" required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="6-digit" maxLength={6} style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* PAYMENT METHOD */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem' }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#ffffff', fontSize: '1.1rem' }}>💳</div>
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1rem' }}>Payment Method</h6>
                    <small style={{ color: '#64748b', fontSize: '0.78rem' }}>Choose how you want to pay</small>
                  </div>
                </div>
                <hr style={{ borderTop: '1px dashed #e2e8f0', margin: '0 0 1.25rem 0', opacity: 1 }} />
                <Row className="g-2">
                  <Col xs={12} sm={6}>
                    <label className="d-flex align-items-center gap-3 p-3 mb-0 w-100" style={{ background: form.paymentMethod === 'COD' ? '#eff6ff' : '#f8fafc', border: form.paymentMethod === 'COD' ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
                      <Form.Check type="radio" name="paymentMethod" value="COD" checked={form.paymentMethod === 'COD'} onChange={handleChange} style={{ margin: 0 }} />
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.3rem' }}>💵</span>
                        <div>
                          <div className="fw-semibold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>Cash on Delivery</div>
                          <div className="small" style={{ color: '#64748b', fontSize: '0.75rem' }}>Pay when you receive</div>
                        </div>
                      </div>
                    </label>
                  </Col>
                  <Col xs={12} sm={6}>
                    <label className="d-flex align-items-center gap-3 p-3 mb-0 w-100" style={{ background: form.paymentMethod === 'Online' ? '#eff6ff' : '#f8fafc', border: form.paymentMethod === 'Online' ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
                      <Form.Check type="radio" name="paymentMethod" value="Online" checked={form.paymentMethod === 'Online'} onChange={handleChange} style={{ margin: 0 }} />
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.3rem' }}>📱</span>
                        <div>
                          <div className="fw-semibold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>Online Payment</div>
                          <div className="small" style={{ color: '#64748b', fontSize: '0.75rem' }}>UPI / Card / Netbanking</div>
                        </div>
                      </div>
                    </label>
                  </Col>
                </Row>
              </div>
            </Col>

            {/* RIGHT — ORDER SUMMARY */}
            <Col xs={12} lg={4}>
              <div style={{ position: 'sticky', top: '90px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#ffffff', fontSize: '1.1rem' }}>🧾</div>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1rem' }}>Order Summary</h6>
                      <small style={{ color: '#64748b', fontSize: '0.78rem' }}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</small>
                    </div>
                  </div>
                  <hr style={{ borderTop: '1px dashed #e2e8f0', margin: '0 0 1.25rem 0', opacity: 1 }} />

                  <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                    {items.map(i => {
                      const itemOff = getItemDiscount(i.product._id);
                      const finalLinePrice = (Number(i.product.price) * Number(i.quantity)) - itemOff;
                      return (
                        <div key={i.product._id} className="d-flex justify-content-between align-items-start gap-2 small">
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="fw-semibold text-truncate" style={{ color: '#0f172a', fontSize: '0.82rem' }}>
                              {i.product.name}
                            </div>
                            <div className="small" style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                              Qty: {i.quantity}
                            </div>
                          </div>
                          <span className="fw-semibold" style={{ color: '#0f172a', fontSize: '0.85rem', flexShrink: 0 }}>
                            ₹{finalLinePrice.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ borderTop: '1px dashed #e2e8f0', margin: '12px 0' }} />

                  <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between">
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Base Price</span>
                      <span className="fw-semibold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>₹{baseSubtotal.toLocaleString()}</span>
                    </div>

                    {totalGst > 0 && (
                      <div className="d-flex justify-content-between">
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>GST Included</span>
                        <span className="fw-semibold" style={{ color: '#64748b', fontSize: '0.9rem' }}>₹{totalGst.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-1 pt-2" style={{ borderTop: '1px dashed #e2e8f0' }}>
                      <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>Subtotal</span>
                      <span className="fw-semibold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>₹{itemsPrice.toLocaleString()}</span>
                    </div>
                    {/* ✅ Product-wise Discount List */}
                    {items.map(i => {
                      const itemOff = getItemDiscount(i.product._id);
                      if (itemOff <= 0) return null;

                      const appliedOffer = appliedOffers.find(o => 
                        o.itemBreakdown?.some(b => b.productId === i.product._id.toString())
                      );

                      return (
                        <div key={`off-${i.product._id}`} className="d-flex flex-column gap-1 mt-1">
                          <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.85rem' }}>
                            <span>{i.product.name} <span style={{ fontSize: '0.75rem' }}>(₹{Number(i.product.price).toLocaleString()} × {i.quantity})</span></span>
                          </div>
                          <div className="d-flex justify-content-between text-danger" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            <span>🎉 {appliedOffer ? appliedOffer.title : 'Product Offer'}</span>
                            <span>− ₹{itemOff.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="d-flex justify-content-between align-items-center mt-2 pt-2" style={{ borderTop: '1px dashed #e2e8f0' }}>
                      <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>Item Total</span>
                      <span className="fw-semibold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>₹{itemTotal.toLocaleString()}</span>
                    </div>

                    {/* ✅ Order Level Offer */}
                    {orderOffers.map((o, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center text-danger small mt-1">
                        <span>🎁 {o.title} (Order Offer)</span>
                        <span className="fw-semibold">− ₹{o.discount.toLocaleString()}</span>
                      </div>
                    ))}

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Delivery</span>
                      {deliveryCharge === 0 ? (
                        <Badge className="fw-semibold" style={{ background: '#16a34a', color: '#ffffff', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '7px' }}>FREE</Badge>
                      ) : (
                        <span className="fw-semibold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>₹{deliveryCharge}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed #e2e8f0', margin: '12px 0' }} />

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold" style={{ color: '#0f172a', fontSize: '1rem' }}>Total</span>
                    <span className="fw-bold" style={{ color: '#1e40af', fontSize: 'clamp(1.3rem, 3vw, 1.5rem)' }}>₹{totalPrice.toLocaleString()}</span>
                  </div>

                  {offerDiscount > 0 && (
                    <div className="text-center p-2 mb-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                      🎉 You saved ₹{offerDiscount.toLocaleString()}!
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="w-100 fw-semibold border-0 d-flex align-items-center justify-content-center gap-2" style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#ffffff', padding: '0.85rem', borderRadius: '12px' }}>
                    {loading ? <><Spinner animation="border" size="sm" /> Placing Order...</> : <>🔒 Place Order</>}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
}