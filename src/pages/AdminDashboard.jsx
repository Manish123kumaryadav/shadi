import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import AdminLogin from '../admin/AdminLogin';
import AdminMenu from '../admin/AdminMenu';
import AdminOverview from '../admin/AdminOverview';
import { getAdminSection } from '../admin/adminConfig';
import { sectionComponents } from '../admin/sections';
import { adminService, authService } from '../services/api';
import './AdminDashboard.css';

const emptySection = {
  table: '',
  label: '',
  description: '',
  protected: false,
  count: 0,
  columns: [],
  rows: [],
};

const AdminDashboard = () => {
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));
  const [activeSection, setActiveSection] = useState('overview');
  const [report, setReport] = useState(null);
  const [sectionData, setSectionData] = useState(emptySection);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [error, setError] = useState('');
  const [sectionError, setSectionError] = useState('');

  const activeMeta = useMemo(() => getAdminSection(activeSection), [activeSection]);
  const ActiveSectionComponent = sectionComponents[activeSection];

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setReport(null);
    setSectionData(emptySection);
    setIsAuthenticated(false);
  };

  const loadReport = async () => {
    try {
      setError('');
      const response = await adminService.getReport();
      setReport(response.data);
      setIsAuthenticated(true);
    } catch (requestError) {
      if ([401, 403].includes(requestError.response?.status)) {
        clearSession();
      }
      setError(requestError.response?.data?.message || 'Could not load admin report');
    }
  };

  const loadSection = async (section = activeSection) => {
    if (section === 'overview') return;

    try {
      setSectionError('');
      setSectionLoading(true);
      const response = await adminService.getSection(section);
      setSectionData(response.data);
    } catch (requestError) {
      setSectionError(requestError.response?.data?.message || 'Could not load section data');
    } finally {
      setSectionLoading(false);
    }
  };

  const refreshCurrent = async () => {
    if (activeSection === 'overview') {
      await loadReport();
      return;
    }

    await loadSection(activeSection);
    await loadReport();
  };

  useEffect(() => {
    async function bootstrapAdmin() {
      if (!localStorage.getItem('token')) {
        setIsLoading(false);
        return;
      }

      await loadReport();
      setIsLoading(false);
    }

    bootstrapAdmin();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadSection(activeSection);
    }
  }, [activeSection, isAuthenticated]);

  const handleAdminLogin = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setIsLoading(true);
      const response = await authService.login(adminForm.email, adminForm.password);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      await loadReport();
      setIsAuthenticated(true);
      setActiveSection('overview');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Admin login failed');
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setAdminForm({ email: '', password: '' });
    setActiveSection('overview');
  };

  const handleDeleted = async () => {
    await loadSection(activeSection);
    await loadReport();
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        form={adminForm}
        error={error}
        isLoading={isLoading}
        onChange={(field, value) => setAdminForm((prev) => ({ ...prev, [field]: value }))}
        onSubmit={handleAdminLogin}
      />
    );
  }

  return (
    <div className="admin-shell">
      <AdminMenu
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onLogout={handleLogout}
      />

      <div className="admin-page">
        <section className="admin-hero">
          <div>
            <p className="admin-kicker">Operations dashboard</p>
            <h1>{activeMeta.label}</h1>
            <p>
              {activeSection === 'overview'
                ? 'Monitor users, roles, matches, conversations, and database activity.'
                : 'Interactive database-backed section with search, details, CSV, and maintenance actions.'}
            </p>
          </div>
          <button className="admin-refresh" onClick={refreshCurrent}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </section>

        {error && <div className="admin-error">{error}</div>}

        {activeSection === 'overview' ? (
          <AdminOverview report={report} onSelectSection={setActiveSection} />
        ) : ActiveSectionComponent ? (
          <ActiveSectionComponent
            data={sectionData}
            isLoading={sectionLoading}
            error={sectionError}
            onRefresh={() => loadSection(activeSection)}
            onDeleted={handleDeleted}
          />
        ) : (
          <div className="admin-loading">Section not found</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
