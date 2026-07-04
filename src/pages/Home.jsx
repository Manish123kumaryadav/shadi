import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarHeart,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  MessageSquare,
  PhoneCall,
  Search,
  Shield,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import heroImage from '../assets/hero.png';
import './Home.css';

const cityFilters = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai'];
const intentFilters = ['Family values', 'Career focused', 'Travel friendly', 'Verified only'];

const Home = ({ isLoggedIn }) => {
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [selectedIntent, setSelectedIntent] = useState('Family values');

  const matchScore = useMemo(() => {
    const cityBoost = cityFilters.indexOf(selectedCity) * 3;
    const intentBoost = intentFilters.indexOf(selectedIntent) * 5;
    return 82 + ((cityBoost + intentBoost) % 15);
  }, [selectedCity, selectedIntent]);

  return (
    <div className="home">
      <section className="home-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(26, 35, 48, 0.88), rgba(26, 35, 48, 0.48)), url(${heroImage})` }}>
        <div className="home-hero-content">
          <p className="home-kicker"><Sparkles size={16} /> Trusted matrimony for meaningful matches</p>
          <h1>ShadiMatch</h1>
          <p className="home-hero-copy">
            Meet compatible partners through verified profiles, thoughtful filters, private chat, and audio calls built for serious conversations.
          </p>
          {!isLoggedIn ? (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">Create Profile</Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/browse" className="btn btn-primary btn-lg">Browse Matches</Link>
              <Link to="/messages" className="btn btn-secondary btn-lg">Open Messages</Link>
            </div>
          )}
        </div>

        <div className="hero-insight">
          <div>
            <span>Compatibility preview</span>
            <strong>{matchScore}%</strong>
          </div>
          <p>{selectedCity} matches with {selectedIntent.toLowerCase()} preference are trending today.</p>
        </div>
      </section>

      <section className="match-lab">
        <div className="section-heading">
          <p className="home-kicker">Match lab</p>
          <h2>Shape the search around real priorities</h2>
          <p>Explore how location and intent change the kind of profiles surfaced first.</p>
        </div>

        <div className="match-lab-grid">
          <div className="preference-panel">
            <h3>Preferred city</h3>
            <div className="chip-row">
              {cityFilters.map((city) => (
                <button
                  key={city}
                  className={selectedCity === city ? 'active' : ''}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>

            <h3>Match intent</h3>
            <div className="chip-row">
              {intentFilters.map((intent) => (
                <button
                  key={intent}
                  className={selectedIntent === intent ? 'active' : ''}
                  onClick={() => setSelectedIntent(intent)}
                >
                  {intent}
                </button>
              ))}
            </div>
          </div>

          <div className="match-preview">
            <div className="score-ring">
              <strong>{matchScore}%</strong>
              <span>match fit</span>
            </div>
            <div>
              <h3>{selectedCity} profile queue</h3>
              <p>{selectedIntent} profiles are prioritized with verified photos, active messaging, and shared community preferences.</p>
              <div className="preview-points">
                <span><CheckCircle2 size={16} /> Verified photos</span>
                <span><CheckCircle2 size={16} /> Active this week</span>
                <span><CheckCircle2 size={16} /> Shared expectations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div><strong>20K+</strong><span>Profiles reviewed</span></div>
        <div><strong>8K+</strong><span>Verified members</span></div>
        <div><strong>14K+</strong><span>Messages sent</span></div>
        <div><strong>96%</strong><span>Privacy controls used</span></div>
      </section>

      <section className="feature-story">
        <div className="section-heading">
          <p className="home-kicker">Built for trust</p>
          <h2>Everything needed before families get involved</h2>
        </div>
        <div className="feature-story-grid">
          {[
            [Shield, 'Verified identity signals', 'Email, mobile, profile details, and photo checks create a safer first conversation.'],
            [Search, 'Useful discovery filters', 'Browse by age, city, religion, caste, education, occupation, and relationship intent.'],
            [MessageSquare, 'Private conversations', 'Start with text, continue with real-time chat, and keep conversations organized.'],
            [PhoneCall, 'Audio calling', 'Move from chat to voice when both people are ready for a more personal conversation.'],
            [LockKeyhole, 'Profile privacy', 'Sensitive information stays inside authenticated flows with token-based sessions.'],
            [CalendarHeart, 'Relationship milestones', 'Track likes, views, matches, and conversations across the journey.'],
          ].map(([Icon, title, text]) => (
            <article className="story-card" key={title}>
              <Icon size={24} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="journey">
        <div className="section-heading">
          <p className="home-kicker">Member journey</p>
          <h2>From profile to conversation</h2>
        </div>
        <div className="journey-steps">
          {[
            ['01', 'Create', 'Add essentials, preferences, photos, and the values that matter.'],
            ['02', 'Discover', 'Review relevant profiles with clear compatibility signals.'],
            ['03', 'Express', 'Send likes, see interest, and follow profile views.'],
            ['04', 'Connect', 'Chat securely and start an audio call when the timing feels right.'],
          ].map(([number, title, text]) => (
            <div className="journey-step" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="success-stories">
        <div className="section-heading">
          <p className="home-kicker">Success stories</p>
          <h2>Warm starts from real conversations</h2>
        </div>
        <div className="story-quotes">
          {[
            ['Priya & Raj', 'Mumbai', 'The filters helped us find shared expectations before the first conversation.'],
            ['Anjali & Arjun', 'Delhi', 'The chat felt simple, private, and serious enough for both families.'],
            ['Neha & Vikram', 'Bangalore', 'We moved from likes to messages naturally and knew what mattered early.'],
          ].map(([name, city, quote]) => (
            <article className="quote-card" key={name}>
              <div className="quote-stars">
                {[1, 2, 3, 4, 5].map((item) => <Star size={16} fill="currentColor" key={item} />)}
              </div>
              <p>{quote}</p>
              <strong>{name}</strong>
              <span><MapPin size={14} /> {city}</span>
            </article>
          ))}
        </div>
      </section>

      {!isLoggedIn && (
        <section className="home-cta">
          <Users size={30} />
          <h2>Start with a profile that says what matters</h2>
          <p>Verified profiles, focused discovery, and real conversations are ready when you are.</p>
          <Link to="/register" className="btn btn-primary btn-lg">Join ShadiMatch</Link>
        </section>
      )}
    </div>
  );
};

export default Home;
