import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Heart, ShieldCheck, Upload } from 'lucide-react';
import { authService } from '../services/api';
import './Auth.css';

const profileCreators = ['Self', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Relative'];
const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];
const motherTongues = ['Hindi', 'Marathi', 'Punjabi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'English', 'Other'];
const educationOptions = ['High School', 'Graduate', 'Post Graduate', 'Doctorate', 'Diploma', 'Other'];
const heightOptions = [
  '4 ft 10 in',
  '4 ft 11 in',
  '5 ft 0 in',
  '5 ft 1 in',
  '5 ft 2 in',
  '5 ft 3 in',
  '5 ft 4 in',
  '5 ft 5 in',
  '5 ft 6 in',
  '5 ft 7 in',
  '5 ft 8 in',
  '5 ft 9 in',
  '5 ft 10 in',
  '5 ft 11 in',
  '6 ft 0 in',
  '6 ft 1 in',
  '6 ft 2 in',
];

const steps = ['About', 'Community', 'Account'];
const defaultProfilePhotos = {
  male: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=400',
  female: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&w=400',
};

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    profileFor: 'Self',
    fullName: '',
    gender: 'female',
    dob: '',
    religion: '',
    caste: '',
    motherTongue: '',
    location: '',
    education: '',
    occupation: '',
    height: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    photoUrl: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completion = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '', form: '' }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photoUrl: 'Please select an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photoUrl: 'Choose an image under 5 MB' }));
      return;
    }

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const avatarSize = 32;
      const sourceSize = Math.min(image.width, image.height);
      const sourceX = Math.max(0, Math.round((image.width - sourceSize) / 2));
      const sourceY = Math.max(0, Math.round((image.height - sourceSize) / 2));
      canvas.width = avatarSize;
      canvas.height = avatarSize;

      const context = canvas.getContext('2d');
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        avatarSize,
        avatarSize,
      );
      const photoUrl = canvas.toDataURL('image/jpeg', 0.58);

      setFormData((prev) => ({
        ...prev,
        photoUrl,
      }));
      setErrors((prev) => ({ ...prev, photoUrl: '', form: '' }));
      URL.revokeObjectURL(image.src);
    };
    image.src = URL.createObjectURL(file);
  };

  const validateStep = (targetStep = step) => {
    const nextErrors = {};

    if (targetStep === 0) {
      if (!formData.profileFor) nextErrors.profileFor = 'Select who this profile is for';
      if (!formData.fullName.trim()) nextErrors.fullName = 'Name is required';
      if (!formData.gender) nextErrors.gender = 'Gender is required';
      if (!formData.dob) nextErrors.dob = 'Date of birth is required';
    }

    if (targetStep === 1) {
      if (!formData.religion) nextErrors.religion = 'Religion is required';
      if (!formData.motherTongue) nextErrors.motherTongue = 'Mother tongue is required';
      if (!formData.location.trim()) nextErrors.location = 'City is required';
    }

    if (targetStep === 2) {
      if (!formData.email.trim()) nextErrors.email = 'Email is required';
      if (!formData.mobile.trim()) nextErrors.mobile = 'Mobile number is required';
      if (formData.mobile.replace(/\D/g, '').length < 10) {
        nextErrors.mobile = 'Enter a valid mobile number';
      }
      if (!formData.password) nextErrors.password = 'Password is required';
      if (formData.password.length < 8) nextErrors.password = 'Use at least 8 characters';
      if (formData.password !== formData.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.acceptTerms) nextErrors.acceptTerms = 'Please accept terms to continue';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    try {
      setIsSubmitting(true);
      await authService.register({
        ...formData,
        lookingFor: formData.gender === 'female' ? 'male' : 'female',
      });

      alert('Registration successful! Please login with OTP.');
      navigate('/login', { state: { mobile: formData.mobile } });
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || 'Registration failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container register-page">
      <div className="register-shell">
        <aside className="register-intro">
          <Link to="/" className="register-logo">
            <span>ShaadiMatch</span>
            <Heart size={16} fill="currentColor" />
          </Link>
          <h1>Create your matrimony profile</h1>
          <p>Millions of members use guided profile details to find relevant, serious matches.</p>

          <div className="register-points">
            <span><ShieldCheck size={18} /> Verified mobile login</span>
            <span><CheckCircle2 size={18} /> Community based matching</span>
            <span><CheckCircle2 size={18} /> Privacy-first conversations</span>
          </div>
        </aside>

        <div className="register-card">
          <div className="register-progress">
            <div>
              <span>Step {step + 1} of {steps.length}</span>
              <strong>{steps[step]}</strong>
            </div>
            <small>{completion}% complete</small>
          </div>
          <div className="progress-track">
            <div style={{ width: `${completion}%` }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            {errors.form && <div className="alert alert-error">{errors.form}</div>}

            {step === 0 && (
              <div className="register-step">
                <h2>Let's begin with basic details</h2>
                <p>This helps us show matches that fit the right profile.</p>

                <div className="form-group">
                  <label>Profile created for *</label>
                  <select name="profileFor" value={formData.profileFor} onChange={handleChange}>
                    {profileCreators.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  {errors.profileFor && <span className="error-text">{errors.profileFor}</span>}
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? 'input-error' : ''}
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                <div className="profile-photo-upload">
                  <img
                    src={formData.photoUrl || defaultProfilePhotos[formData.gender]}
                    alt={`${formData.gender === 'male' ? 'His' : 'Her'} profile preview`}
                  />
                  <label>
                    <Upload size={18} />
                    <span>Upload Profile Picture</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} />
                  </label>
                  {errors.photoUrl && <span className="error-text">{errors.photoUrl}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Gender *</label>
                    <div className="segmented-field">
                      <label className={formData.gender === 'female' ? 'active' : ''}>
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={handleChange}
                        />
                        Female
                      </label>
                      <label className={formData.gender === 'male' ? 'active' : ''}>
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={handleChange}
                        />
                        Male
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className={errors.dob ? 'input-error' : ''}
                    />
                    {errors.dob && <span className="error-text">{errors.dob}</span>}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="register-step">
                <h2>Add community and lifestyle</h2>
                <p>Shaadi-style registration uses these details to make discovery more relevant.</p>

                <div className="form-row">
                  <div className="form-group">
                    <label>Religion *</label>
                    <select
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      className={errors.religion ? 'input-error' : ''}
                    >
                      <option value="">Select Religion</option>
                      {religions.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                    {errors.religion && <span className="error-text">{errors.religion}</span>}
                  </div>

                  <div className="form-group">
                    <label>Mother Tongue *</label>
                    <select
                      name="motherTongue"
                      value={formData.motherTongue}
                      onChange={handleChange}
                      className={errors.motherTongue ? 'input-error' : ''}
                    >
                      <option value="">Select Mother Tongue</option>
                      {motherTongues.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                    {errors.motherTongue && <span className="error-text">{errors.motherTongue}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Caste / Community</label>
                    <input
                      type="text"
                      name="caste"
                      placeholder="Optional"
                      value={formData.caste}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="Current city"
                      value={formData.location}
                      onChange={handleChange}
                      className={errors.location ? 'input-error' : ''}
                    />
                    {errors.location && <span className="error-text">{errors.location}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Education</label>
                    <select name="education" value={formData.education} onChange={handleChange}>
                      <option value="">Select Education</option>
                      {educationOptions.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      placeholder="e.g. Software Engineer"
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Height</label>
                  <select name="height" value={formData.height} onChange={handleChange}>
                    <option value="">Select Height</option>
                    {heightOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="register-step">
                <h2>Secure your account</h2>
                <p>Your mobile number will be used for OTP login after registration.</p>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="Enter mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={errors.mobile ? 'input-error' : ''}
                  />
                  {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'input-error' : ''}
                    />
                    {errors.password && <span className="error-text">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? 'input-error' : ''}
                    />
                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                  </div>
                </div>

                <div className="form-group checkbox register-terms">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                  />
                  <label>I agree to the Terms &amp; Conditions and Privacy Policy *</label>
                  {errors.acceptTerms && <span className="error-text">{errors.acceptTerms}</span>}
                </div>
              </div>
            )}

            <div className="register-actions">
              {step > 0 ? (
                <button type="button" className="step-btn secondary" onClick={handleBack}>
                  <ArrowLeft size={18} /> Back
                </button>
              ) : (
                <Link to="/" className="step-btn secondary">
                  <ArrowLeft size={18} /> Home
                </Link>
              )}

              {step < steps.length - 1 ? (
                <button type="button" className="step-btn primary" onClick={handleNext}>
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button type="submit" className="step-btn primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Profile'}
                </button>
              )}
            </div>
          </form>

          <p className="auth-footer">
            Already registered? <Link to="/login">Login with OTP</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
