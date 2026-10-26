import { useState } from 'react';
import { Container } from 'react-bootstrap';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => { setSubscribed(false); setEmail(''); }, 4000);
  };

  return (
    <Container fluid className="px-md-4 mb-4">
      <div className="newsletter">
        <h3>📬 Get Exclusive Deals</h3>
        <p>Subscribe for daily offers, gift alerts & flash sales</p>
        {subscribed ? (
          <div className="fw-bold fs-5">✅ Thanks for subscribing!</div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit">Subscribe</button>
          </form>
        )}
      </div>
    </Container>
  );
}