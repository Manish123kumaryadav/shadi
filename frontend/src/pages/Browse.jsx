import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import { ChevronLeft, ChevronRight, Filter, Zap } from 'lucide-react';
import { matchService, messageService, profileService } from '../services/api';
import './Browse.css';

const PROFILE_FETCH_LIMIT = 500;
const PROFILES_PER_SLIDE = 10;

const Browse = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filters, setFilters] = useState({
    ageMin: '',
    ageMax: '',
    location: '',
    religion: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ likes: 0, views: 0 });

  const loadStats = async () => {
    try {
      const [likesResponse, viewsResponse] = await Promise.all([
        matchService.getLikes(),
        matchService.getViews(),
      ]);
      setStats({
        likes: likesResponse.data.length,
        views: viewsResponse.data.length,
      });
    } catch (err) {
      setStats({ likes: 0, views: 0 });
    }
  };

  const loadMatches = async (activeFilters = filters) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await matchService.getMatches({
        ...activeFilters,
        compatible: true,
        limit: PROFILE_FETCH_LIMIT,
      });
      setProfiles(response.data);
      setCurrentSlide(0);
      loadStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load matches.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleLike = async (id) => {
    try {
      const response = await matchService.like(id);
      alert(response.data.mutual ? 'It is a match! You can start chatting.' : 'Profile liked!');
      setProfiles((prev) => prev.filter((profile) => profile.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not like this profile.');
    }
  };

  const handlePass = async (id) => {
    try {
      await matchService.pass(id);
      setProfiles((prev) => prev.filter((profile) => profile.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not pass this profile.');
    }
  };

  const handleMessage = async (id) => {
    try {
      const response = await messageService.startConversation(id);
      navigate('/messages', { state: { conversationId: response.data.id } });
    } catch (err) {
      alert(err.response?.data?.message || 'Could not open chat.');
    }
  };

  const handleViewProfile = async (id) => {
    try {
      const response = await profileService.getProfile(id);
      const profile = response.data;
      alert(`${profile.name}, ${profile.age}\n${profile.location}\n${profile.bio || 'No bio yet.'}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not open profile.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    loadMatches(filters);
    setShowFilters(false);
  };

  const totalSlides = Math.max(1, Math.ceil(profiles.length / PROFILES_PER_SLIDE));
  const slideStart = currentSlide * PROFILES_PER_SLIDE;
  const visibleProfiles = profiles.slice(slideStart, slideStart + PROFILES_PER_SLIDE);

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  };

  useEffect(() => {
    if (currentSlide > 0 && slideStart >= profiles.length) {
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    }
  }, [currentSlide, profiles.length, slideStart]);

  if (isLoading) {
    return (
      <div className="browse-container">
        <div className="no-profiles">
          <div className="spinner"></div>
          <p>Finding compatible matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="browse-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!profiles.length) {
    return (
      <div className="browse-container">
        <div className="no-profiles">
          <h2>No More Profiles</h2>
          <p>You've viewed all available profiles. Check back later!</p>
          <button onClick={() => loadMatches()} className="btn btn-primary">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-container">
      <div className="browse-header">
        <h1>Browse Profiles</h1>
        <button
          className="filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} /> Filters
        </button>
      </div>

      {/* Filters Sidebar */}
      {showFilters && (
        <div className="filters-panel">
          <h3>Filter Profiles</h3>

          <div className="filter-group">
            <label>Age Range</label>
            <div className="age-range">
              <input
                type="number"
                name="ageMin"
                min="18"
                max="60"
                placeholder="Min"
                value={filters.ageMin}
                onChange={handleFilterChange}
              />
              <input
                type="number"
                name="ageMax"
                min="18"
                max="60"
                placeholder="Max"
                value={filters.ageMax}
                onChange={handleFilterChange}
              />
              <span>
                {filters.ageMin || '18'} - {filters.ageMax || '60'} years
              </span>
            </div>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="Search city..."
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Religion</label>
            <select name="religion" value={filters.religion} onChange={handleFilterChange}>
              <option value="">All Religions</option>
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim</option>
              <option value="Christian">Christian</option>
              <option value="Sikh">Sikh</option>
              <option value="Buddhist">Buddhist</option>
              <option value="Jain">Jain</option>
            </select>
          </div>

          <button onClick={applyFilters} className="btn btn-primary btn-block">
            Apply Filters
          </button>
        </div>
      )}

      {/* Profile Display */}
      <div className="browse-content">
        <div className="profiles-panel">
          <div className="slide-toolbar">
            <button
              className="slide-btn"
              onClick={goToPreviousSlide}
              disabled={currentSlide === 0}
              title="Previous profiles"
            >
              <ChevronLeft size={20} />
            </button>

            <div>
              <strong>Showing {slideStart + 1}-{Math.min(slideStart + visibleProfiles.length, profiles.length)}</strong>
              <span>of {profiles.length} profiles</span>
            </div>

            <button
              className="slide-btn"
              onClick={goToNextSlide}
              disabled={currentSlide >= totalSlides - 1}
              title="Next profiles"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="profiles-grid">
            {visibleProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onLike={handleLike}
                onPass={handlePass}
                onMessage={handleMessage}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-cards">
          <div className="stat-card">
            <Zap size={24} />
            <div>
              <h4>SuperLikes Left</h4>
              <p>5 of 5</p>
            </div>
          </div>

          <div className="stat-card">
            <span>❤️</span>
            <div>
              <h4>Total Likes</h4>
              <p>{stats.likes}</p>
            </div>
          </div>

          <div className="stat-card">
            <span>👁️</span>
            <div>
              <h4>Profile Views</h4>
              <p>{stats.views}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Counter */}
      <div className="profile-counter">
        Slide {currentSlide + 1} of {totalSlides}
      </div>
    </div>
  );
};

export default Browse;
