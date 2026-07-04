import React, { useEffect, useState } from 'react';
import { Heart, Eye } from 'lucide-react';
import { matchService } from '../services/api';
import './Likes.css';

const Likes = () => {
  const [activeTab, setActiveTab] = useState('likes');
  const [likes, setLikes] = useState([]);
  const [views, setViews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConnections = async () => {
      try {
        setIsLoading(true);
        const [likesResponse, viewsResponse] = await Promise.all([
          matchService.getLikes(),
          matchService.getViews(),
        ]);
        setLikes(likesResponse.data);
        setViews(viewsResponse.data);
      } finally {
        setIsLoading(false);
      }
    };

    loadConnections();
  }, []);

  const renderProfiles = (profiles) => (
    <div className="profiles-grid">
      {profiles.map((profile) => (
        <div key={profile.id} className="like-card">
          <div className="like-image">
            <img src={profile.image} alt={profile.name} />
            {profile.verified && <div className="verified-badge">✓ Verified</div>}
          </div>

          <div className="like-info">
            <h3>{profile.name}, {profile.age}</h3>
            <p className="location">📍 {profile.location}</p>
            <p className="bio">{profile.bio ? `${profile.bio.substring(0, 60)}...` : 'No bio yet.'}</p>

            <div className="interests-mini">
              {(profile.interests || []).slice(0, 2).map((interest, idx) => (
                <span key={idx} className="interest-badge">{interest}</span>
              ))}
            </div>
          </div>

          <div className="like-actions">
            <button className="action-btn pass">✕</button>
            <button className="action-btn message">💬</button>
            <button className="action-btn like">❤️</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="likes-container">
      <div className="likes-header">
        <h1>❤️ Connections</h1>
        <p>People who liked you and profiles you liked</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          <Heart size={20} /> Likes Received ({likes.length})
        </button>
        <button
          className={`tab ${activeTab === 'views' ? 'active' : ''}`}
          onClick={() => setActiveTab('views')}
        >
          <Eye size={20} /> Profile Views ({views.length})
        </button>
      </div>

      <div className="tab-content">
        {isLoading && (
          <div className="no-profiles">
            <div className="spinner"></div>
            <p>Loading connections...</p>
          </div>
        )}

        {!isLoading && activeTab === 'likes' && (
          <div>
            <h2>People Who Liked You</h2>
            {renderProfiles(likes)}
          </div>
        )}

        {!isLoading && activeTab === 'views' && (
          <div>
            <h2>Who Viewed Your Profile</h2>
            {renderProfiles(views)}
          </div>
        )}
      </div>

      {/* Premium Upgrade */}
      <div className="premium-section">
        <div className="premium-card">
          <div className="premium-content">
            <span className="premium-badge">✨ PREMIUM</span>
            <h3>Unlock Full Features</h3>
            <p>See who likes you, get unlimited likes, and much more!</p>
          </div>
          <button className="btn btn-primary">Upgrade to Premium</button>
        </div>
      </div>
    </div>
  );
};

export default Likes;
