import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { matchService, messageService, premiumService, profileService } from '../services/api';
import './Likes.css';

function loadRazorpayCheckout() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Could not load payment gateway'));
    document.body.appendChild(script);
  });
}

const Likes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('likes');
  const [likes, setLikes] = useState([]);
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [views, setViews] = useState([]);
  const [plans, setPlans] = useState([]);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false, subscription: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    const loadConnections = async () => {
      try {
        setIsLoading(true);
        setConnectionError('');
        const [likesResponse, likedProfilesResponse, viewsResponse] = await Promise.allSettled([
          matchService.getLikes(),
          matchService.getLikedProfiles(),
          matchService.getViews(),
        ]);

        if (likesResponse.status === 'fulfilled') {
          setLikes(likesResponse.value.data);
        }
        if (likedProfilesResponse.status === 'fulfilled') {
          setLikedProfiles(likedProfilesResponse.value.data);
        }
        if (viewsResponse.status === 'fulfilled') {
          setViews(viewsResponse.value.data);
        }

        const failedResponse = [likesResponse, likedProfilesResponse, viewsResponse].find((item) => item.status === 'rejected');
        if (failedResponse) {
          setConnectionError(failedResponse.reason?.response?.data?.message || 'Some connection data could not load.');
        }
      } catch (error) {
        setConnectionError(error.response?.data?.message || 'Could not load connections.');
      } finally {
        setIsLoading(false);
      }
    };

    const loadPremium = async () => {
      try {
        const [plansResponse, premiumResponse] = await Promise.all([
          premiumService.getPlans(),
          premiumService.getStatus(),
        ]);
        setPlans(plansResponse.data);
        setPremiumStatus(premiumResponse.data);
      } catch (error) {
        setUpgradeMessage(error.response?.data?.message || 'Premium plans are not available yet.');
      }
    };

    loadConnections();
    loadPremium();
  }, []);

  const refreshPremiumStatus = async () => {
    const response = await premiumService.getStatus();
    setPremiumStatus(response.data);
  };

  const handlePremiumCheckout = async (planId) => {
    try {
      setIsUpgrading(true);
      setUpgradeMessage('');
      const response = await premiumService.checkout(planId);

      if (response.data.provider === 'demo') {
        setUpgradeMessage(response.data.message);
        await refreshPremiumStatus();
        return;
      }

      await loadRazorpayCheckout();

      const checkout = new window.Razorpay({
        key: response.data.keyId,
        amount: response.data.amount,
        currency: response.data.currency,
        name: response.data.name,
        description: response.data.description,
        order_id: response.data.orderId,
        prefill: response.data.prefill,
        handler: async (paymentResponse) => {
          await premiumService.verify(paymentResponse);
          setUpgradeMessage('Premium activated successfully.');
          await refreshPremiumStatus();
        },
        modal: {
          ondismiss: () => setUpgradeMessage('Payment cancelled.'),
        },
      });

      checkout.open();
    } catch (error) {
      setUpgradeMessage(error.response?.data?.message || error.message || 'Could not start premium upgrade.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const removeProfileFromLists = (id) => {
    setLikes((prev) => prev.filter((profile) => profile.id !== id));
    setLikedProfiles((prev) => prev.filter((profile) => profile.id !== id));
    setViews((prev) => prev.filter((profile) => profile.id !== id));
  };

  const handleLikeBack = async (id) => {
    try {
      const response = await matchService.like(id);
      alert(response.data.mutual ? 'It is a match! You can start chatting.' : 'Profile liked!');
      removeProfileFromLists(id);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not like this profile.');
    }
  };

  const handlePassProfile = async (id) => {
    try {
      await matchService.pass(id);
      removeProfileFromLists(id);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not pass this profile.');
    }
  };

  const handleMessageProfile = async (id) => {
    try {
      const response = await messageService.startConversation(id);
      navigate('/messages', { state: { conversationId: response.data.id } });
    } catch (error) {
      alert(error.response?.data?.message || 'Could not open chat.');
    }
  };

  const handleViewProfile = async (id) => {
    try {
      const response = await profileService.getProfile(id);
      const profile = response.data;
      alert(`${profile.name}, ${profile.age}\n${profile.location}\n${profile.bio || 'No bio yet.'}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not open profile.');
    }
  };

  const renderProfiles = (profiles) => (
    <div className="profiles-grid">
      {profiles.length ? profiles.map((profile) => (
        <div key={profile.id} className="like-card">
          <div className="like-image">
            <img src={profile.image} alt={profile.name} onClick={() => handleViewProfile(profile.id)} />
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
            <button className="action-btn pass" onClick={() => handlePassProfile(profile.id)}>✕</button>
            <button className="action-btn message" onClick={() => handleMessageProfile(profile.id)}>💬</button>
            <button className="action-btn like" onClick={() => handleLikeBack(profile.id)}>❤️</button>
          </div>
        </div>
      )) : (
        <div className="no-profiles inline-empty">
          <h3>No profiles yet</h3>
          <p>When someone interacts with your profile, their card will appear here.</p>
        </div>
      )}
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
          className={`tab ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          <Heart size={20} /> Profiles I Liked ({likedProfiles.length})
        </button>
        <button
          className={`tab ${activeTab === 'views' ? 'active' : ''}`}
          onClick={() => setActiveTab('views')}
        >
          <Eye size={20} /> Profile Views ({views.length})
        </button>
      </div>

      <div className="tab-content">
        {connectionError && <div className="alert alert-error">{connectionError}</div>}

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

        {!isLoading && activeTab === 'liked' && (
          <div>
            <h2>Profiles You Liked</h2>
            {renderProfiles(likedProfiles)}
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
      <div className="premium-section" id="premium">
        <div className="premium-card">
          <div className="premium-content">
            <span className="premium-badge">PREMIUM</span>
            <h3>{premiumStatus.isPremium ? 'Premium Active' : 'Unlock Full Features'}</h3>
            <p>
              {premiumStatus.isPremium
                ? `Your plan is active until ${new Date(premiumStatus.subscription.endsAt).toLocaleDateString()}.`
                : 'See who likes you, track profile visitors, get unlimited likes, and improve visibility.'}
            </p>
          </div>
          {premiumStatus.isPremium ? (
            <button className="btn btn-primary" disabled>Active</button>
          ) : (
            <div className="premium-plans">
              {plans.length ? (
                plans.map((plan) => (
                  <button
                    key={plan.id}
                    className="premium-plan-btn"
                    type="button"
                    disabled={isUpgrading}
                    onClick={() => handlePremiumCheckout(plan.id)}
                  >
                    <strong>{plan.name}</strong>
                    <span>Rs. {plan.priceInr} / {plan.durationDays} days</span>
                  </button>
                ))
              ) : (
                <button className="premium-plan-btn" type="button" disabled>
                  <strong>Premium Plan</strong>
                  <span>Loading Rs. 499 plan...</span>
                </button>
              )}
            </div>
          )}
        </div>
        {upgradeMessage && <p className="upgrade-message">{upgradeMessage}</p>}
      </div>
    </div>
  );
};

export default Likes;
