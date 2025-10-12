import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  FaUserCircle, FaChartBar, FaUsersCog, FaSignOutAlt
  , FaHome, FaClipboardList, FaCalendarAlt, FaGavel, FaChartPie, FaBell, FaLock, FaFileAlt, FaCog,
  
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function CreateUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'clerk' });
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  // Add missing searchTerm state
  const [searchTerm, setSearchTerm] = useState('');

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
      await axios.post('https://courtcase-backend.onrender.com/api/users', form);
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

  // Add markAsRead function to handle notification status
  const markAsRead = async (notificationId) => {
    try {
      // Optionally, send a request to update notification status on the server
      await axios.patch(`https://courtcase-backend.onrender.com/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "Read" } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header style={{ position: "sticky", top: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.1)", zIndex: 1000, padding: "12px 0" }}>
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
          <a className="navbar-brand fw-bold" href="#" style={{ color: "#007bff" }}>
            CourtSys
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu" aria-controls="mobileMenu">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end" style={{ display: "flex", justifyContent: "space-evenly" }}>
            <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end" style={{ marginLeft: 250 }}>
              <form className="d-flex mx-3" style={{ flex: 8, maxWidth: 400 }}>
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search users..."
                  aria-label="Search"
                  style={{ borderRadius: 30 }}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                />
              </form>
            </div>

            <div className="navbar-collapse d-none d-lg-flex justify-content-end">
              {/* Notifications */}
              <div className="nav-item me-3 position-relative" ref={notificationsRef}>
                <FaBell
                  size={22}
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowNotifications(!showNotifications)}
                />
                {notifications.filter((n) => n.status === "Unread").length > 0 && (
                  <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                    {notifications.filter((n) => n.status === "Unread").length}
                  </span>
                )}

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div
                    className="dropdown-menu show shadow p-2"
                    style={{
                      right: 0,
                      position: "absolute",
                      width: "350px",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    {notifications.length === 0 ? (
                      <p className="text-center my-2">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`notification-item p-2 mb-1 ${n.status === "Unread" ? "bg-light" : ""}`}
                          style={{ cursor: "pointer", borderRadius: "5px" }}
                          onClick={() => markAsRead(n._id)}
                        >
                          <strong>{n.title || "New Case Assigned"}</strong>
                          <p style={{ margin: 0, fontSize: "0.85rem" }}>{n.message}</p>
                          <small className="text-muted">{new Date(n.sentAt).toLocaleString()}</small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User */}
              <div className="position-relative" ref={userDropdownRef}>
                <button className="btn btn-light d-flex align-items-center" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                  <FaUserCircle size={28} className="me-2" />
                  <span>{user?.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="dropdown-menu show shadow p-2" style={{ right: 0, position: "absolute" }}>
                    <span style={{ color: "#6c757d", fontSize: "0.7em" }}>{user?.email}</span>
                    <button className="dropdown-item d-flex align-items-center" onClick={() => navigate("/change-password")}>
                      <FaLock className="me-1" /> Change Password
                    </button>
                    <button className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                      <FaSignOutAlt className="me-1" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Offcanvas Menu */}
        <div className="offcanvas offcanvas-start" tabIndex="-1" id="mobileMenu" aria-labelledby="mobileMenuLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="mobileMenuLabel">Menu</h5>
            <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <ul className="list-group">
              <li className="list-group-item" onClick={() => navigate("/judgedashboard")}><FaHome /> Home</li>
              <li className="list-group-item" onClick={() => navigate("/casesassigned")}><FaClipboardList /> Cases Assigned</li>
              <li className="list-group-item" onClick={() => navigate("/schedulehearing")}><FaCalendarAlt /> Hearing Schedule</li>
              <li className="list-group-item" onClick={() => navigate("/judgmenthistory")}><FaGavel /> Judgment History</li>
              <li className="list-group-item" onClick={() => navigate("/progress")}><FaChartPie /> Case Progress</li>
              <li className="list-group-item" onClick={() => navigate("/notification")}>
                <div className=" position-relative" ref={notificationsRef}>
                  <FaBell
                    size={22}
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowNotifications(!showNotifications)}
                  />
                  <div style={{ marginLeft: '-28px', marginTop: '-90px', display: 'inline' }}>
                    {notifications.filter((n) => n.status === "Unread").length > 0 && (
                      <span className="badge bg-danger rounded-pill start-100 translate-middle"
                        style={{ fontSize: '0.6rem'}}
                      >
                        {notifications.filter((n) => n.status === "Unread").length}
                      </span>
                    )}
                  </div>
                </div>            
                Notifications</li>
            </ul>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="admin-content" style={{ padding: 0 }}>
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <ul className="admin-nav">
            <li onClick={() => navigate('/admindashboard')}><FaHome /> Home</li>
            <li className="active"><FaUsersCog /> Manage Users</li>
            <li onClick={() => navigate('/managecases')}><FaClipboardList /> Manage Cases</li>
            <li onClick={() => navigate('/reports')}><FaFileAlt /> Reports</li>
            <li onClick={() => navigate('/settings')}><FaCog /> Settings</li>
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
