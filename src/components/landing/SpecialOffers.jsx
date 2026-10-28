import { useEffect, useState } from 'react';
import { Container, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function SpecialOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    axios
      .get('https://digital-backend-fv2v.onrender.com/api/special-offers/active')
      .then(r => setOffers(r.data || []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (offers.length <= 1) return;
    const id = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % offers.length);
    }, 6000);
    return () => clearInterval(id);
  }, [offers.length]);

  if (loading || offers.length === 0) return null;

  const getTimeLeft = (endDate) => {
    const diff = new Date(endDate).getTime() - now;
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      s: Math.floor((diff % (1000 * 60)) / 1000)
    };
  };

  // ✅ Upcoming offer साठी — कधी सुरू होईल
  const getStartsIn = (startDate) => {
    const diff = new Date(startDate).getTime() - now;
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    };
  };

  const getOfferText = (offer) => {
    if (offer.offerType === 'flat') return `₹${offer.discountValue} OFF`;
    return `${offer.discountValue}% OFF`;
  };

  const goToSlide = (idx) => setCurrentSlide(idx);
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % offers.length);
  const prevSlide = () =>
    setCurrentSlide(prev => (prev - 1 + offers.length) % offers.length);

  return (
    // Container padding mobile साठी कमी केले (px-2) आणि desktop साठी (px-md-3)
    <Container className="my-4 my-md-5 px-2 px-md-3">
      <div className="position-relative w-100">
        
        {/* SLIDER TRACK WRAPPER */}
        <div
          className="position-relative overflow-hidden w-100"
          style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        >
          {/* SLIDER TRACK */}
          <div
            className="d-flex w-100"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {offers.map((offer) => {
              const timeLeft = getTimeLeft(offer.endDate);
              const startsIn = getStartsIn(offer.startDate);
              const isUpcoming = offer.status === 'upcoming';

              return (
                // flex: '0 0 100%' मुळे मोबाईलवर पुढचा स्लाईड अजिबात दिसणार नाही
                <div 
                  key={offer._id} 
                  style={{ flex: '0 0 100%', width: '100%', maxWidth: '100%', overflow: 'hidden' }}
                >
                  <div
                    className="position-relative overflow-hidden h-100"
                    style={{
                      background: '#ffffff',
                      border: isUpcoming
                        ? '1px dashed #cbd5e1'
                        : '1px solid #e2e8f0',
                      borderRadius: '16px'
                    }}
                  >
                    <div className="row g-0 align-items-center h-100">
                      
                      {/* LEFT — BANNER IMAGE / COLOR BLOCK */}
                      <div className="col-12 col-md-5">
                        <div
                          className="position-relative"
                          style={{
                            // Mobile साठी उंची कमी केली
                            minHeight: 'clamp(140px, 35vw, 220px)', 
                            height: '100%',
                            background: offer.bannerImage
                              ? `url(${offer.bannerImage})`
                              : isUpcoming
                                ? 'linear-gradient(135deg, #475569 0%, #1e293b 100%)'
                                : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                          }}
                        >
                          {/* No banner image → show big icon + text */}
                          {!offer.bannerImage && (
                            <div className="text-center text-white">
                              <div
                                style={{
                                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                                  lineHeight: 1,
                                  marginBottom: '8px',
                                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))'
                                }}
                              >
                                {isUpcoming ? '🚀' : '🎉'}
                              </div>
                              <div
                                className="fw-bold"
                                style={{
                                  fontSize: '0.85rem',
                                  letterSpacing: '0.2em',
                                  textTransform: 'uppercase'
                                }}
                              >
                                {isUpcoming ? 'Coming Soon' : 'Special Sale'}
                              </div>
                            </div>
                          )}

                          {/* Badge — top-left overlay */}
                          <Badge
                            className="position-absolute"
                            style={{
                              top: '14px',
                              left: '14px',
                              fontSize: '0.6rem',
                              letterSpacing: '1px',
                              fontWeight: 700,
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: isUpcoming
                                ? 'rgba(71, 85, 105, 0.95)'
                                : offer.bannerImage
                                  ? 'rgba(0,0,0,0.7)'
                                  : 'rgba(255,255,255,0.95)',
                              color: isUpcoming
                                ? '#ffffff'
                                : offer.bannerImage
                                  ? '#ffffff'
                                  : '#dc2626',
                              border: '1px solid rgba(255,255,255,0.3)'
                            }}
                          >
                            {isUpcoming
                              ? '🚀 COMING SOON'
                              : offer.badge || '🎉 OFFER'}
                          </Badge>
                        </div>
                      </div>

                      {/* RIGHT — CONTENT */}
                      <div className="col-12 col-md-7">
                        {/* Padding mobile साठी कमी केले */}
                        <div style={{ padding: 'clamp(16px, 3vw, 32px)' }}>
                          {/* Title */}
                          <h3
                            className="fw-bold mb-2"
                            style={{
                              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                              color: '#0f172a',
                              letterSpacing: '-0.02em',
                              lineHeight: 1.2
                            }}
                          >
                            {offer.title}
                          </h3>

                          {/* Subtitle */}
                          {offer.subtitle && (
                            <p
                              className="mb-2"
                              style={{
                                fontSize: '0.85rem',
                                color: '#64748b',
                                lineHeight: 1.5,
                                margin: 0,
                                maxWidth: '480px'
                              }}
                            >
                              {offer.subtitle}
                            </p>
                          )}

                          {/* Discount chip row */}
                          <div className="d-flex flex-wrap gap-2 mb-3 mt-2">
                            <div
                              className="d-inline-flex align-items-center gap-2"
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                padding: '5px 12px',
                                border: '1px solid #fecaca'
                              }}
                            >
                              💰 {getOfferText(offer)}
                            </div>

                            {offer.minOrderAmount > 0 && (
                              <div
                                className="d-inline-flex align-items-center gap-1"
                                style={{
                                  background: '#f8fafc',
                                  color: '#475569',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  padding: '5px 12px',
                                  border: '1px solid #e2e8f0'
                                }}
                              >
                                Min ₹{offer.minOrderAmount.toLocaleString()}
                              </div>
                            )}
                          </div>

                          {/* Countdown + CTA */}
                          <div className="d-flex flex-wrap align-items-end gap-3 mt-3">
                            {/* === ACTIVE OFFER → Ends in countdown === */}
                            {!isUpcoming && timeLeft && (
                              <div>
                                <div
                                  className="fw-semibold mb-1"
                                  style={{
                                    fontSize: '0.6rem',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    color: '#94a3b8'
                                  }}
                                >
                                  ⏱️ Ends in
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                  {[
                                    { label: 'D', value: timeLeft.d },
                                    { label: 'H', value: timeLeft.h },
                                    { label: 'M', value: timeLeft.m },
                                    { label: 'S', value: timeLeft.s }
                                  ].map((t, i) => (
                                    <div
                                      key={i}
                                      className="text-center fw-bold"
                                      style={{
                                        minWidth: '32px', // मोबाईलसाठी ३२px
                                        padding: '4px 5px',
                                        background: '#1e293b',
                                        color: '#ffffff',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        lineHeight: 1.2
                                      }}
                                    >
                                      {String(t.value).padStart(2, '0')}
                                      <div
                                        style={{
                                          fontSize: '0.45rem',
                                          fontWeight: 500,
                                          opacity: 0.7,
                                          letterSpacing: '0.5px'
                                        }}
                                      >
                                        {t.label}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* === UPCOMING OFFER → Starts in countdown === */}
                            {isUpcoming && startsIn && (
                              <div>
                                <div
                                  className="fw-semibold mb-1"
                                  style={{
                                    fontSize: '0.6rem',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    color: '#94a3b8'
                                  }}
                                >
                                  🚀 Starts in
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                  {[
                                    { label: 'D', value: startsIn.d },
                                    { label: 'H', value: startsIn.h },
                                    { label: 'M', value: startsIn.m }
                                  ].map((t, i) => (
                                    <div
                                      key={i}
                                      className="text-center fw-bold"
                                      style={{
                                        minWidth: '32px',
                                        padding: '4px 5px',
                                        background: '#475569',
                                        color: '#ffffff',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        lineHeight: 1.2
                                      }}
                                    >
                                      {String(t.value).padStart(2, '0')}
                                      <div
                                        style={{
                                          fontSize: '0.45rem',
                                          fontWeight: 500,
                                          opacity: 0.7,
                                          letterSpacing: '0.5px'
                                        }}
                                      >
                                        {t.label}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* CTA */}
                            {isUpcoming ? (
                              <button
                                disabled
                                className="border-0 fw-bold d-inline-flex align-items-center gap-1"
                                style={{
                                  background: '#e2e8f0',
                                  color: '#64748b',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  padding: '0.5rem 1rem',
                                  cursor: 'not-allowed'
                                }}
                              >
                                🔒 Coming Soon
                              </button>
                            ) : (
                              <Link
                                to="/"
                                className="text-decoration-none fw-bold d-inline-flex align-items-center gap-1"
                                style={{
                                  background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                                  color: '#ffffff',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  padding: '0.5rem 1rem',
                                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(220, 38, 38, 0.4)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                                }}
                              >
                                Shop Now →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ARROWS */}
          {offers.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="position-absolute d-none d-md-flex align-items-center justify-content-center border-0"
                style={{
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)',
                  color: '#dc2626',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  zIndex: 5,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                className="position-absolute d-none d-md-flex align-items-center justify-content-center border-0"
                style={{
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)',
                  color: '#dc2626',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  zIndex: 5,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* DOTS */}
        {offers.length > 1 && (
          <div className="d-flex justify-content-center gap-2 mt-3">
            {offers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className="border-0 p-0"
                style={{
                  width: idx === currentSlide ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  background: idx === currentSlide ? '#dc2626' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}