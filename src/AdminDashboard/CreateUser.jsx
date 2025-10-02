import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaUserCircle, FaChartBar, FaUsersCog, FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function CreateUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'clerk' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== 'admin') {
        navigate('/unauthorized');
      } else {
        setUser(parsed);
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users', form);
      setMessage('✅ User created successfully!');
      setForm({ name: '', email: '', password: '', role: 'clerk' });
    } catch (err) {
      console.error('Create user error:', err.response?.data || err.message || err);
      setMessage('❌ Failed to create user: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-logo">CourtSys</div>
        <div className="admin-user">
          <FaUserCircle size={32} />
          <div>
            <div className="admin-user-name">{user?.name}</div>
            <div className="admin-user-email">{user?.email}</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="admin-content">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <ul className="admin-nav">
            <li onClick={() => navigate('/admin-dashboard')}>
              <FaChartBar /> Dashboard
            </li>
            <li onClick={() => navigate('/manageusers')}>
              <FaUsersCog /> Manage Users
            </li>
            <li onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </li>
          </ul>
        </aside>

        {/* Main Section */}
        <main className="admin-main">
          <div className="admin-card full-width">
            <h2>Create New User</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
              <div>
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Role</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="admin">Admin</option>
                  <option value="clerk">Clerk</option>
                  <option value="registrar">Registrar</option>
                  <option value="lawyer">Lawyer</option>
                  <option value="judge">Judge</option>
                </select>
              </div>

              <button type="submit" className="btn btn-create">Create User</button>
            </form>

            {message && (
              <p style={{ marginTop: '1rem', color: message.includes('successfully') ? 'green' : 'red' }}>
                {message}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
