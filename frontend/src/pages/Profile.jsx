import React, { useEffect, useState } from 'react';
import { Upload, Save, Mail, MapPin, Heart } from 'lucide-react';
import { profileService } from '../services/api';
import './Profile.css';

const resizeProfilePhoto = (file) => new Promise((resolve, reject) => {
  if (!file.type.startsWith('image/')) {
    reject(new Error('Only image files are allowed'));
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const maxSize = 700;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not prepare image'));
            return;
          }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.82,
      );
    };
    image.onerror = () => reject(new Error('Could not read image'));
    image.src = reader.result;
  };
  reader.onerror = () => reject(new Error('Could not read image'));
  reader.readAsDataURL(file);
});

const Profile = () => {
  const defaultProfile = {
    fullName: 'Your Name',
    email: 'your.email@example.com',
    age: 28,
    location: 'Mumbai, India',
    religion: 'Hindu',
    caste: 'Brahmin',
    education: 'MBA',
    occupation: 'Software Engineer',
    height: '6\'0"',
    bio: 'Passionate about technology and travel. Looking for someone who values family and personal growth.',
    interests: ['Travel', 'Technology', 'Cooking', 'Movies'],
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=400',
      'https://images.unsplash.com/photo-1500645745-7cf5b9dbab5e?ixlib=rb-4.0.3&w=400',
    ],
  };

  const [profile, setProfile] = useState(defaultProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [error, setError] = useState('');

  const normalizeProfile = (data) => {
    const photoItems = Array.isArray(data.photoItems) && data.photoItems.length
      ? data.photoItems
      : Array.isArray(data.photos) && data.photos.length
        ? data.photos.map((url, idx) => ({ id: null, url, isPrimary: idx === 0 }))
        : data.image
          ? [{ id: null, url: data.image, isPrimary: true }]
          : [];
    const photos = photoItems.length
      ? photoItems.map((photo) => photo.url)
      : Array.isArray(data.photos) && data.photos.length
        ? data.photos
      : data.image
        ? [data.image]
        : defaultProfile.photos;

    return {
      ...defaultProfile,
      ...data,
      fullName: data.name || data.fullName || defaultProfile.fullName,
      photos,
      photoItems,
    };
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const response = await profileService.getMe();
        const nextProfile = normalizeProfile(response.data);
        setProfile(nextProfile);
        setEditData(nextProfile);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await profileService.updateMe({
        ...editData,
        interests: Array.isArray(editData.interests)
          ? editData.interests
          : String(editData.interests).split(',').map((item) => item.trim()).filter(Boolean),
      });
      const nextProfile = normalizeProfile(response.data);
      setProfile(nextProfile);
      setEditData(nextProfile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update profile.');
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!profile.id) {
      alert('Profile is still loading. Please try again.');
      event.target.value = '';
      return;
    }

    try {
      setIsPhotoUploading(true);
      const preparedFile = await resizeProfilePhoto(file);
      const formData = new FormData();
      formData.append('photo', preparedFile);

      const response = await profileService.uploadPhoto(profile.id, formData);
      const nextProfile = normalizeProfile(response.data);
      setProfile(nextProfile);
      setEditData(nextProfile);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Could not upload profile photo.');
    } finally {
      setIsPhotoUploading(false);
      event.target.value = '';
    }
  };

  const handlePhotoDelete = async (photoId) => {
    if (!photoId) return;

    try {
      const response = await profileService.deletePhoto(profile.id, photoId);
      const nextProfile = normalizeProfile(response.data);
      setProfile(nextProfile);
      setEditData(nextProfile);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete photo.');
    }
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <h1>My Profile</h1>
            <p>Manage your personal information</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        <div className="profile-grid">
          {/* Photos Section */}
          <div className="photos-section">
            <h2>📸 My Photos</h2>
            <div className="photos-grid">
              {(profile.photoItems?.length
                ? profile.photoItems
                : (profile.photos || []).map((url, idx) => ({ id: null, url, isPrimary: idx === 0 }))
              ).map((photo, idx) => (
                <div key={photo.id || photo.url || idx} className="photo-item">
                  <img src={photo.url} alt={`Photo ${idx + 1}`} />
                  {photo.isPrimary && <span className="primary-photo-badge">Primary</span>}
                  {photo.id && (
                    <button
                      type="button"
                      className="delete-photo-btn"
                      onClick={() => handlePhotoDelete(photo.id)}
                      aria-label="Delete photo"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <label className={`add-photo-btn ${isPhotoUploading ? 'uploading' : ''}`}>
                <Upload size={40} />
                <p>{isPhotoUploading ? 'Uploading...' : 'Add Photo'}</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isPhotoUploading}
                />
              </label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="info-section">
            <h2>👤 Basic Information</h2>
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={editData.fullName}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={editData.age}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Height</label>
                    <input
                      type="text"
                      name="height"
                      value={editData.height}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editData.location}
                    onChange={handleEditChange}
                  />
                </div>

                <button className="btn btn-primary btn-block" onClick={handleSave}>
                  <Save size={18} /> Save Changes
                </button>
              </div>
            ) : (
              <div className="info-display">
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{profile.fullName}</span>
                </div>
                <div className="info-item">
                  <span className="label">Age:</span>
                  <span className="value">{profile.age}</span>
                </div>
                <div className="info-item">
                  <span className="label">Height:</span>
                  <span className="value">{profile.height}</span>
                </div>
                <div className="info-item">
                  <MapPin size={18} className="icon" />
                  <span className="value">{profile.location}</span>
                </div>
              </div>
            )}
          </div>

          {/* Professional Info */}
          <div className="info-section">
            <h2>💼 Professional Information</h2>
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Education</label>
                  <input
                    type="text"
                    name="education"
                    value={editData.education}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label>Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={editData.occupation}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
            ) : (
              <div className="info-display">
                <div className="info-item">
                  <span className="label">Education:</span>
                  <span className="value">{profile.education}</span>
                </div>
                <div className="info-item">
                  <span className="label">Occupation:</span>
                  <span className="value">{profile.occupation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Religious Info */}
          <div className="info-section">
            <h2>☪️ Religious Information</h2>
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Religion</label>
                  <input
                    type="text"
                    name="religion"
                    value={editData.religion}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label>Caste</label>
                  <input
                    type="text"
                    name="caste"
                    value={editData.caste}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
            ) : (
              <div className="info-display">
                <div className="info-item">
                  <span className="label">Religion:</span>
                  <span className="value">{profile.religion}</span>
                </div>
                <div className="info-item">
                  <span className="label">Caste:</span>
                  <span className="value">{profile.caste}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bio & Interests */}
          <div className="info-section full-width">
            <h2>✨ Bio & Interests</h2>
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={editData.bio}
                    onChange={handleEditChange}
                    rows="4"
                  />
                </div>
              </div>
            ) : (
              <div className="bio-display">
                <p>{profile.bio}</p>
                <div className="interests">
                  {(profile.interests || []).map((interest, idx) => (
                    <span key={idx} className="interest-tag">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="account-section">
          <h2>⚙️ Account Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <Mail size={24} />
              <div>
                <h4>Email Address</h4>
                <p>{profile.email}</p>
              </div>
              <button className="small-btn">Change</button>
            </div>

            <div className="setting-item">
              <span className="icon">🔒</span>
              <div>
                <h4>Password</h4>
                <p>Last changed 3 months ago</p>
              </div>
              <button className="small-btn">Change</button>
            </div>

            <div className="setting-item">
              <span className="icon">🔔</span>
              <div>
                <h4>Notifications</h4>
                <p>Manage notification preferences</p>
              </div>
              <button className="small-btn">Manage</button>
            </div>

            <div className="setting-item">
              <span className="icon">🚫</span>
              <div>
                <h4>Delete Account</h4>
                <p>Permanently delete your profile</p>
              </div>
              <button className="small-btn danger">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
