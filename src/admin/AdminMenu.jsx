import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { adminSections } from './adminConfig';

const AdminMenu = ({ activeSection, onSelectSection, onLogout }) => (
  <aside className="admin-sidebar">
    <div className="admin-brand">
      <ShieldCheck size={24} />
      <div>
        <strong>Shadi Admin</strong>
        <span>Role 1 access</span>
      </div>
    </div>

    <nav className="admin-side-menu">
      {adminSections.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          className={activeSection === key ? 'active' : ''}
          onClick={() => onSelectSection(key)}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </nav>

    <button className="admin-side-logout" onClick={onLogout}>
      Logout
    </button>
  </aside>
);

export default AdminMenu;
