import React from 'react';
import { LockKeyhole } from 'lucide-react';

const AdminLogin = ({ form, error, isLoading, onChange, onSubmit }) => (
  <div className="admin-login-page">
    <form className="admin-login-card" onSubmit={onSubmit}>
      <LockKeyhole size={34} />
      <h1>Admin Login</h1>
      <p>Sign in with role 1 admin access to manage reports, sections, and table maintenance.</p>

      {error && <div className="admin-error">{error}</div>}

      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) => onChange('email', event.target.value)}
          placeholder="admin@example.com"
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={form.password}
          onChange={(event) => onChange('password', event.target.value)}
          placeholder="Enter password"
          required
        />
      </label>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Login to Admin'}
      </button>
    </form>
  </div>
);

export default AdminLogin;
