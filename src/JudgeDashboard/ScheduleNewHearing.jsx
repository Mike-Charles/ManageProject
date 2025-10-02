// ScheduleNewHearing.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
  FaClipboardList,
  FaChevronDown,
  FaLock,
  FaBell,
  FaCalendarAlt,
  FaGavel,
  FaSave,
  FaChartPie,
} from 'react-icons/fa';
import './JudgeDashboard.css';

export default function ScheduleNewHearing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    caseId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    room: '',
  });
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef();

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "Read" } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Load user and data
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) navigate('/login');
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'judge') navigate('/unauthorized');
    setUser(parsedUser);
    fetchAssignedCases(parsedUser._id);
    fetchNotifications(parsedUser._id);
  }, [navigate]);

  const fetchAssignedCases = async (judgeId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cases/assigned/${judgeId}`);
      setCases(res.data);
    } catch (err) {
      console.error('Error fetching assigned cases:', err);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { caseId, startDate, startTime, endDate, endTime, room } = formData;
    if (!caseId || !startDate || !startTime || !endDate || !endTime || !room) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/schedules`, {
        caseId,
        startDate,
        startTime,
        endDate,
        endTime,
        room,
        assignedJudge: user._id,
        status: 'Scheduled',
      });
      alert('Hearing scheduled successfully!');
      setFormData({ caseId: '', startDate: '', startTime: '', endDate: '', endTime: '', room: '' });
      navigate('/schedulehearing');
    } catch (err) {
      console.error('Error scheduling hearing:', err.response || err);
      alert('Failed to schedule hearing. Please try again.');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <header
        style={{
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 1000,
          padding: "12px 0",
        }}
      >
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
          {/* Logo */}
          <a className="navbar-brand fw-bold" href="#" style={{ color: "#007bff" }}>
            CourtSys
          </a>

          {/* Mobile Menu Button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
            aria-controls="mobileMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Desktop: Search + Notifications + User */}
          <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end" style={{display: "flex", justifyContent: "space-evenly"}}>
            {/* Search */}
            <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end" style={{marginLeft: 250}}>
              <form className="d-flex mx-3" style={{ flex: 8, maxWidth: 400 }}>
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search cases..."
                  aria-label="Search"
                  style={{ borderRadius: 30}}
                  value={formData.caseId}
                  readOnly
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
                <button
                  className="btn btn-light d-flex align-items-center"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <FaUserCircle size={28} className="me-2" />
                  <span>{user?.name}</span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="dropdown-menu show shadow p-2"
                    style={{ right: 0, position: "absolute" }}
                  >
                    <span style={{ color: "#6c757d", fontSize: "0.7em" }}>{user?.email}</span>
                    <button
                      className="dropdown-item d-flex align-items-center"
                      onClick={() => navigate("/change-password")}
                    >
                      <FaLock className="me-1" /> Change Password
                    </button>
                    <button
                      className="dropdown-item d-flex align-items-center"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="me-1" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Offcanvas Menu */}
        <div
          className="offcanvas offcanvas-start"
          tabIndex="-1"
          id="mobileMenu"
          aria-labelledby="mobileMenuLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="mobileMenuLabel">
              Menu
            </h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="list-group">
              <li className="list-group-item" onClick={() => navigate("/judgedashboard")}>
                <FaHome /> Home
              </li>
              <li className="list-group-item" onClick={() => navigate("/casesassigned")}>
                <FaClipboardList /> Assigned Cases
              </li>
              <li className="list-group-item" onClick={() => navigate("/schedulehearing")}>
                <FaCalendarAlt /> Hearing Schedule
              </li>
              <li className="list-group-item" onClick={() => navigate("/progress")}>
                <FaChartPie /> Cases Progress
              </li>              
              <li className="list-group-item" onClick={() => navigate("/judgmenthistory")}>
                <FaGavel /> Judgment History
              </li>
              <li className="list-group-item" onClick={() => navigate("/notification")}>
                <FaBell /> Notifications
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Rest of original ScheduleNewHearing content */}
      <div className="admin-content" style={{ marginTop: "-59px" }}>
        {/* Sidebar */}
        <aside className="admin-sidebar" style={{ width: "250px" }}>
          <ul className="admin-nav">
            <li onClick={() => navigate('/judgedashboard')}><FaHome /> Home</li>
            <li onClick={() => navigate('/casesassigned')}><FaClipboardList /> Assigned Cases</li>
            <li className="active" onClick={() => navigate('/schedulehearing')}><FaCalendarAlt /> Hearing Schedule</li>
            <li onClick={() => navigate("/progress")}>
              <FaChartPie /> Cases Progress
            </li> 
            <li onClick={() => navigate('/judgmenthistory')}><FaGavel /> Judgment History</li>
            <li onClick={() => navigate('/notification')}>
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
        </aside>

        {/* Main Content */}
        <main className="admin-main" style={{ paddingBottom: '130px' }}>
          {/* Schedule Form */}
          <section className="admin-card">
            <h3>Schedule New Hearing</h3>
            <form onSubmit={handleSubmit} className="schedule-form">
              <div className="form-group">
                <label>Select Case</label>
                <select
                  name="caseId"
                  value={formData.caseId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choose a Case --</option>
                  {cases.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Room</label>
                <input type="text" name="room" value={formData.room} onChange={handleChange} placeholder="e.g., Courtroom 2" required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-create" style={{ marginRight: '10px' }}>
                  <FaSave style={{ marginRight: '6px' }} /> Save
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setFormData({ caseId: '', startDate: '', startTime: '', endDate: '', endTime: '', room: '' })}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
