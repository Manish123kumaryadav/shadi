import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './Auth.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    mobile: location.state?.mobile || '',
    otp: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    if (formData.mobile.replace(/\D/g, '').length < 10) {
      newErrors.mobile = 'Enter a valid mobile number';
    }

    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true);
        const response = await authService.sendOtp(formData.mobile);
        setOtpSent(true);
        setDevOtp(response.data.devOtp || '');
        setErrors({});
      } catch (error) {
        setErrors({
          form: error.response?.data?.message || 'Could not send OTP. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.otp) newErrors.otp = 'OTP is required';

    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true);
        const response = await authService.verifyOtp(formData.mobile, formData.otp);

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        onLoginSuccess();
        navigate('/browse');
      } catch (error) {
        setErrors({
          form: error.response?.data?.message || 'OTP verification failed. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Login with OTP sent to your registered mobile</p>

        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
          {errors.form && <div className="alert alert-error">{errors.form}</div>}
          <div className="form-group">
            <label>Mobile Number *</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter registered mobile number"
              value={formData.mobile}
              onChange={handleChange}
              className={errors.mobile ? 'input-error' : ''}
              disabled={otpSent}
            />
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>

          {otpSent && (
            <>
              {devOtp && (
                <div className="alert alert-info">
                  Development OTP: <strong>{devOtp}</strong>
                </div>
              )}

              <div className="form-group">
                <label>OTP *</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6 digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  className={errors.otp ? 'input-error' : ''}
                  maxLength="6"
                />
                {errors.otp && <span className="error-text">{errors.otp}</span>}
              </div>
            </>
          )}

          {otpSent && (
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => {
                setOtpSent(false);
                setDevOtp('');
                setFormData((prev) => ({ ...prev, otp: '' }));
              }}
            >
              Change Mobile Number
            </button>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : otpSent ? 'Verify OTP & Login' : 'Send OTP'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
