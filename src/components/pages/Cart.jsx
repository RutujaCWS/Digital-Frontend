import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [offerDiscount, setOfferDiscount] = useState(0);
  const [appliedOffers, setAppliedOffers] = useState([]);

  const items = (cart.items || []).filter(
    i => i && i.product && typeof i.product.price === 'number'
  );

    // ✅ Base Price (GST sodun)
    const baseSubtotal = items.reduce(
      (s, i) => s + (Number(i.product.price) || 0) * (Number(i.quantity) || 1),
      0
    );
  
    // ✅ Total GST
    const totalGst = items.reduce(
      (s, i) => s + ((Number(i.product.price) || 0) * (Number(i.quantity) || 1) * (Number(i.product.gst) || 0)) / 100,
      0
    );
  
    // ✅ Subtotal (GST Included) - Ha customer la disanar
    const subtotal = baseSubtotal + totalGst;
  const delivery = subtotal > 500 ? 0 : 40;
  const totalItems = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  // 🎉 Discount — re-calculate every 60s
  useEffect(() => {
    if (items.length === 0 || subtotal === 0) {
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
        .post('https://digital-backend-fv2v.onrender.com/api/special-offers/calculate', {
          items: cartItems,
          subtotal
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
  }, [subtotal, items.length]);

  const getItemDiscount = (productId) => {
    return appliedOffers
      .flatMap(o => o.itemBreakdown || [])
      .filter(b => b.productId === productId.toString())
      .reduce((s, b) => s + b.totalDiscount, 0);
  };

  // ✅ १. एकूण प्रोडक्टवर मिळालेली सूट
  const totalProductDiscount = appliedOffers
    .flatMap(o => o.itemBreakdown || [])
    .reduce((s, b) => s + b.totalDiscount, 0);

  // ✅ २. 'Item Total' (Subtotal - Product Discount)
  const itemTotal = subtotal - totalProductDiscount;

  // ✅ ३. कार्टवरची ऑफर (Order Level Offer)
  const orderOffers = appliedOffers.filter(o => o.itemBreakdown.length === 0);
  const totalOrderDiscount = orderOffers.reduce((s, o) => s + o.discount, 0);

  // ✅ ४. अंतिम बिल
  const total = itemTotal + delivery - totalOrderDiscount;

  if (items.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center py-4 py-md-5">
          <div style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>🛒</div>
          <h4 className="fw-bold mb-2" style={{ color: '#0f172a' }}>
            Your Cart is Empty
          </h4>
          <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '400px' }}>
            Looks like you haven't added anything yet. Start shopping and find something you love!
          </p>
          <Link
            to="/"
            className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              color: '#ffffff',
              padding: '0.75rem 2rem',
              borderRadius: '12px',
              fontSize: '0.9rem',
              boxShadow: '0 6px 20px rgba(30, 64, 175, 0.3)'
            }}
          >
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
          <div className="d-flex align-items-end justify-content-between flex-wrap gap-2">
            <h2 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)' }}>
              Your Cart{' '}
              <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.95rem' }}>
                ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </span>
            </h2>
            <Link to="/" className="text-decoration-none fw-semibold small d-none d-sm-inline-flex align-items-center gap-1" style={{ color: '#1e40af' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>

        <Row className="g-4">
          <Col xs={12} lg={8}>
            <div className="d-flex flex-column gap-3">
              {items.map(item => {
                const p = item.product;
                if (!p) return null;

                // ✅ GST included Price
                const price = Number(p.price) || 0; 
                const quantity = Number(item.quantity) || 1;
                const lineTotal = price * quantity;
                const itemOff = getItemDiscount(p._id);
                const finalLinePrice = Math.max(0, lineTotal - itemOff);

                return (
                  <div key={p._id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', overflow: 'hidden' }}>
                    <div className="p-3 p-md-4">
                      <Row className="g-3 align-items-center">
                        <Col xs={4} sm={3} md={2}>
                          <Link to={`/product/${p._id}`} className="d-flex align-items-center justify-content-center text-decoration-none" style={{ background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', border: '1px solid #e2e8f0', borderRadius: '14px', height: '100px', padding: '10px' }}>
                            <img src={p.image} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </Link>
                        </Col>
                        <Col xs={8} sm={9} md={6}>
                          {p.category && (
                            <div className="fw-semibold text-uppercase mb-1" style={{ fontSize: '0.6rem', color: '#3b82f6' }}>
                              {p.category}
                            </div>
                          )}
                          <Link to={`/product/${p._id}`} className="text-decoration-none" style={{ display: 'block' }}>
                            <h6 className="fw-bold mb-2 text-truncate" style={{ color: '#0f172a', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                              {p.name || 'Product'}
                            </h6>
                          </Link>

                          {p.hasGift && (
                            <div className="d-inline-flex align-items-center gap-1 mb-2" style={{ background: '#eff6ff', color: '#1e40af', fontSize: '0.7rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' }}>
                              🎁 Free Gift Included
                            </div>
                          )}

                          {itemOff > 0 && (
                            <div className="d-inline-flex align-items-center gap-1 mb-2 ms-1" style={{ background: '#fef2f2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', border: '1px solid #fecaca' }}>
                              🎉 −₹{itemOff.toLocaleString()} (Product Offer)
                            </div>
                          )}

                          <div className="d-none d-md-block" style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          ₹{(Number(p.price) || 0).toLocaleString()} each
                          </div>
                          <div className="d-md-none fw-bold mt-1" style={{ color: '#1e40af', fontSize: '1rem' }}>
                            ₹{finalLinePrice.toLocaleString()}
                          </div>
                        </Col>
                        <Col xs={12} md={4}>
                          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                              <div className="fw-semibold text-uppercase mb-1" style={{ fontSize: '0.6rem', color: '#64748b' }}>
                                Qty
                              </div>
                              <InputGroup size="sm" style={{ width: '120px' }}>
                                <Button variant="outline-secondary" onClick={() => updateQuantity(p._id, quantity - 1)} disabled={quantity <= 1} style={{ borderColor: '#e2e8f0', background: '#f8fafc', borderRadius: '8px 0 0 8px', width: '36px' }}>−</Button>
                                <Form.Control type="text" value={quantity} readOnly className="text-center fw-bold border-start-0 border-end-0" style={{ background: '#ffffff', borderColor: '#e2e8f0' }} />
                                <Button variant="outline-secondary" onClick={() => updateQuantity(p._id, quantity + 1)} disabled={quantity >= 10} style={{ borderColor: '#e2e8f0', background: '#f8fafc', borderRadius: '0 8px 8px 0', width: '36px' }}>+</Button>
                              </InputGroup>
                            </div>
                            <div className="d-none d-md-block text-end">
                              <div className="fw-semibold text-uppercase mb-1" style={{ fontSize: '0.6rem', color: '#64748b' }}>Subtotal</div>
                              <div className="fw-bold" style={{ color: '#1e40af', fontSize: '1.15rem' }}>₹{baseSubtotal.toLocaleString()}
                              </div>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <div className="d-flex align-items-center justify-content-end gap-2 mt-1">
                                  <span className="text-decoration-line-through text-muted" style={{ fontSize: '0.75rem' }}>
                                    ₹{(Number(p.originalPrice) * quantity).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(p._id)} className="border-0 bg-transparent mt-3 p-0 text-danger" style={{ fontSize: '0.75rem', fontWeight: 600 }}>🗑️ Remove</button>
                        </Col>
                      </Row>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>

          {/* RIGHT — PRICE DETAILS */}
          <Col xs={12} lg={4}>
            <div style={{ position: 'sticky', top: '90px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', overflow: 'hidden' }}>
                <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: '#ffffff' }}>
                  <h6 className="fw-bold mb-0">💳 Price Details</h6>
                </div>
                <div className="p-4">
                  <div className="d-flex flex-column gap-3">
                    
                  <div className="d-flex justify-content-between align-items-center">
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Base Price</span>
                      <span className="fw-semibold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>₹{baseSubtotal.toLocaleString()}</span>
                    </div>

                    {totalGst > 0 && (
                      <div className="d-flex justify-content-between align-items-center">
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>GST Included</span>
                        <span className="fw-semibold" style={{ color: '#64748b', fontSize: '0.9rem' }}>₹{totalGst.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-1 pt-2" style={{ borderTop: '1px dashed #e2e8f0' }}>
                      <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Subtotal</span>
                      <span className="fw-semibold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>₹{subtotal.toLocaleString()}</span>
                    </div>

                    {/* ✅ Product-wise Discount List with Price and Qty */}
                    {items.map(i => {
                      const itemOff = getItemDiscount(i.product._id);
                      if (itemOff <= 0) return null;
                      
                      // ✅ बॅकएंडवरून आलेलं ऑफरचं खरं नाव शोधा
                      const appliedOffer = appliedOffers.find(o => 
                        o.itemBreakdown?.some(b => b.productId === i.product._id.toString())
                      );

                      return (
                        <div key={`off-${i.product._id}`} className="d-flex flex-column gap-1 mt-2">
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
                      <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Item Total</span>
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
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Delivery</span>
                      {delivery === 0 ? (
                        <Badge style={{ background: '#16a34a', color: '#ffffff', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '7px' }}>FREE</Badge>
                      ) : (
                        <span className="fw-semibold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>₹{delivery}</span>
                      )}
                    </div>

                    <div style={{ borderTop: '1px dashed #e2e8f0', margin: '4px 0' }} />

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold" style={{ color: '#0f172a', fontSize: '1rem' }}>Total</span>
                      <span className="fw-bold" style={{ color: '#1e40af', fontSize: 'clamp(1.3rem, 3vw, 1.5rem)' }}>₹{total.toLocaleString()}</span>
                    </div>

                    {offerDiscount > 0 && (
                      <div className="text-center p-2 mt-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                        🎉 You saved ₹{offerDiscount.toLocaleString()}!
                      </div>
                    )}
                  </div>
                  <Button className="w-100 fw-semibold mt-4" onClick={() => navigate(user ? '/checkout' : '/login?redirect=/checkout')} style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#ffffff', padding: '0.85rem', borderRadius: '12px' }}>
                    🔒 {user ? 'Place Order' : 'Login & Checkout'}
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}