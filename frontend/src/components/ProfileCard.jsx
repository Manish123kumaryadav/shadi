import React from 'react';
import { Heart, X, MessageCircle } from 'lucide-react';
import './ProfileCard.css';

const ProfileCard = ({ profile, onLike, onPass, onMessage, onViewProfile }) => {
  return (
    <div className="profile-card">
      <div className="profile-image-container">
        <img
          src={profile.image}
          alt={profile.name}
          className="profile-image"
          onClick={() => onViewProfile(profile.id)}
        />
        {profile.verified && (
          <div className="verified-badge">
            <span>✓ Verified</span>
          </div>
        )}
        <div className="online-status"></div>
      </div>

      <div className="profile-info">
        <h3 className="profile-name">
          {profile.name}, {profile.age}
        </h3>
        <p className="profile-location">📍 {profile.location}</p>

        <div className="profile-details">
          <span className="detail-badge">{profile.education}</span>
          <span className="detail-badge">{profile.occupation}</span>
          <span className="detail-badge">{profile.religion}</span>
        </div>

        <p className="profile-bio">{profile.bio}</p>

        <div className="interests">
          {profile.interests.slice(0, 3).map((interest, idx) => (
            <span key={idx} className="interest-tag">
              {interest}
            </span>
          ))}
        </div>
      </div>

      <div className="profile-actions">
        <button
          className="action-btn pass-btn"
          onClick={() => onPass(profile.id)}
          title="Pass"
        >
          <X size={24} />
        </button>

        <button
          className="action-btn message-btn"
          onClick={() => onMessage(profile.id)}
          title="Message"
        >
          <MessageCircle size={24} />
        </button>

        <button
          className="action-btn like-btn"
          onClick={() => onLike(profile.id)}
          title="Like"
        >
          <Heart size={24} />
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
