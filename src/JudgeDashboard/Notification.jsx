// NotificationsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
  FaClipboardList,
  FaLock,
  FaBell,
  FaCalendarAlt,
  FaGavel,
  FaChartPie,
} from "react-icons/fa";
import "./JudgeDashboard.css";

export default function NotificationsPage() {
  const navigate = useNavigate();

  // User + data
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Header / UI controls
  const [dropdownOpen, setDropdownOpen] = useState(false); // user dropdown
  const [showNotifications, setShowNotifications] = useState(false); // bell dropdown
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Search + pagination (header uses these in your supplied code)
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 6;

  // Refs to close dropdowns on outside click
  const dropdownRef = useRef();
  const userDropdownRef = useRef();
  const notificationsRef = useRef();

  // --- CLICK OUTSIDE: close any open dropdowns ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOAD USER, SYNC MISSING NOTIFICATIONS, START POLLING ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "judge") return navigate("/unauthorized");

    setUser(parsedUser);

    // Sync missing assigned-case notifications for this judge,
    // then fetch notifications immediately.
    (async () => {
      try {
        await axios.post(`https://courtcase-backend.onrender.com/api/notifications/sync/${parsedUser._id}`);
      } catch (err) {
        // sync can fail if endpoint wasn't mounted — still attempt to fetch
        console.error("Sync error (okay if endpoint not present):", err.message || err);
      } finally {
        await fetchNotifications(parsedUser._id);
      }
    })();

    // Polling every 10s for updates
    const interval = setInterval(() => {
      fetchNotifications(parsedUser._id).catch((err) =>
        console.error("Polling fetch error:", err)
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  // --- FETCH NOTIFICATIONS (populated case info expected from backend) ---
  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(`https://courtcase-backend.onrender.com/api/notifications/${userId}`);
      // Sort unread first, then newest
      const sorted = (res.data || []).sort((a, b) => {
        if (a.status === "Unread" && b.status === "Read") return -1;
        if (a.status === "Read" && b.status === "Unread") return 1;
        return new Date(b.sentAt) - new Date(a.sentAt);
      });
      setNotifications(sorted);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      throw err;
    }
  };

  // --- MARK AS READ (updates UI immediately without full refetch) ---
  const markAsRead = async (notificationId) => {
    try {
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, status: "Read" } : n))
      );

      await axios.patch(`https://courtcase-backend.onrender.com/api/notifications/read/${notificationId}`);
      // backend updated; we already updated UI optimistically
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // on error, re-fetch to get accurate state
      if (user) fetchNotifications(user._id).catch(() => {});
    }
  };

  // --- Logout ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Helpers
  const unreadCount = notifications.filter((n) => n.status === "Unread").length;

  // Render
  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 1000,
          padding: "12px 0",
        }}
      >
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
          <a className="navbar-brand fw-bold" href="#" style={{ color: "#007bff" }}>
            CourtSys
          </a>

          {/* Mobile toggler (kept from your code) */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
            aria-controls="mobileMenu"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className="collapse navbar-collapse d-none d-lg-flex justify-content-end"
            style={{ display: "flex", justifyContent: "space-evenly" }}
          >
            {/* Search (kept because your original header referenced it) */}
            <div
              className="collapse navbar-collapse d-none d-lg-flex justify-content-end"
              style={{ marginLeft: 250 }}
            >
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
              {/* Bell + dropdown */}
              <div className="nav-item me-3 position-relative" ref={notificationsRef}>
                <FaBell
                  size={22}
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowNotifications((s) => !s)}
                />
                {unreadCount > 0 && (
                  <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                    {unreadCount}
                  </span>
                )}

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
                          className={`notification-item p-2 mb-1 ${
                            n.status === "Unread" ? "bg-light" : ""
                          }`}
                          style={{ cursor: "pointer", borderRadius: "5px" }}
                          onClick={() => {
                            // mark as read and optionally navigate to case
                            markAsRead(n._id);
                            // If you want to navigate to case details:
                            // if (n.caseId && n.caseId._id) navigate(`/cases/${n.caseId._id}`);
                          }}
                        >
                          <strong>{n.title || "New Case Assigned"}</strong>
                          <p style={{ margin: 0, fontSize: "0.85rem" }}>{n.message}</p>
                          {n.caseId && n.caseId.caseNumber && (
                            <small className="text-muted d-block">
                              Case: {n.caseId.caseNumber} — {n.caseId.title || ""}
                            </small>
                          )}
                          <small className="text-muted">{new Date(n.sentAt).toLocaleString()}</small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User dropdown */}
              <div className="position-relative" ref={userDropdownRef}>
                <button
                  className="btn btn-light d-flex align-items-center"
                  onClick={() => setUserDropdownOpen((s) => !s)}
                >
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
            <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" />
          </div>
          <div className="offcanvas-body">
            <ul className="list-group">
              <li className="list-group-item" onClick={() => navigate("/judgedashboard")}><FaHome /> Home</li>
              <li className="list-group-item" onClick={() => navigate("/casesassigned")}><FaClipboardList /> Assigned Cases</li>
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

      {/* CONTENT */}
      <div className="admin-content" style={{ paddingTop: 0 }}>
        <aside className="admin-sidebar" style={{ width: "250px" }}>
          <ul className="admin-nav">
            <li onClick={() => navigate("/judgedashboard")}><FaHome /> Home</li>
            <li onClick={() => navigate("/casesassigned")}><FaClipboardList /> Assigned Cases</li>
            <li onClick={() => navigate("/schedulehearing")}><FaCalendarAlt /> Hearing Schedule</li>
            <li onClick={() => navigate("/progress")}><FaChartPie /> Cases Progress</li>
            <li onClick={() => navigate("/judgmenthistory")}><FaGavel /> Judgment History</li>
            <li className="active" onClick={() => navigate("/notifications")}>
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

        <main className="admin-main" style={{ paddingBottom: "130px" }}>
          
            <h3>Notifications</h3>
            {notifications.length === 0 ? (
              <p>No notifications available.</p>
            ) : (
              <ul className="notifications-gmail-style">
                {notifications.map((n) => (
                  <section className="mb-2 " style={{backgroundColor: "white", padding: 10, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,3,0.1)"}}>
                  <li
                    key={n._id}
                    className={`notification-item ${n.status === "Read" ? "read" : "unread"}`}
                    onClick={() => markAsRead(n._id)}
                  >
                    <div className="notification-content">
                      <div className="notification-title">
                        <FaBell className="me-2 text-primary" />
                        <strong>{n.title}</strong>
                      </div>

                      <p className="notification-message">{n.message}</p>

                      {n.caseId && (
                        <p style={{ fontSize: "0.85rem", color: "#555" }}>
                          Case Number: {n.caseId.caseNumber} | Status: {n.caseId.status}
                        </p>
                      )}
                    </div>

                    <div className="notification-timestamp">{new Date(n.sentAt).toLocaleString()}</div>
                  </li>
                  </section>
                ))}
              </ul>
            )}
          
        </main>
      </div>
    </div>
  );
}
