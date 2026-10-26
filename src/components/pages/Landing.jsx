import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import axios from 'axios';

import CategoryStrip from '../../components/landing/CategoryStrip';
import FlashDeals from '../../components/landing/FlashDeals';
import FeaturedProducts from '../../components/landing/FeaturedProducts';
import GiftOffers from '../../components/landing/GiftOffers';
import BrandStrip from '../../components/landing/BrandStrip';
import FeatureBar from '../../components/landing/FeatureBar';
import Gallery from '../../components/landing/Gallery';
import Newsletter from '../../components/landing/Newsletter';
import Footer from '../../components/landing/Footer';
import SpecialOffers from '../../components/landing/SpecialOffers';
import ReviewsSection from '../../components/landing/ReviewSection';
import VisitOurStore from '../../components/landing/VisitOurStore';


export default function Landing() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);

    axios.get(`https://digital-backend-phi.vercel.app/api/products?${params}`)
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => {
    axios.get('https://digital-backend-phi.vercel.app/api/site-settings')
      .then(res => setSettings(res.data))
      .catch(() => setSettings({}));
  }, []);

  const isFiltering = search || category;

  if (isFiltering) {
    return (
      <>
        <Container fluid className="px-3 px-md-4 py-4">
          <h4 className="section-title mb-3">
            {search && <>Results for "<span className="accent">{search}</span>"</>}
            {category && <>Category: <span className="accent">{category}</span></>}
            <span className="text-muted fs-6 ms-2">({products.length} items)</span>
          </h4>
          <FeaturedProducts products={products} loading={loading} />
        </Container>
        <Footer />
      </>
    );
  }

  const heroSlides = settings?.heroSlides?.length > 0
    ? [...settings.heroSlides].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const flashDeals = products.filter(p =>
    p.originalPrice && ((p.originalPrice - p.price) / p.originalPrice) > 0.3
  ).slice(0, 6);

  const giftProducts = products.filter(p => p.hasGift && p.gifts?.length > 0);

  return (
    <>
      {/* HERO CAROUSEL — Compact Height */}
      {heroSlides.length > 0 && (
        <Carousel
          controls={heroSlides.length > 1}
          indicators={heroSlides.length > 1}
          interval={5000}
          fade
        >
          {heroSlides.map((s, i) => (
            <Carousel.Item key={i}>
              <div
                className="position-relative d-flex align-items-center"
                style={{
                  height: 'clamp(180px, 28vw, 320px)',
                  backgroundImage: s.imageUrl ? `url(${s.imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: !s.imageUrl ? '#1e40af' : 'transparent'
                }}
              >
                {/* Dark overlay */}
                <div
                  className="position-absolute w-100 h-100 top-0 start-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
                    zIndex: 1
                  }}
                />

                {/* Content */}
                <Container
                  fluid
                  className="px-3 px-md-5 position-relative text-center text-md-start"
                  style={{ zIndex: 2 }}
                >
                  <div
                    className="text-white mx-auto mx-md-0"
                    style={{ maxWidth: '520px' }}
                  >
                    <h1
                      className="fw-bold mb-1 mb-md-2"
                      style={{
                        fontSize: 'clamp(1.1rem, 2.8vw, 2rem)',
                        lineHeight: 1.15,
                        color: '#ffffff',
                        textShadow: '1px 1px 8px rgba(0,0,0,0.9)'
                      }}
                    >
                      {s.title}
                    </h1>
                    <p
                      className="mb-2 mb-md-3"
                      style={{
                        fontSize: 'clamp(0.7rem, 1.5vw, 0.95rem)',
                        color: '#f1f5f9',
                        textShadow: '1px 1px 6px rgba(0,0,0,0.9)',
                        lineHeight: 1.4
                      }}
                    >
                      {s.subtitle}
                    </p>
                    {s.ctaText && (
                      <Button
                        as={Link}
                        to={s.ctaLink || '/'}
                        variant="light"
                        className="fw-bold"
                        size="sm"
                        style={{
                          fontSize: 'clamp(0.7rem, 1.2vw, 0.9rem)',
                          padding: 'clamp(0.35rem, 0.8vw, 0.5rem) clamp(0.8rem, 1.5vw, 1.3rem)',
                          borderRadius: '6px',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.3)'
                        }}
                      >
                        {s.ctaText} →
                      </Button>
                    )}
                  </div>
                </Container>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      )}

      <SpecialOffers />
      <CategoryStrip />
                        
      <Container fluid className="px-3 px-md-4">

        {giftProducts.length > 0 && <GiftOffers products={giftProducts} />}

        <div className="px-3 px-md-4 my-4">
  <div
    className="p-3 p-md-4 bg-white"
    style={{
      borderRadius: '20px',
      border: '1px solid #dbeafe'
    }}
  >
    <div className="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h4 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
          ⭐ Featured <span style={{ color: '#1e40af' }}>Products</span>
        </h4>
      </div>
    </div>

    <FeaturedProducts products={products} loading={loading} />
  </div>
</div>

        <BrandStrip />

        <FeatureBar />

        <Gallery />
        <Container fluid className="px-3 px-md-4 my-4">
  <Row className="g-4 align-items-stretch">
    {/* LEFT — Visit Our Store */}
    <Col xs={12} lg={6}>
      <VisitOurStore settings={settings} />
    </Col>

    {/* RIGHT — Reviews */}
    <Col xs={12} lg={6}>
      <ReviewsSection />
    </Col>
  </Row>
</Container>
        {/* <Newsletter /> */}
      </Container>
      
      <Footer />
    </>
  );
}