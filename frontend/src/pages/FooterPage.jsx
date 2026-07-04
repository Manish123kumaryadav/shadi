import React, { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Briefcase, CheckCircle, HelpCircle, Mail, Newspaper, Shield, Sparkles } from 'lucide-react';
import './FooterPage.css';

const pages = {
  about: {
    title: 'About ShadiMatch',
    subtitle: 'A safer, simpler place to meet marriage-minded people.',
    icon: Sparkles,
    type: 'milestones',
    items: ['Verified profiles', 'Preference-based matching', 'Realtime chat', 'Privacy-first controls'],
  },
  blog: {
    title: 'Blog',
    subtitle: 'Browse practical relationship and matrimony advice.',
    icon: Newspaper,
    type: 'blog',
    items: [
      { tag: 'Profiles', title: 'How to write a profile that feels real' },
      { tag: 'Safety', title: 'Questions to ask before meeting someone' },
      { tag: 'Family', title: 'Balancing family input and personal choice' },
    ],
  },
  careers: {
    title: 'Careers',
    subtitle: 'Help build a thoughtful matchmaking experience.',
    icon: Briefcase,
    type: 'careers',
    items: ['Frontend Developer', 'Customer Success Associate', 'Trust & Safety Analyst'],
  },
  help: {
    title: 'Help Center',
    subtitle: 'Find quick answers for common account and matching questions.',
    icon: HelpCircle,
    type: 'accordion',
    items: [
      ['How do I get matches?', 'Complete your profile and open Browse Profiles to see compatible users.'],
      ['How does OTP login work?', 'Enter your registered mobile number, request OTP, then verify it to log in.'],
      ['Can I message anyone?', 'You can start conversations from matched profiles.'],
    ],
  },
  contact: {
    title: 'Contact Us',
    subtitle: 'Send a support request and our team will review it.',
    icon: Mail,
    type: 'contact',
  },
  faq: {
    title: 'FAQ',
    subtitle: 'Tap a question to reveal the answer.',
    icon: HelpCircle,
    type: 'accordion',
    items: [
      ['Is ShadiMatch free?', 'Basic registration, browsing, and test messaging flows are available in this demo.'],
      ['Are profiles verified?', 'Seed profiles are marked verified; production verification can be extended.'],
      ['Do offline users get notified?', 'Yes, the backend sends or logs an email notification for offline recipients.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Control what you share and understand how data is used.',
    icon: Shield,
    type: 'checklist',
    items: ['Keep mobile OTP private', 'Use accurate profile details', 'Report suspicious messages', 'Log out on shared devices'],
  },
  terms: {
    title: 'Terms & Conditions',
    subtitle: 'Review the basic usage rules for this demo platform.',
    icon: CheckCircle,
    type: 'terms',
    items: ['Use respectful communication', 'Do not create fake profiles', 'Do not share abusive content', 'Follow applicable laws'],
  },
  safety: {
    title: 'Safety Tips',
    subtitle: 'Build trust carefully before sharing personal details.',
    icon: Shield,
    type: 'checklist',
    items: ['Verify identity before meeting', 'Meet in public first', 'Tell family before visits', 'Never send money to strangers'],
  },
};

function FooterPage() {
  const { slug } = useParams();
  const page = pages[slug];
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!page?.items) return [];
    return page.items.filter((item) => {
      const text = Array.isArray(item) ? item.join(' ') : typeof item === 'string' ? item : `${item.tag} ${item.title}`;
      return text.toLowerCase().includes(query.toLowerCase());
    });
  }, [page, query]);

  if (!page) return <Navigate to="/" replace />;

  const Icon = page.icon;

  const toggleSelected = (item) => {
    setSelected((prev) => (
      prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]
    ));
  };

  const renderInteractiveContent = () => {
    if (page.type === 'contact') {
      return (
        <form
          className="footer-form"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          {submitted && <div className="alert alert-success">Thanks, {form.name || 'friend'}! Your message is ready for support review.</div>}
          <input name="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input name="email" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea name="message" rows="5" placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button className="btn btn-primary" type="submit">Send Request</button>
        </form>
      );
    }

    if (page.type === 'accordion') {
      return (
        <div className="footer-accordion">
          {filteredItems.map(([question, answer], index) => (
            <button key={question} className={`accordion-row ${activeIndex === index ? 'open' : ''}`} onClick={() => setActiveIndex(index)}>
              <span>{question}</span>
              {activeIndex === index && <p>{answer}</p>}
            </button>
          ))}
        </div>
      );
    }

    if (page.type === 'blog') {
      return (
        <div className="footer-grid">
          {filteredItems.map((item) => (
            <button key={item.title} className="footer-card" onClick={() => setActiveIndex(page.items.indexOf(item))}>
              <span>{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{activeIndex === page.items.indexOf(item) ? 'Selected for reading.' : 'Tap to preview.'}</p>
            </button>
          ))}
        </div>
      );
    }

    if (page.type === 'careers') {
      return (
        <div className="footer-grid">
          {filteredItems.map((role) => (
            <button key={role} className={`footer-card ${selected.includes(role) ? 'selected' : ''}`} onClick={() => toggleSelected(role)}>
              <h3>{role}</h3>
              <p>{selected.includes(role) ? 'Saved to interested roles.' : 'Tap to save this role.'}</p>
            </button>
          ))}
        </div>
      );
    }

    if (page.type === 'checklist' || page.type === 'terms') {
      return (
        <div className="footer-checklist">
          {filteredItems.map((item) => (
            <label key={item} className={selected.includes(item) ? 'checked' : ''}>
              <input type="checkbox" checked={selected.includes(item)} onChange={() => toggleSelected(item)} />
              {item}
            </label>
          ))}
          <p>{selected.length} of {page.items.length} selected</p>
        </div>
      );
    }

    return (
      <div className="footer-grid">
        {filteredItems.map((item) => (
          <button key={item} className={`footer-card ${selected.includes(item) ? 'selected' : ''}`} onClick={() => toggleSelected(item)}>
            <h3>{item}</h3>
            <p>{selected.includes(item) ? 'Added to your focus list.' : 'Tap to highlight.'}</p>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="footer-page">
      <section className="footer-page-hero">
        <Icon size={42} />
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </section>

      {page.type !== 'contact' && (
        <div className="footer-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this page..." />
        </div>
      )}

      <section className="footer-page-content">
        {renderInteractiveContent()}
      </section>

      <div className="footer-page-actions">
        <Link to="/" className="btn btn-secondary">Back Home</Link>
        <Link to="/register" className="btn btn-primary">Create Profile</Link>
      </div>
    </div>
  );
}

export default FooterPage;
