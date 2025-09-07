import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>Church Membership</h1>
        </div>
        
        <ul className="nav-links">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/members" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Members
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/payments" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Payments
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
