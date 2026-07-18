import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { matchService, messageService, profileService } from '../services/api';
import './ProfileDetail.css';

const fallbackImage = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&w=900';

const normalizeProfile = (data) => {
  const photoItems = Array.isArray(data.photoItems) && data.photoItems.length
    ? data.photoItems
    : Array.isArray(data.photos) && data.photos.length
      ? data.photos.map((url, index) => ({ id: index, url, isPrimary: index === 0 }))
      : data.image
        ? [{ id: 'primary', url: data.image, isPrimary: true }]
        : [{ id: 'fallback', url: fallbackImage, isPrimary: true }];

  const primaryPhoto = photoItems.find((photo) => photo.isPrimary) || photoItems[0];

  return {
    ...data,
    name: data.name || data.fullName || 'Member',
    image: primaryPhoto?.url || fallbackImage,
    photoItems,
    interests: Array.isArray(data.interests) ? data.interests : [],
  };
};

const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value && value !== 0) return null;

  return (
    <div className="profile-detail-row">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
};

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activePhoto, setActivePhoto] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await profileService.getProfile(id);
        const nextProfile = normalizeProfile(response.data);
        setProfile(nextProfile);
        setActivePhoto(nextProfile.image);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load profile details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  const profileTitle = useMemo(() => {
    if (!profile) return '';
    return [profile.name, profile.age].filter(Boolean).join(', ');
  }, [profile]);

  const handleLike = async () => {
    try {
      const response = await matchService.like(profile.id);
      alert(response.data.mutual ? 'It is a match! You can start chatting.' : 'Profile liked!');
    } catch (err) {
      if (err.response?.data?.code === 'LIKE_LIMIT_REACHED') {
        const shouldUpgrade = window.confirm(`${err.response.data.message}\n\nOpen Premium plan now?`);
        if (shouldUpgrade) navigate('/likes#premium');
        return;
      }
      alert(err.response?.data?.message || 'Could not like this profile.');
    }
  };

  const handlePass = async () => {
    try {
      await matchService.pass(profile.id);
      navigate('/browse');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not pass this profile.');
    }
  };

  const handleMessage = async () => {
    try {
      const response = await messageService.startConversation(profile.id);
      navigate('/messages', { state: { conversationId: response.data.id } });
    } catch (err) {
      alert(err.response?.data?.message || 'Could not open chat.');
    }
  };

  if (isLoading) {
    return (
      <div className="profile-detail-page">
        <div className="profile-detail-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-detail-page">
        <button className="profile-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className="profile-detail-error">{error || 'Profile not found.'}</div>
      </div>
    );
  }

  return (
    <div className="profile-detail-page">
      <button className="profile-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="profile-detail-shell">
        <section className="profile-gallery">
          <div className="profile-main-photo">
            <img src={activePhoto || profile.image} alt={profile.name} />
            {profile.verified && (
              <span className="profile-detail-verified">
                <ShieldCheck size={16} /> Verified
              </span>
            )}
            {profile.isPremium && <span className="profile-detail-premium">Premium</span>}
          </div>

          <div className="profile-thumbnails">
            {profile.photoItems.map((photo) => (
              <button
                key={photo.id || photo.url}
                type="button"
                className={`profile-thumb ${activePhoto === photo.url ? 'active' : ''}`}
                onClick={() => setActivePhoto(photo.url)}
                aria-label="View profile photo"
              >
                <img src={photo.url} alt={profile.name} />
              </button>
            ))}
          </div>
        </section>

        <section className="profile-detail-content">
          <div className="profile-detail-heading">
            <div>
              <h1>{profileTitle}</h1>
              <p>
                <MapPin size={18} /> {profile.location || 'Location not added'}
              </p>
            </div>
          </div>

          <div className="profile-detail-actions">
            <button className="detail-action pass" onClick={handlePass}>
              <X size={20} /> Pass
            </button>
            <button className="detail-action message" onClick={handleMessage}>
              <MessageCircle size={20} /> Message
            </button>
            <button className="detail-action like" onClick={handleLike}>
              <Heart size={20} /> Like
            </button>
          </div>

          <div className="profile-detail-section">
            <h2><UserRound size={20} /> Basic Details</h2>
            <div className="profile-detail-grid">
              <DetailRow icon={UserRound} label="Gender" value={profile.gender} />
              <DetailRow icon={Heart} label="Looking for" value={profile.lookingFor} />
              <DetailRow icon={Ruler} label="Height" value={profile.height} />
              <DetailRow icon={MapPin} label="Location" value={profile.location} />
            </div>
          </div>

          <div className="profile-detail-section">
            <h2><Sparkles size={20} /> Community</h2>
            <div className="profile-detail-grid">
              <DetailRow icon={Sparkles} label="Religion" value={profile.religion} />
              <DetailRow icon={Sparkles} label="Caste" value={profile.caste} />
              <DetailRow icon={Sparkles} label="Mother tongue" value={profile.motherTongue} />
            </div>
          </div>

          <div className="profile-detail-section">
            <h2><Briefcase size={20} /> Education & Career</h2>
            <div className="profile-detail-grid">
              <DetailRow icon={GraduationCap} label="Education" value={profile.education} />
              <DetailRow icon={Briefcase} label="Occupation" value={profile.occupation} />
            </div>
          </div>

          <div className="profile-detail-section">
            <h2>About</h2>
            <p className="profile-detail-bio">{profile.bio || 'No bio added yet.'}</p>
          </div>

          {!!profile.interests.length && (
            <div className="profile-detail-section">
              <h2>Interests</h2>
              <div className="profile-detail-interests">
                {profile.interests.map((interest, index) => (
                  <span key={`${interest}-${index}`}>{interest}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfileDetail;
