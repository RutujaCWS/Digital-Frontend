import { Carousel, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const slides = [
  { title: 'Big Billion Days 🎉', subtitle: 'Up to 80% OFF on top brands', bg: 'linear-gradient(135deg, #2874f0 0%, #1e40af 100%)', img: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600', cta: 'Shop Now', link: '/?category=Mobiles' },
  { title: 'Electronics Fest ⚡', subtitle: 'Laptops, Headphones & more', bg: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600', cta: 'Explore', link: '/?category=Electronics' },
  { title: 'Fashion Sale 👕', subtitle: 'Flat 50% OFF on clothing', bg: 'linear-gradient(135deg, #ec4899 0%, #9d174d 100%)', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600', cta: 'Grab Deal', link: '/?category=Fashion' }
];

export default function HeroCarousel() {
  return (
    <Carousel className="hero-carousel" controls indicators interval={4000}>
      {slides.map((s, i) => (
        <Carousel.Item key={i}>
          <div className="hero-slide" style={{ background: s.bg }}>
            <div className="flex-grow-1">
              <h1>{s.title}</h1>
              <p>{s.subtitle}</p>
              <Button as={Link} to={s.link} variant="light" size="lg" className="fw-bold px-4">
                {s.cta} →
              </Button>
            </div>
            <img src={s.img} alt="" className="d-none d-md-block" />
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}