// ScheduleHearing.jsx
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
  FaPlus,
  FaChartPie,
} from 'react-icons/fa';
import './JudgeDashboard.css';

export default function ScheduleHearing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const hearingsPerPage = 6;
  const userDropdownRef = useRef();
  const notificationsRef = useRef();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) navigate('/login');

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'judge') navigate('/unauthorized');
    setUser(parsedUser);

    fetchHearings(parsedUser._id);
    fetchNotifications(parsedUser._id);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchHearings = async (judgeId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/schedules/judge/${judgeId}`);
      setHearings(res.data);
    } catch (err) {
      console.error('Error fetching hearings:', err);
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

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: 'Read' } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Filter hearings by case title, case number, or status
  const filteredHearings = hearings.filter(
    (h) =>
      (h.caseId?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.caseId?.caseNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLast = currentPage * hearingsPerPage;
  const indexOfFirst = indexOfLast - hearingsPerPage;
  const currentHearings = filteredHearings.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredHearings.length / hearingsPerPage);

  const handleJudgmentPlaced = (caseId) => {
    setHearings((prev) => prev.filter((h) => h.caseId?._id !== caseId));
  };

  return (
    <div className="admin-dashboard" style={{ padding: 0, margin: 0, minHeight: '100vh' }}>
      {/* HEADER */}
      <header
        style={{
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000,
          padding: '12px 0',
        }}
      >
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
          {/* Logo */}
          <a className="navbar-brand fw-bold" href="#" style={{ color: '#007bff' }}>
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
          <div
            className="collapse navbar-collapse d-none d-lg-flex justify-content-end"
            style={{ display: 'flex', justifyContent: 'space-evenly' }}
          >
            {/* Search */}
            <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end" style={{ marginLeft: 250 }}>
              <form className="d-flex mx-3" style={{ flex: 8, maxWidth: 400 }}>
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search hearings..."
                  aria-label="Search"
                  style={{ borderRadius: 30 }}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
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
                    style={{ right: 0, position: 'absolute' }}
                  >
                    <span style={{ color: '#6c757d', fontSize: '0.7em' }}>{user?.email}</span>
                    <button
                      className="dropdown-item d-flex align-items-center"
                      onClick={() => navigate('/change-password')}
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
          <div className="offcanvas-body" >
            <ul className="list-group">
              <li className="list-group-item" onClick={() => navigate('/judgedashboard')}>
                <FaHome /> Home
              </li>
              <li className="list-group-item" onClick={() => navigate('/casesassigned')}>
                <FaClipboardList /> Cases Assigned
              </li>
              <li className="list-group-item" onClick={() => navigate('/schedulehearing')}>
                <FaCalendarAlt /> Hearing Schedule
              </li>
              <li className="list-group-item" onClick={() => navigate('/judgmenthistory')}>
                <FaGavel /> Judgment History
              </li>
              <li className="list-group-item" onClick={() => navigate('/progress')}>
                <FaChartPie /> Cases Progress
              </li>
              <li className="list-group-item" onClick={() => navigate('/notification')}>
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
                Notifications
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Rest of ScheduleHearing content remains unchanged */}
      <div className="admin-content" style={{ marginTop: '-59px' }}>
        {/* Sidebar */}
        <aside className="admin-sidebar" style={{ width: '250px' }}>
          <ul className="admin-nav">
            <li onClick={() => navigate('/judgedashboard')}>
              <FaHome /> Home
            </li>
            <li onClick={() => navigate('/casesassigned')}>
              <FaClipboardList /> Assigned Cases
            </li>
            <li className="active">
              <FaCalendarAlt /> Hearing Schedule
            </li>
            <li onClick={() => navigate('/progress')}>
              <FaChartPie /> Case Progress
            </li>            
            <li onClick={() => navigate('/judgmenthistory')}>
              <FaGavel /> Judgment History
            </li>
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
          <section className="admin-card card-table">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Hearings</h3>
              <button className="btn btn-create" onClick={() => navigate('/schedulenewhearing')}>
                <FaPlus style={{ marginRight: '6px' }} /> Schedule New Hearing
              </button>
            </div>

            {/* Search */}
            <div style={{ margin: '1rem 0' }}>
              <input
                type="text"
                value={searchTerm}
                placeholder="Search hearings..."
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>

            {/* Hearings Table */}
            <div className="table-responsive table-card">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Title</th>
                    <th>Start Date</th>
                    <th>Start Time</th>
                    <th>End Date</th>
                    <th>End Time</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHearings.length > 0 ? (
                    currentHearings.map((h) => (
                      <tr key={h._id}>
                        <td>{h.caseId?.caseNumber || 'N/A'}</td>
                        <td>{h.caseId?.title || 'N/A'}</td>
                        <td>{new Date(h.startDate).toLocaleDateString()}</td>
                        <td>{h.startTime}</td>
                        <td>{new Date(h.endDate).toLocaleDateString()}</td>
                        <td>{h.endTime}</td>
                        <td>{h.room}</td>
                        <td>
                          <span
                            style={{
                              color:
                                h.status === 'Closed'
                                  ? 'red'
                                  : h.status === 'In Progress'
                                  ? 'green'
                                  : 'blue',
                              fontWeight: 'bold',
                            }}
                          >
                            {h.status}
                          </span>
                        </td>
                        <td>
                          {h.status === 'Closed' && (
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                navigate(`/placejudgment/${h.caseId?._id}`);
                                handleJudgmentPlaced(h.caseId?._id);
                              }}
                            >
                              Place Judgment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center' }}>
                        No hearings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
