import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './Auth.css';

const Register = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    gender: 'female',
    dob: '',
    religion: '',
    caste: '',
    motherTongue: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (formData.mobile.replace(/\D/g, '').length < 10) {
      newErrors.mobile = 'Enter a valid mobile number';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.religion) newErrors.religion = 'Religion is required';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setIsSubmitting(true);
        await authService.register({
          ...formData,
          lookingFor: formData.gender,
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
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Your Profile</h1>
        <p>Join thousands of singles looking for love</p>

        <form onSubmit={handleSubmit}>
          {errors.form && <div className="alert alert-error">{errors.form}</div>}
          {/* Full Name */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'input-error' : ''}
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          {/* Email */}
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
              placeholder="Enter registered mobile number"
              value={formData.mobile}
              onChange={handleChange}
              className={errors.mobile ? 'input-error' : ''}
            />
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>

          {/* Password */}
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

          {/* Gender */}
          <div className="form-group">
            <label>I am looking for *</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          {/* DOB */}
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

          {/* Religion */}
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
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Buddhist">Buddhist</option>
                <option value="Jain">Jain</option>
              </select>
              {errors.religion && <span className="error-text">{errors.religion}</span>}
            </div>

            <div className="form-group">
              <label>Caste</label>
              <input
                type="text"
                name="caste"
                placeholder="(Optional)"
                value={formData.caste}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Mother Tongue */}
          <div className="form-group">
            <label>Mother Tongue</label>
            <input
              type="text"
              name="motherTongue"
              placeholder="(Optional)"
              value={formData.motherTongue}
              onChange={handleChange}
            />
          </div>

          {/* Terms */}
          <div className="form-group checkbox">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
            />
            <label>
              I agree to the Terms & Conditions and Privacy Policy *
            </label>
            {errors.acceptTerms && <span className="error-text">{errors.acceptTerms}</span>}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
