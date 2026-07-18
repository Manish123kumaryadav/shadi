import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Heart,
  LockKeyhole,
  MessageSquare,
  Search,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import './Home.css';

const ageOptions = Array.from({ length: 43 }, (_, index) => 18 + index);
const religions = ['Select', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist'];
const motherTongues = ['Select', 'Hindi', 'Marathi', 'Punjabi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali'];
const trustedCountries = [
  'India',
  'USA',
  'Canada',
  'United Kingdom',
  'Australia',
  'UAE',
  'Singapore',
  'New Zealand',
];
const successStories = [
  {
    names: 'Aarav & Meera',
    city: 'Mumbai',
    date: 'Married in 2026',
    quote: 'Our first conversation started with shared family values and became a lifelong promise.',
    image: 'https://images.unsplash.com/photo-1623091410901-00e2d268901f?auto=format&fit=crop&w=600&q=80',
  },
  {
    names: 'Rohan & Ananya',
    city: 'Delhi',
    date: 'Married in 2025',
    quote: 'ShaadiMatch helped both families connect with comfort, clarity, and trust.',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
  },
  {
    names: 'Vikram & Neha',
    city: 'Bengaluru',
    date: 'Married in 2025',
    quote: 'The profile details made it easy to understand what mattered before we met.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  },
  {
    names: 'Kunal & Priya',
    city: 'Pune',
    date: 'Married in 2026',
    quote: 'A simple match request turned into daily calls, then a beautiful wedding.',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
  },
  {
    names: 'Aditya & Kavya',
    city: 'Hyderabad',
    date: 'Married in 2025',
    quote: 'We found someone who understood career, culture, and family equally well.',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80',
  },
  {
    names: 'Nikhil & Isha',
    city: 'Ahmedabad',
    date: 'Married in 2024',
    quote: 'The community filters brought us together faster than we expected.',
    image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=600&q=80',
  },
  {
    names: 'Arjun & Sneha',
    city: 'Chennai',
    date: 'Married in 2026',
    quote: 'Our families liked the privacy and we liked how natural the chat felt.',
    image: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=600&q=80',
  },
  {
    names: 'Rahul & Pooja',
    city: 'Jaipur',
    date: 'Married in 2025',
    quote: 'We matched through city and mother tongue, then everything moved beautifully.',
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80',
  },
  {
    names: 'Dev & Riya',
    city: 'Surat',
    date: 'Married in 2024',
    quote: 'A verified profile made the first step easier for both sides.',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80',
  },
  {
    names: 'Harsh & Naina',
    city: 'Lucknow',
    date: 'Married in 2025',
    quote: 'We connected over similar expectations and our families clicked immediately.',
    image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80',
  },
  {
    names: 'Samar & Aditi',
    city: 'Kolkata',
    date: 'Married in 2026',
    quote: 'The right profile appeared at the right time, and the rest felt effortless.',
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=80',
  },
  {
    names: 'Yash & Tanvi',
    city: 'Indore',
    date: 'Married in 2025',
    quote: 'ShaadiMatch gave us a respectful start and a very happy ending.',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
  },
];

const Home = ({ isLoggedIn }) => {
  const sliderRef = useRef(null);
  const [activeStoryDot, setActiveStoryDot] = useState(0);

  const updateActiveStoryDot = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;
    const progress = maxScroll > 0 ? slider.scrollLeft / maxScroll : 0;
    setActiveStoryDot(Math.max(0, Math.min(2, Math.round(progress * 2))));
  };

  const slideStories = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.scrollBy({
      left: direction * Math.round(slider.clientWidth * 0.86),
      behavior: 'smooth',
    });
  };

  const slideToStoryDot = (dotIndex) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;
    slider.scrollTo({
      left: maxScroll * (dotIndex / 2),
      behavior: 'smooth',
    });
    setActiveStoryDot(dotIndex);
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      const slider = sliderRef.current;
      if (!slider) return;

      const nearEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 20;

      if (nearEnd) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      slider.scrollBy({
        left: Math.round(slider.clientWidth * 0.86),
        behavior: 'smooth',
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="home">
      <section className="shaadi-hero">
        <div className="hero-shade"></div>

        <header className="home-topbar">
          <Link to="/" className="shaadi-logo" aria-label="ShaadiMatch home">
            <span>ShaadiMatch</span>
            <Heart size={16} fill="currentColor" />
          </Link>

          <nav className="home-nav" aria-label="Home navigation">
            {isLoggedIn ? (
              <>
                <Link to="/browse">Browse</Link>
                <Link to="/messages">Messages</Link>
                <Link to="/profile">Profile</Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  Login <ChevronDown size={14} />
                </Link>
                <Link to="/info/help">Help</Link>
              </>
            )}
          </nav>
        </header>

        <div className="hero-copy">
          <h1>The World's No.1 Matchmaking Service</h1>
          <p>Search by City, Profession &amp; Community</p>
        </div>

        <form className="hero-search" aria-label="Match search">
          <label>
            <span>I'm looking for a</span>
            <select defaultValue="Woman">
              <option>Woman</option>
              <option>Man</option>
            </select>
          </label>

          <label className="age-label">
            <span>aged</span>
            <select defaultValue="22">
              {ageOptions.map((age) => (
                <option key={age}>{age}</option>
              ))}
            </select>
          </label>

          <span className="age-to">to</span>

          <label className="age-label age-label-end">
            <span className="empty-label">age end</span>
            <select defaultValue="27">
              {ageOptions.map((age) => (
                <option key={age}>{age}</option>
              ))}
            </select>
          </label>

          <label>
            <span>of religion</span>
            <select defaultValue="Select">
              {religions.map((religion) => (
                <option key={religion}>{religion}</option>
              ))}
            </select>
          </label>

          <label>
            <span>and mother tongue</span>
            <select defaultValue="Select">
              {motherTongues.map((language) => (
                <option key={language}>{language}</option>
              ))}
            </select>
          </label>

          <Link to={isLoggedIn ? '/browse' : '/register'} className="begin-btn">
            Let's Begin
          </Link>
        </form>
      </section>

      <section className="home-trust-strip">
        <article>
          <Shield size={24} />
          <strong>Verified profiles</strong>
          <span>Real people, safer discovery, and profile checks.</span>
        </article>
        <article>
          <Search size={24} />
          <strong>Smart filters</strong>
          <span>Search by city, age, religion, community, and intent.</span>
        </article>
        <article>
          <MessageSquare size={24} />
          <strong>Private messaging</strong>
          <span>Start meaningful conversations before sharing details.</span>
        </article>
      </section>

      <section className="home-proof">
        <div>
          <p className="home-kicker">Trusted matrimony</p>
          <h2>Find a match with confidence</h2>
          <p>
            ShaadiMatch brings focused discovery, verified profiles, secure messaging,
            and thoughtful preferences into one simple experience.
          </p>
        </div>

        <div className="proof-grid">
          <article>
            <Users size={24} />
            <strong>20K+</strong>
            <span>Profiles reviewed</span>
          </article>
          <article>
            <Star size={24} />
            <strong>8K+</strong>
            <span>Verified members</span>
          </article>
          <article>
            <LockKeyhole size={24} />
            <strong>96%</strong>
            <span>Privacy controls used</span>
          </article>
        </div>
      </section>

      <section className="success-slider-section">
        <div className="success-heading">
          <div>
            <p className="home-kicker">Marriage success stories</p>
            <h2>Real stories that started on ShaadiMatch</h2>
            <p>Browse 12 happy couples who found meaningful matches through profile details, family trust, and private conversations.</p>
          </div>

        </div>

        <div className="success-slider" ref={sliderRef} onScroll={updateActiveStoryDot}>
          {successStories.map((story) => (
            <article className="success-card" key={story.names}>
              <img src={story.image} alt={`${story.names} marriage success story`} />
              <div className="success-card-body">
                <div className="quote-stars">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Star key={item} size={15} fill="currentColor" />
                  ))}
                </div>
                <p>{story.quote}</p>
                <div>
                  <strong>{story.names}</strong>
                  <span>{story.city} | {story.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="slider-actions" aria-label="Success stories slider controls">
          <button type="button" onClick={() => slideStories(-1)} aria-label="Previous success stories">
            <ArrowLeft size={20} />
          </button>
          <div className="story-dots">
            {[0, 1, 2].map((dot) => (
              <button
                key={dot}
                type="button"
                className={activeStoryDot === dot ? 'active' : ''}
                onClick={() => slideToStoryDot(dot)}
                aria-label={`Go to success story set ${dot + 1}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => slideStories(1)} aria-label="Next success stories">
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <section className="trusted-country-section">
        <p className="home-kicker">Trusted countries</p>
        <h2>Trusted by Indians across the world</h2>
        <p>
          ShaadiMatch helps families and individuals discover meaningful matches in India
          and across global communities with privacy, verified profiles, and simple search.
        </p>

        <div className="country-list">
          {trustedCountries.map((country) => (
            <span key={country}>{country}</span>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <Link to="/" className="footer-brand">
          <span>ShaadiMatch</span>
          <Heart size={15} fill="currentColor" />
        </Link>

        <p>
          A trusted matchmaking experience for serious relationships, family-first
          conversations, and secure profile discovery.
        </p>

        <nav aria-label="Footer navigation">
          <Link to="/info/help">Help</Link>
          <Link to="/info/privacy">Privacy</Link>
          <Link to="/info/terms">Terms</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>

        <small>Copyright 2026 ShaadiMatch. All rights reserved.</small>
      </footer>
    </div>
  );
};

export default Home;
