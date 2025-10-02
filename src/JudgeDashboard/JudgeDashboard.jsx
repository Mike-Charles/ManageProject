// JudgeDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  FaEdit,
  FaChartPie,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./JudgeDashboard.css";
import Dropdown from "react-bootstrap/Dropdown";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

export default function JudgeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [assignedCases, setAssignedCases] = useState([]);
  const [, setHearings] = useState([]);
  const [currentHearings, setCurrentHearings] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [caseStats, setCaseStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // NEW
  const casesPerPage = 6;

  const userDropdownRef = useRef();
  const notificationsRef = useRef(); // NEW

  // Keep time updated
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load user & fetch data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "judge") return navigate("/unauthorized");

    setUser(parsedUser);

    fetchAssignedCases(parsedUser._id);
    fetchStats(parsedUser._id);
    fetchNotifications(parsedUser._id);
    fetchHearings(parsedUser._id);
  }, [navigate]);

  // API Calls
  const fetchAssignedCases = async (judgeId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cases/assigned/${judgeId}`);
      setAssignedCases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async (judgeId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cases/status-stats/judge/${judgeId}`);
      setCaseStats(res.data);
    } catch (err) {
      console.error(err);
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

  const fetchHearings = async (judgeId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/schedules/judge/${judgeId}`);
      setHearings(res.data);
      setCurrentHearings(res.data.slice(0, 5));
    } catch (err) {
      console.error("Error fetching hearings:", err);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/read/${notificationId}`);
      fetchNotifications(user._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Pagination + Search
  const filteredCases = assignedCases.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLast = currentPage * casesPerPage;
  const indexOfFirst = indexOfLast - casesPerPage;
  const currentCases = filteredCases.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);

  return (
    <div className="admin-dashboard" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", overflowY: "auto" }}>
      {/* HEADER */}
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
                  placeholder="Search cases..."
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

      {/* Rest of JudgeDashboard content remains unchanged */}
      <div className="admin-content" style={{ marginTop: "-59px"}}>
        {/* Sidebar */}
        <aside className="admin-sidebar" style={{ width: "300px" }}>
          <ul className="admin-nav">
            <li className="active" onClick={() => navigate("/judgedashboard")}><FaHome /> Home</li>
            <li onClick={() => navigate("/casesassigned")}><FaClipboardList /> Cases Assigned</li>
            <li onClick={() => navigate("/schedulehearing")}><FaCalendarAlt /> Hearing Schedule</li>
            <li onClick={() => navigate("/progress")}><FaChartPie /> Cases Progress</li>
            <li onClick={() => navigate("/judgmenthistory")}><FaGavel /> Judgment History</li>
            <li onClick={() => navigate("/notification")}>
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
            </div> Notifications</li>
          </ul>
        </aside>

        {/* Main content (assigned cases + hearings) remains unchanged */}
        {/* Main content */}
        <div className="admin-main" style={{paddingBottom: "130px"}}>
          {/* Stat Cards */}
          <section className="admin-grid">
            <div className="admin-card stat-card assigned-cases">
              <div className="stat-icon" style={{ fontSize: "3rem", color: "green" }}>
                <FaClipboardList />
              </div>
              <div className="stat-info">
                <h3>Assigned Cases</h3>
                <p>{assignedCases.length}</p>
              </div>
            </div>

            <div className="admin-card stat-card in-progress-cases">
              <div className="stat-icon" style={{ fontSize: "3rem", color: "orange" }}>
                <FaEdit />
              </div>
              <div className="stat-info">
                <h3>In Progress</h3>
                <p>{caseStats.InProgress || 0}</p>
              </div>
            </div>

            <div className="admin-card stat-card scheduled-cases">
              <div className="stat-icon" style={{ fontSize: "3rem", color: "blue" }}>
                <FaCalendarAlt />
              </div>
              <div className="stat-info">
                <h3>Scheduled</h3>
                <p>{caseStats.Scheduled || 0}</p>
              </div>
            </div>
          </section>

          {/* Assigned Cases Table */}
          <section className="admin-card card-table">
            <h3>My Assigned Cases</h3>
            <div style={{ margin: "1rem 0" }}>
              <input
                type="text"
                value={searchTerm}
                placeholder="Search cases..."
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>

            <div className="table-responsive table-card">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Filed By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCases.map((c) => (
                    <tr key={c._id}>
                      <td>{c.title}</td>
                      <td>{c.description}</td>
                      <td>{c.filedByName || "N/A"}</td>
                      <td>{c.status || "Assigned"}</td>
                      <td>
                        <button
                          className="btn btn-edit"
                          onClick={() => navigate(`/casesassigned`)}
                        >
                          <FaEdit /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </section>

          {/* Upcoming Hearings Table */}
          <section className="admin-card card-table" style={{ marginTop: "20px" }}>
            <h3>Upcoming Hearings</h3>
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
                  </tr>
                </thead>
                <tbody>
                  {currentHearings.map((h) => (
                    <tr key={h._id}>
                      <td>{h.caseId?.caseNumber || "N/A"}</td>
                      <td>{h.caseId?.title || "N/A"}</td>
                      <td>{new Date(h.startDate).toLocaleDateString()}</td>
                      <td>{h.startTime}</td>
                      <td>{new Date(h.endDate).toLocaleDateString()}</td>
                      <td>{h.endTime}</td>
                      <td>{h.room}</td>
                      <td>{h.status}</td>
                    </tr>
                  ))}
                  {currentHearings.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center" }}>
                        No hearings scheduled
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
